"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { topicService } from "@/lib/services/topicService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import { useToast } from "@/contexts/ToastContext";
import { LessonTopicDto, WordWithProgressDto } from "@/types";
import LearningActivities, {
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import FillInBlankActivity from "@/components/vocabulary/FillInBlankActivity";

export default function FillInBlankPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordWithProgressDto[]>([]);

  // Sử dụng hook để quản lý completed activities
  const { completedActivityIds, markActivityCompleted } = useCompletedActivities({ topicId });

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
      if (error.response?.status === 404) {
        toast.error("Chủ đề từ vựng không tồn tại.");
        router.push("/vocabulary");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (result: { correct: number; total: number; score: number }) => {
    await markActivityCompleted("fill-blank", result.score);
  };

  // Tính toán stats
  const vocabStats = topic
    ? {
        total: topic.words?.length || 0,
        mastered: topic.words?.filter((w: any) => w.progress?.status === "Mastered").length || 0,
        learning: topic.words?.filter((w: any) => w.progress?.status === "Learning").length || 0,
        new: topic.words?.filter((w: any) => !w.progress || w.progress.status === "New").length || 0,
      }
    : { total: 0, mastered: 0, learning: 0, new: 0 };

  const completedCount = vocabStats.mastered + vocabStats.learning;

  // Danh sách hoạt động
  const activities = useMemo(() => {
    if (!topic) return [];
    return createDefaultActivities({
      vocabularyLink: `/topics/${topicId}`,
      quickMemorizeLink: `/topics/${topicId}/quick-memorize`,
      imageQuizLink: `/topics/${topicId}/image-quiz`,
      pronunciationLink: `/topics/${topicId}/pronunciation`,
      progressLink: `/topics/${topicId}/progress`,
      grammarLink: `/topics/${topicId}/grammar`,
      flashcardLink: `/topics/${topicId}/flashcard`,
      vocabularyPracticeLink: `/topics/${topicId}/vocabulary-practice`,
      fillBlankLink: `/topics/${topicId}/fill-blank`,
      activeId: "fill-blank",
      completedIds: completedActivityIds,
    });
  }, [topic, topicId, completedActivityIds]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                ✏️ Điền từ vào chỗ trống
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!topic || words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                ✏️ Điền từ vào chỗ trống
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">Không có từ vựng nào trong chủ đề này.</p>
              <Link
                href="/vocabulary"
                className="text-teal-600 hover:text-teal-700 underline"
              >
                Quay lại danh sách chủ đề
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              href={`/topics/${topicId}`}
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại chủ đề
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  ✏️ Điền từ vào chỗ trống
                </h1>
                {topic && (
                  <p className="text-xl text-white/90">
                    {topic.title || `Chủ đề ${topicId}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Fill in Blank Activity */}
            <div className="lg:col-span-2">
              <FillInBlankActivity
                words={words}
                onComplete={handleComplete}
              />
            </div>

            {/* Right Sidebar - Activities */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <LearningActivities
                  activities={activities}
                  title={topic?.title || "Hán Ngữ"}
                  completedCount={completedCount}
                  totalCount={vocabStats.total}
                  maxHeight="calc(100vh - 200px)"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

