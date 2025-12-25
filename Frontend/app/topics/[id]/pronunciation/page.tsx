"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { topicService } from "@/lib/services/topicService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import { LessonTopicDto, WordWithProgressDto } from "@/types";
import LearningActivities from "@/components/vocabulary/LearningActivities";
import { useActivities } from "@/hooks/useActivities";
import PronunciationRecorder from "@/components/pronunciation/PronunciationRecorder";
import ActivityPageLayout from "@/components/activities/ActivityPageLayout";

export default function PronunciationPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordWithProgressDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  // Sử dụng hook để quản lý completed activities
  const {
    completedActivityIds,
    markActivityCompleted,
  } = useCompletedActivities({ topicId });

  useEffect(() => {
    if (topicId) {
      loadData();
    }
  }, [topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);

      if (topicData.words && topicData.words.length > 0) {
        setWords(topicData.words);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error.response?.status === 404) {
        toast.error("Chủ đề từ vựng không tồn tại.");
        router.push("/topics");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWordComplete = async (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    // Nếu đã hoàn thành tất cả từ
    if (newScores.length >= words.length) {
      const avgScore = Math.round(
        newScores.reduce((sum, s) => sum + s, 0) / newScores.length
      );
      setAverageScore(avgScore);
      setActivityCompleted(true);

      // Đánh dấu hoạt động đã hoàn thành
      console.log("[Pronunciation] All words completed, average score:", avgScore);
      try {
        console.log("[Pronunciation] Calling markActivityCompleted...");
        const success = await markActivityCompleted("pronunciation", avgScore);
        console.log("[Pronunciation] markActivityCompleted result:", success);
        if (success) {
          toast.success("Đã lưu tiến độ hoàn thành hoạt động!");
        } else {
          console.warn("[Pronunciation] markActivityCompleted returned false");
          toast.warning("Không thể lưu tiến độ. Vui lòng thử lại.");
        }
      } catch (error: any) {
        console.error("[Pronunciation] Error marking activity as completed:", error);
        console.error("[Pronunciation] Error details:", {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        toast.error("Lỗi khi lưu tiến độ: " + (error.message || "Vui lòng thử lại"));
      }
    } else {
      // Chuyển sang từ tiếp theo
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScores([]);
    setActivityCompleted(false);
    setAverageScore(null);
  };

  // Load activities from database
  const { activities } = useActivities({
    topicId,
    activeId: "pronunciation",
    completedIds: completedActivityIds,
  });

  // Tính progress dựa trên activities (hoạt động học) của lesson topic
  const totalActivities = useMemo(() => activities.length, [activities]);
  const completedActivities = useMemo(
    () => activities.filter((a) => a.isCompleted).length,
    [activities]
  );

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const errorMessage =
    !topic || words.length === 0
      ? "Không có từ vựng nào trong chủ đề này."
      : null;

  return (
    <ActivityPageLayout
      activityId="pronunciation"
      topicId={topicId}
      topicTitle={topic?.title || `Chủ đề ${topicId}`}
      loading={loading}
      error={errorMessage}
      sidebar={
        <LearningActivities
          activities={activities}
          title={topic?.title || "Hán Ngữ"}
          completedCount={completedActivities}
          totalCount={totalActivities}
          maxHeight="calc(100vh - 200px)"
        />
      }
    >
      {topic && words.length > 0 && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Tiến độ: {currentIndex + 1} / {words.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Activity Completed Screen */}
          {activityCompleted && averageScore !== null ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div
                className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  averageScore >= 90
                    ? "bg-green-100"
                    : averageScore >= 80
                    ? "bg-blue-100"
                    : averageScore >= 70
                    ? "bg-yellow-100"
                    : "bg-orange-100"
                }`}
              >
                <span
                  className={`text-5xl font-bold ${
                    averageScore >= 90
                      ? "text-green-600"
                      : averageScore >= 80
                      ? "text-blue-600"
                      : averageScore >= 70
                      ? "text-yellow-600"
                      : "text-orange-600"
                  }`}
                >
                  {averageScore}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {averageScore >= 90
                  ? "Xuất sắc!"
                  : averageScore >= 80
                  ? "Tốt!"
                  : averageScore >= 70
                  ? "Khá ổn!"
                  : "Cần cố gắng thêm!"}
              </h3>
              <p className="text-gray-600 mb-6">
                Điểm trung bình của bạn: {averageScore}%
              </p>
              <button
                onClick={handleRestart}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Làm lại
              </button>
            </div>
          ) : (
            currentWord && (
              <PronunciationRecorder
                word={{
                  id: currentWord.id,
                  character: currentWord.character,
                  pinyin: currentWord.pinyin || "",
                  meaning: currentWord.meaning || "",
                }}
                onComplete={handleWordComplete}
                onSkip={handleSkip}
              />
            )
          )}
        </div>
      )}
    </ActivityPageLayout>
  );
}

