"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/contexts/ToastContext";
import { AllActivitiesProgress } from "@/components/vocabulary/ActivityProgressChart";
import { topicService } from "@/lib/services/topicService";
import {
  calculateAllActivitiesProgress,
  getProgressSummary,
  getPronunciationScores,
  getQuickMemorizeCompletion,
  getFlashcardReview,
} from "@/lib/services/activityProgressService";
import { LessonTopicDto } from "@/types";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import LearningActivities, {
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";

export default function TopicProgressPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  // Sử dụng hook để quản lý completed activities (đồng bộ giữa các trang)
  const {
    completedActivityIds,
  } = useCompletedActivities({ topicId });
  
  // Tính stats giống các trang khác
  const vocabStats = topic
    ? {
        total: topic.words?.length || 0,
        mastered: topic.words?.filter((w: any) => w.progress?.status === "Mastered").length || 0,
        learning: topic.words?.filter((w: any) => w.progress?.status === "Learning").length || 0,
        new: topic.words?.filter((w: any) => !w.progress || w.progress.status === "New").length || 0,
      }
    : { total: 0, mastered: 0, learning: 0, new: 0 };

  const completedCount = vocabStats.mastered + vocabStats.learning;

  const learningActivities = useMemo(() => {
    if (!topic) return [];
    return createDefaultActivities({
      vocabularyLink: `/topics/${topicId}`,
      quickMemorizeLink: topic.hskLevel
        ? `/topics/${topicId}/quick-memorize`
        : undefined,
      imageQuizLink: `/topics/${topicId}/image-quiz`,
      pronunciationLink: `/topics/${topicId}/pronunciation`,
      grammarLink: `/topics/${topicId}/grammar`,
      progressLink: `/topics/${topicId}/progress`,
      flashcardLink: `/topics/${topicId}/flashcard`,
      vocabularyPracticeLink: `/topics/${topicId}/vocabulary-practice`,
      fillBlankLink: `/topics/${topicId}/fill-blank`,
      activeId: "progress",
      completedIds: completedActivityIds,
    });
  }, [topic, topicId, completedActivityIds]);

  useEffect(() => {
    if (topicId) {
      loadProgressData();
    }
  }, [topicId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);

      if (topicData.words && topicData.words.length > 0) {
        // Get progress data from localStorage
        const pronunciationScores = getPronunciationScores(topicId);
        const completedQuickMemorize = getQuickMemorizeCompletion(topicId);
        const reviewedFlashcards = getFlashcardReview(topicId);

        // Calculate all activities progress
        const activitiesProgress = calculateAllActivitiesProgress(topicData.words, {
          pronunciationScores,
          completedQuickMemorize,
          reviewedFlashcards,
        });

        setActivities(activitiesProgress);
        setSummary(getProgressSummary(activitiesProgress));
      }
    } catch (error: any) {
      console.error("Error loading progress data:", error);
      toast.error("Lỗi khi tải dữ liệu tiến độ.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thống kê tiến độ...</p>
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <Link
                  href={`/topics/${topicId}`}
                  className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại chủ đề
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Thống kê tiến độ: {topic.title}
                </h1>
                <p className="text-gray-600">
                  Xem chi tiết tiến độ học tập của bạn trong chủ đề này
                </p>
              </div>

              {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                    <p className="text-3xl font-bold text-primary">
                      {summary.completionPercentage}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số từ vựng</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summary.totalWords}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hoạt động</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summary.totalActivities}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Đã hoàn thành</p>
                    <p className="text-3xl font-bold text-green-600">
                      {summary.completedTasks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

              {/* Activities Progress */}
              {activities.length > 0 && (
                <AllActivitiesProgress activities={activities} />
              )}

              {activities.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-xl text-gray-600 mb-2">Chưa có dữ liệu thống kê</p>
                  <p className="text-gray-500">
                    Hãy bắt đầu học để xem thống kê tiến độ của bạn
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/topics/${topicId}`}
              className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Học từ vựng</h3>
                  <p className="text-sm text-gray-600">Tiếp tục học</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href={`/topics/${topicId}/pronunciation`}
              className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Luyện phát âm</h3>
                  <p className="text-sm text-gray-600">Cải thiện phát âm</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href={`/topics/${topicId}/quick-memorize`}
              className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nhớ nhanh từ</h3>
                  <p className="text-sm text-gray-600">Ghi nhớ nhanh</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
              </div>
            </div>

            {/* Sidebar - Activities */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <LearningActivities
                  activities={learningActivities}
                  title={topic?.title || "Hán Ngữ"}
                  completedCount={completedCount}
                  totalCount={vocabStats.total}
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

