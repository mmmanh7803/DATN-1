"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { topicService } from "@/lib/services/topicService";
import { useToast } from "@/contexts/ToastContext";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import { LessonTopicDto } from "@/types";
import VocabularyWordItem from "@/components/vocabulary/VocabularyWordItem";
import LearningActivities from "@/components/vocabulary/LearningActivities";
import { useActivities } from "@/hooks/useActivities";
import ActivityProgressChart from "@/components/vocabulary/ActivityProgressChart";
import { calculateVocabularyProgress, getTopicProgressFromBackend } from "@/lib/services/activityProgressService";
import { checkAndMarkVocabulary } from "@/lib/services/activityService";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [vocabularyProgress, setVocabularyProgress] = useState<any>(null);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");
  const [topicProgressFromBackend, setTopicProgressFromBackend] = useState<{
    totalActivities: number;
    completedActivities: number;
    progressPercentage: number;
  } | null>(null);
  
  // Sử dụng hook để quản lý completed activities (đồng bộ giữa các trang)
  const {
    completedActivityIds,
    loadCompletedActivities,
    topicCompletedStatus,
    unlockResult,
  } = useCompletedActivities({ topicId, autoCheckUnlock: true });

  const stats = topic
    ? {
        total: topic.words?.length || 0, // Đảm bảo dùng topic.words.length
        mastered: topic.words?.filter((w: any) => w.progress?.status === "Mastered").length || 0,
        learning: topic.words?.filter((w: any) => w.progress?.status === "Learning").length || 0,
        new: topic.words?.filter((w: any) => !w.progress || w.progress.status === "New").length || 0,
      }
    : { total: 0, mastered: 0, learning: 0, new: 0 };

  const progressPercentage = stats.total > 0
    ? Math.round(((stats.mastered + stats.learning) / stats.total) * 100)
    : 0;

  // Load activities from database
  const { activities } = useActivities({
    topicId,
    activeId: "vocabulary",
    completedIds: completedActivityIds,
    customLinks: topic?.hskLevel
      ? {
          "quick-memorize": `/topics/${topicId}/quick-memorize`,
        }
      : {},
  });

  // Tính progress dựa trên activities (hoạt động học) của lesson topic
  // Dùng useMemo để đảm bảo tính lại khi activities thay đổi
  const totalActivities = useMemo(() => activities.length, [activities]);
  const completedActivities = useMemo(() => activities.filter(a => a.isCompleted).length, [activities]);

  const loadTopicData = useCallback(async () => {
    if (!topicId) return;
    
    try {
      setLoading(true);
      console.log("Loading topic data for ID:", topicId);
      const topicData = await topicService.getTopicById(topicId);
      console.log("Loaded topic data:", topicData);
      setTopic(topicData);

      // Calculate vocabulary progress
      if (topicData.words && topicData.words.length > 0) {
        const progress = calculateVocabularyProgress(topicData.words);
        setVocabularyProgress(progress);
      }

      // Lấy progress của topic dựa trên activities từ backend
      const topicProgress = await getTopicProgressFromBackend(topicId);
      setTopicProgressFromBackend(topicProgress);

      // Completed activities được load tự động bởi hook useCompletedActivities
    } catch (error: any) {
      console.error("Error loading topic:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      if (error.response?.status === 403) {
        toast.warning("Bạn chưa hoàn thành chủ đề trước đó. Vui lòng hoàn thành chủ đề trước để mở khóa chủ đề này.");
        router.push("/courses");
      } else if (error.response?.status === 404) {
        toast.error("Chủ đề không tồn tại hoặc đã bị xóa.");
        router.push("/courses");
      } else {
        toast.error(`Lỗi khi tải dữ liệu: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [topicId, router, toast]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  // Hiển thị thông báo khi mở khóa topic tiếp theo
  useEffect(() => {
    if (unlockResult?.unlocked && unlockResult.nextTopicTitle) {
      setUnlockMessage(`🎉 Chúc mừng! Bạn đã mở khóa chủ đề "${unlockResult.nextTopicTitle}"`);
      setShowUnlockNotification(true);
      
      // Tự động ẩn sau 5 giây
      const timer = setTimeout(() => {
        setShowUnlockNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [unlockResult]);
  
  // Lắng nghe sự kiện topic-unlocked từ các component khác
  useEffect(() => {
    const handleTopicUnlocked = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.completedTopicId === topicId) {
        setUnlockMessage(`🎉 Chúc mừng! Bạn đã mở khóa chủ đề "${customEvent.detail.unlockedTopicTitle}"`);
        setShowUnlockNotification(true);
      }
    };
    
    window.addEventListener("topic-unlocked", handleTopicUnlocked);
    return () => window.removeEventListener("topic-unlocked", handleTopicUnlocked);
  }, [topicId]);

  // Lắng nghe sự kiện activity-completed để refresh progress bar
  useEffect(() => {
    const handleActivityCompleted = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventDetail = customEvent.detail;
      
      // Chỉ refresh nếu activity thuộc về topic này
      if (eventDetail?.topicId === topicId) {
        console.log("[Topics Page] Activity completed, refreshing topic progress:", eventDetail.activityId);
        
        // Refresh progress từ backend
        try {
          const topicProgress = await getTopicProgressFromBackend(topicId);
          setTopicProgressFromBackend(topicProgress);
          console.log("[Topics Page] Updated topic progress:", topicProgress);
          
          // Nếu là vocabulary activity, reload topic data để cập nhật vocabulary progress chart
          if (eventDetail.activityId === "vocabulary") {
            try {
              const topicData = await topicService.getTopicById(topicId);
              setTopic(topicData);
              
              if (topicData.words && topicData.words.length > 0) {
                const progress = calculateVocabularyProgress(topicData.words);
                setVocabularyProgress(progress);
                console.log("[Topics Page] Updated vocabulary progress after activity completed:", progress);
              }
            } catch (error) {
              console.error("[Topics Page] Error refreshing topic data after vocabulary completed:", error);
            }
          }
        } catch (error) {
          console.error("[Topics Page] Error refreshing topic progress:", error);
        }
      }
    };
    
    window.addEventListener("activity-completed", handleActivityCompleted);
    return () => window.removeEventListener("activity-completed", handleActivityCompleted);
  }, [topicId]);

  // Refresh progress khi completedActivityIds thay đổi (từ hook useCompletedActivities)
  // Sử dụng string representation để tránh infinite loop (không mutate array gốc)
  const completedActivityIdsString = useMemo(() => [...completedActivityIds].sort().join(','), [completedActivityIds]);
  
  useEffect(() => {
    if (!topicId) return;
    
    const refreshProgress = async () => {
      try {
        const topicProgress = await getTopicProgressFromBackend(topicId);
        setTopicProgressFromBackend(topicProgress);
      } catch (error) {
        console.error("[Topics Page] Error refreshing topic progress:", error);
      }
    };
    
    // Debounce để tránh refresh quá nhiều lần
    const timeoutId = setTimeout(refreshProgress, 500);
    return () => clearTimeout(timeoutId);
  }, [topicId, completedActivityIdsString]);

  // Hook useCompletedActivities tự động load completed activities

  // Tự động kiểm tra và đánh dấu vocabulary activity khi tất cả từ đã Mastered
  useEffect(() => {
    if (!topic || !topic.words || topic.words.length === 0) return;
    if (completedActivityIds.includes("vocabulary")) {
      console.log("[Topics Page] Vocabulary activity already completed, skipping check");
      return;
    }
    
    // Kiểm tra xem tất cả từ đã được đánh dấu là "Mastered" chưa
    const allWordsMastered = topic.words.every((w: any) => w.progress?.status === "Mastered");
    
    if (allWordsMastered && topic.words.length > 0) {
      console.log("[Topics Page] All words are Mastered, checking if vocabulary activity should be marked as completed");
      
      // Gọi API để kiểm tra và đánh dấu vocabulary activity
      checkAndMarkVocabulary({ topicId })
        .then((result: any) => {
          console.log("[Topics Page] checkAndMarkVocabulary result:", result);
          if (result.marked) {
            console.log("✅ [Topics Page] Activity 'vocabulary' đã được đánh dấu hoàn thành!");
            
            // Reload completed activities để cập nhật state
            loadCompletedActivities();
            
            // Dispatch event để đồng bộ với các component khác
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("activity-completed", {
                detail: { activityId: "vocabulary", topicId, hskLevel: undefined, partNumber: undefined }
              }));
            }
            
            // Reload topic progress
            getTopicProgressFromBackend(topicId).then((progress) => {
              setTopicProgressFromBackend(progress);
            }).catch((err) => {
              console.error("[Topics Page] Error reloading topic progress:", err);
            });
          }
        })
        .catch((error: any) => {
          console.error("[Topics Page] Error checking vocabulary completion:", error);
        });
    }
  }, [topic, topicId, completedActivityIds, loadCompletedActivities]);

  const handleVocabularyCompleted = async () => {
    console.log("[Topics Page] Vocabulary progress updated! Refreshing...");
    
    // Reload topic data để lấy progress mới nhất từ server
    try {
      const topicData = await topicService.getTopicById(topicId);
      
      // Update topic state với words mới (có progress đã cập nhật)
      // Điều này sẽ trigger re-render cả list và grid view với data mới nhất
      setTopic(topicData);
      
      // Calculate và update vocabulary progress ngay lập tức
      if (topicData.words && topicData.words.length > 0) {
        const progress = calculateVocabularyProgress(topicData.words);
        setVocabularyProgress(progress);
        console.log("[Topics Page] Updated vocabulary progress:", progress);
      }
      
      // Reload topic progress từ backend để cập nhật progress bar
      try {
        const topicProgress = await getTopicProgressFromBackend(topicId);
        setTopicProgressFromBackend(topicProgress);
        console.log("[Topics Page] Updated topic progress from backend:", topicProgress);
      } catch (progressError) {
        console.error("[Topics Page] Error refreshing topic progress:", progressError);
      }
      
      // Reload completed activities để đảm bảo vocabulary activity được cập nhật
      try {
        await loadCompletedActivities();
        console.log("[Topics Page] Reloaded completed activities");
      } catch (activitiesError) {
        console.error("[Topics Page] Error reloading completed activities:", activitiesError);
      }
    } catch (error) {
      console.error("[Topics Page] Error refreshing vocabulary progress:", error);
      // Fallback: Tính từ state hiện tại nếu API fail
      if (topic?.words) {
        const progress = calculateVocabularyProgress(topic.words);
        setVocabularyProgress(progress);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin chủ đề...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Chủ đề không tồn tại</p>
            <Link href="/courses" className="text-primary hover:underline">
              Quay lại danh sách chủ đề
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Thông báo mở khóa topic tiếp theo */}
      {showUnlockNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{unlockMessage}</span>
            <button 
              onClick={() => setShowUnlockNotification(false)}
              className="ml-2 hover:bg-green-600 rounded p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              href="/courses"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách chủ đề
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-xl text-white/90 max-w-3xl">
                {topic.description}
              </p>
            )}
            <div className="flex items-center gap-6 mt-6 text-white/90">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {topic.totalExercises} bài tập
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {topic.totalWords} từ vựng
              </span>
            </div>
            {/* Tiến độ hoàn thành các hoạt động bắt buộc */}
            {topicCompletedStatus && (
              <div className="mt-6">
                <div className="flex justify-between text-white/90 mb-2">
                  <span className="flex items-center gap-2">
                    Tiến độ mở khóa chủ đề tiếp theo
                    {topicCompletedStatus.isCompleted && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        ✓ Hoàn thành
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {topicCompletedStatus.completedCount}/{topicCompletedStatus.totalRequired} hoạt động
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      topicCompletedStatus.isCompleted ? "bg-green-400" : "bg-white"
                    }`}
                    style={{ 
                      width: `${(topicCompletedStatus.completedCount / topicCompletedStatus.totalRequired) * 100}%` 
                    }}
                  ></div>
                </div>
                {!topicCompletedStatus.isCompleted && (
                  <p className="text-white/70 text-sm mt-2">
                    Hoàn thành: {topicCompletedStatus.completedActivities.join(", ") || "Chưa có"} | 
                    Còn lại: {topicCompletedStatus.requiredActivities
                      .filter(a => !topicCompletedStatus.completedActivities.includes(a))
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
            {/* Hiển thị progress bar dựa trên activities (không dựa trên vocabulary) */}
            {topicProgressFromBackend && topicProgressFromBackend.totalActivities > 0 && !topicCompletedStatus && (
              <div className="mt-6">
                <div className="flex justify-between text-white/90 mb-2">
                  <span>Tiến độ hoàn thành các hoạt động</span>
                  <span className="font-semibold">
                    {topicProgressFromBackend.completedActivities}/{topicProgressFromBackend.totalActivities} hoạt động ({topicProgressFromBackend.progressPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all"
                    style={{ width: `${topicProgressFromBackend.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <main className="lg:col-span-2">
              {topic.words && topic.words.length > 0 ? (
                <>
                  {/* Vocabulary Progress Chart */}
                  {vocabularyProgress && (
                    <div className="mb-6">
                      <ActivityProgressChart progress={vocabularyProgress} showDetails={true} />
                    </div>
                  )}

                  {/* Vocabulary List */}
                  <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-dark">
                        Danh sách từ vựng ({topic.words.length})
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === "grid"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Lưới
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === "list"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Danh sách
                        </button>
                      </div>
                    </div>
                    {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {topic.words.map((word) => (
                        <VocabularyWordItem
                          key={word.id}
                          word={word}
                          viewMode="grid"
                          allWords={topic.words || []}
                          topicId={topicId}
                          onVocabularyCompleted={handleVocabularyCompleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topic.words.map((word) => (
                        <VocabularyWordItem
                          key={word.id}
                          word={word}
                          viewMode="list"
                          allWords={topic.words || []}
                          topicId={topicId}
                          onVocabularyCompleted={handleVocabularyCompleted}
                        />
                      ))}
                    </div>
                  )}
                  </section>
                </>
              ) : (
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">
                      Chưa có từ vựng nào trong chủ đề này
                    </p>
                  </div>
                </section>
              )}

              {topic.words && topic.words.length > 0 && (
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thống kê từ vựng
                    </h3>
                    <Link
                      href={`/topics/${topicId}/progress`}
                      className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                      Xem chi tiết
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {progressPercentage}% Hoàn thành
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.mastered}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Đã làm</div>
                      <div className="text-xs font-semibold text-green-600">
                        {stats.total > 0
                          ? Math.round((stats.mastered / stats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.learning}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Đang làm</div>
                      <div className="text-xs font-semibold text-yellow-600">
                        {stats.total > 0
                          ? Math.round((stats.learning / stats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-500">
                        {stats.new}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Chưa làm</div>
                      <div className="text-xs font-semibold text-gray-500">
                        {stats.total > 0
                          ? Math.round((stats.new / stats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </main>

            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <LearningActivities
                  activities={activities}
                  title={topic?.title || "Hán Ngữ"}
                  completedCount={completedActivities}
                  totalCount={totalActivities}
                  maxHeight="calc(100vh-200px)"
                />
              </div>
            </aside>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
