"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import {
  VocabularyTopicDetailDto,
  QuestionDto,
} from "@/types";
import LearningActivities from "@/components/vocabulary/LearningActivities";
import { useActivities } from "@/hooks/useActivities";
import ImageQuizComponent from "@/components/vocabulary/ImageQuizComponent";
import ActivityPageLayout from "@/components/activities/ActivityPageLayout";

export default function ImageQuizPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<VocabularyTopicDetailDto | null>(null);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Sử dụng hook để quản lý completed activities (đồng bộ giữa các trang)
  const {
    completedActivityIds,
    markActivityCompleted,
  } = useCompletedActivities({ topicId });
  const [quizResult, setQuizResult] = useState<{
    correct: number;
    total: number;
    score: number;
  } | null>(null);

  useEffect(() => {
    if (topicId) {
      loadData();
    }
  }, [topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicData, questionsData] = await Promise.all([
        vocabularyService.getTopicById(topicId),
        vocabularyService.getImageQuizQuestions(topicId),
      ]);
      setTopic(topicData);
      setQuestions(questionsData);
      
      // Completed activities được load tự động bởi hook useCompletedActivities
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

  const handleQuizComplete = async (result: { correct: number; total: number; score: number }) => {
    setQuizResult(result);
    setQuizCompleted(true);
    
    // Đánh dấu hoạt động đã hoàn thành (hook sẽ tự động cập nhật và đồng bộ)
    await markActivityCompleted("image-quiz", result.score);
  };

  const handleRestart = () => {
    setQuizCompleted(false);
    setQuizResult(null);
    loadData();
  };

  // Load activities from database
  const { activities } = useActivities({
    topicId,
      activeId: "image-quiz",
      completedIds: completedActivityIds,
    });

  // Tính progress dựa trên activities (hoạt động học) của lesson topic
  // Dùng useMemo để đảm bảo tính lại khi activities thay đổi
  const totalActivities = useMemo(() => activities.length, [activities]);
  const completedActivities = useMemo(() => activities.filter(a => a.isCompleted).length, [activities]);


  const errorMessage = !topic
    ? "Không tìm thấy chủ đề từ vựng."
    : questions.length === 0
    ? "Chủ đề này chưa có đủ từ vựng để tạo câu hỏi. Cần ít nhất 4 từ vựng."
    : null;

  return (
    <ActivityPageLayout
      activityId="image-quiz"
      topicId={topicId}
      topicTitle={topic?.name || `Chủ đề ${topicId}`}
      loading={loading}
      error={errorMessage}
      sidebar={
        <LearningActivities
          activities={activities}
          title={topic?.name || "Hán Ngữ"}
          completedCount={completedActivities}
          totalCount={totalActivities}
          maxHeight="calc(100vh-200px)"
        />
      }
    >
      {topic && questions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
              {quizCompleted && quizResult ? (
                <div className="text-center py-8">
                  <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    quizResult.score >= 80 ? "bg-green-100" : quizResult.score >= 60 ? "bg-yellow-100" : "bg-red-100"
                  }`}>
                    <span className={`text-4xl ${
                      quizResult.score >= 80 ? "text-green-600" : quizResult.score >= 60 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {quizResult.score >= 80 ? "✓" : "!"}
                    </span>
                  </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {quizResult.score >= 80 ? "Xuất sắc!" : quizResult.score >= 60 ? "Tốt!" : "Cần cố gắng thêm!"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bạn đã trả lời đúng {quizResult.correct}/{quizResult.total} câu hỏi
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                      {quizResult.score}%
                    </div>
                    <div className="text-sm text-gray-600">Điểm số</div>
                  </div>
                  <button
                    onClick={handleRestart}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Làm lại
                  </button>
                </div>
              ) : (
                <ImageQuizComponent
                  questions={questions}
                  onComplete={handleQuizComplete}
                />
              )}
            </div>
      )}
    </ActivityPageLayout>
  );
}

