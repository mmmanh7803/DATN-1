"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import {
  VocabularyTopicDetailDto,
  QuestionDto,
} from "@/types";
import LearningActivities, {
  ActivityItem,
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import ImageQuizComponent from "@/components/vocabulary/ImageQuizComponent";

export default function ImageQuizPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

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
        alert("Chủ đề từ vựng không tồn tại.");
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

  const activities = useMemo(() => {
    if (!topic) return [];
    return createDefaultActivities({
      vocabularyLink: `/topics/${topicId}`,
      quickMemorizeLink: `/topics/${topicId}/quick-memorize`,
      imageQuizLink: `/topics/${topicId}/image-quiz`,
      pronunciationLink: `/topics/${topicId}/pronunciation`,
      grammarLink: `/topics/${topicId}/grammar`,
      progressLink: `/topics/${topicId}/progress`,
      activeId: "image-quiz",
      completedIds: completedActivityIds,
    });
  }, [topic, topicId, completedActivityIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy chủ đề từ vựng.</p>
            <Link
              href="/topics"
              className="text-primary hover:underline"
            >
              Quay lại danh sách chủ đề
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Chủ đề này chưa có đủ từ vựng để tạo câu hỏi. Cần ít nhất 4 từ vựng.
            </p>
            <Link
              href={`/topics/${topicId}`}
              className="text-primary hover:underline"
            >
              Quay lại chủ đề
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-dark mb-2">
                    Kiểm tra từ vựng bằng hình ảnh
                  </h1>
                  <p className="text-gray-600">
                    Chọn từ vựng đúng cho mỗi hình ảnh
                  </p>
                </div>
                <Link
                  href={`/topics/${topicId}`}
                  className="text-primary hover:underline"
                >
                  ← Quay lại
                </Link>
              </div>

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
                  <h3 className="text-2xl font-bold text-dark mb-2">
                    {quizResult.score >= 80 ? "Xuất sắc!" : quizResult.score >= 60 ? "Tốt!" : "Cần cố gắng thêm!"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bạn đã trả lời đúng {quizResult.correct}/{quizResult.total} câu hỏi
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {quizResult.score}%
                    </div>
                    <div className="text-sm text-gray-600">Điểm số</div>
                  </div>
                  <button
                    onClick={handleRestart}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
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
          </section>

          {/* Sidebar - Activities */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <LearningActivities
                activities={activities}
                title={topic?.name || "Hán Ngữ"}
                completedCount={completedCount}
                totalCount={vocabStats.total}
                maxHeight="calc(100vh-200px)"
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

