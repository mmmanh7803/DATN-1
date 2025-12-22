"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/contexts/ToastContext";
import { topicService } from "@/lib/services/topicService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import { LessonTopicDto, WordWithProgressDto } from "@/types";
import LearningActivities, {
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import { getProxyAudioUrl } from "@/lib/audio";

interface FlashcardWord extends WordWithProgressDto {
  isLearned: boolean;
}

export default function FlashcardPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<FlashcardWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    easy: 0,
    hard: 0,
    forgot: 0,
  });

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

      // Khởi tạo cards từ từ vựng
      if (topicData.words && topicData.words.length > 0) {
        const shuffledWords = [...topicData.words]
          .sort(() => Math.random() - 0.5)
          .map((word) => ({
            ...word,
            isLearned: false,
          }));
        setCards(shuffledWords);
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

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = useCallback(() => {
    if (currentCard?.character) {
      const audioUrl = getProxyAudioUrl(currentCard.character);
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Lỗi khi phát audio:", error);
      });
    }
  }, [currentCard]);

  const handleRate = (rating: "easy" | "hard" | "forgot") => {
    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    // Đánh dấu từ đã học
    if (rating !== "forgot") {
      setLearnedCount((prev) => prev + 1);
      setCards((prev) =>
        prev.map((card, idx) =>
          idx === currentIndex ? { ...card, isLearned: true } : card
        )
      );
    }

    // Chuyển sang từ tiếp theo
    goToNext();
  };

  const goToNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Kết thúc session
      handleComplete();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setShowResult(true);
    // Đánh dấu hoạt động hoàn thành
    const score = Math.round((learnedCount / cards.length) * 100);
    await markActivityCompleted("flashcard", score);
  };

  const handleRestart = () => {
    // Xáo trộn lại và reset
    const shuffledWords = [...cards]
      .sort(() => Math.random() - 0.5)
      .map((word) => ({ ...word, isLearned: false }));
    setCards(shuffledWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedCount(0);
    setShowResult(false);
    setSessionStats({ easy: 0, hard: 0, forgot: 0 });
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
      activeId: "flashcard",
      completedIds: completedActivityIds,
    });
  }, [topic, topicId, completedActivityIds]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
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
                Flash Card Từ Vựng
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
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

  if (!topic || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
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
                Flash Card Từ Vựng
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">Không có từ vựng nào trong chủ đề này.</p>
              <Link
                href="/vocabulary"
                className="text-primary hover:text-primary-dark underline"
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
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
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
                  🃏 Flash Card Từ Vựng
                </h1>
                {topic && (
                  <p className="text-xl text-white/90">
                    {topic.title || `Chủ đề ${topicId}`}
                  </p>
                )}
              </div>
              {/* Progress */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-white text-right">
                  <div className="text-3xl font-bold">{currentIndex + 1}/{cards.length}</div>
                  <div className="text-white/80 text-sm">Tiến độ</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Flashcard */}
            <div className="lg:col-span-2">
              {showResult ? (
                // Màn hình kết quả
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-6">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Hoàn thành!
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Bạn đã hoàn thành {cards.length} thẻ từ vựng
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-3xl font-bold text-green-600">{sessionStats.easy}</div>
                      <div className="text-green-700 text-sm">Dễ nhớ</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="text-3xl font-bold text-yellow-600">{sessionStats.hard}</div>
                      <div className="text-yellow-700 text-sm">Khó nhớ</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="text-3xl font-bold text-red-600">{sessionStats.forgot}</div>
                      <div className="text-red-700 text-sm">Chưa nhớ</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="mb-8">
                    <div className="text-lg text-gray-600 mb-2">Điểm số của bạn</div>
                    <div className="text-5xl font-bold text-orange-500">
                      {Math.round(((sessionStats.easy + sessionStats.hard) / cards.length) * 100)}%
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
                    >
                      🔄 Học lại
                    </button>
                    <Link
                      href={`/topics/${topicId}`}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                    >
                      ← Quay lại
                    </Link>
                  </div>
                </div>
              ) : (
                // Flashcard
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tiến độ học</span>
                      <span className="text-sm font-medium text-orange-600">
                        {currentIndex + 1} / {cards.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="relative cursor-pointer"
                    onClick={handleFlip}
                    style={{ perspective: "1500px" }}
                  >
                    <div
                      className="relative w-full h-80 transition-transform duration-500"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      {/* Mặt trước */}
                      <div
                        className="absolute inset-0 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <div className="text-8xl font-bold text-gray-900 mb-4">
                          {currentCard?.character}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio();
                          }}
                          className="px-6 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          Nghe phát âm
                        </button>
                        <p className="mt-6 text-gray-400 text-sm">Nhấn thẻ để xem nghĩa</p>
                      </div>

                      {/* Mặt sau */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="text-5xl font-bold text-gray-900 mb-3">
                          {currentCard?.character}
                        </div>
                        <div className="text-2xl text-orange-600 mb-4 font-medium">
                          {currentCard?.pinyin}
                        </div>
                        <div className="text-xl text-gray-800 mb-4 text-center max-w-md">
                          {currentCard?.meaning}
                        </div>
                        {currentCard?.exampleSentence && (
                          <div className="text-sm text-gray-600 text-center italic bg-white/50 rounded-lg px-4 py-2">
                            {currentCard.exampleSentence}
                          </div>
                        )}
                        <p className="mt-4 text-gray-400 text-sm">Đánh giá mức độ nhớ bên dưới</p>
                      </div>
                    </div>
                  </div>

                  {/* Nút đánh giá */}
                  <div className={`transition-all duration-300 ${isFlipped ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleRate("easy")}
                        className="flex-1 max-w-[140px] px-4 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium shadow-lg shadow-green-500/30"
                      >
                        <span className="text-2xl block mb-1">😄</span>
                        <span>Dễ nhớ</span>
                      </button>
                      <button
                        onClick={() => handleRate("hard")}
                        className="flex-1 max-w-[140px] px-4 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium shadow-lg shadow-yellow-500/30"
                      >
                        <span className="text-2xl block mb-1">🤔</span>
                        <span>Khó nhớ</span>
                      </button>
                      <button
                        onClick={() => handleRate("forgot")}
                        className="flex-1 max-w-[140px] px-4 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-500/30"
                      >
                        <span className="text-2xl block mb-1">😅</span>
                        <span>Chưa nhớ</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={goToPrevious}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Từ trước
                    </button>
                    <button
                      onClick={goToNext}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
                    >
                      {currentIndex < cards.length - 1 ? "Từ tiếp" : "Hoàn thành"}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
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

