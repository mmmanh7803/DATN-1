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
import LearningActivities from "@/components/vocabulary/LearningActivities";
import { useActivities } from "@/hooks/useActivities";
import VocabularyPracticeCard from "@/components/vocabulary/VocabularyPracticeCard";

export default function VocabularyPracticePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordWithProgressDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [currentCard, setCurrentCard] = useState<{
    word: WordWithProgressDto;
    wrongImageWord?: WordWithProgressDto;
    isCorrectImage: boolean;
  } | null>(null);

  // Sử dụng hook để quản lý completed activities
  const { completedActivityIds, markActivityCompleted } = useCompletedActivities({ topicId });

  useEffect(() => {
    if (topicId) {
      loadData();
    }
  }, [topicId]);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      generateCard();
    }
  }, [words, currentIndex]);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);

      if (topicData.words && topicData.words.length > 0) {
        // Xáo trộn từ vựng
        const shuffledWords = [...topicData.words].sort(() => Math.random() - 0.5);
        setWords(shuffledWords);
        setStats({ correct: 0, incorrect: 0, total: shuffledWords.length });
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

  // Logic Coin Flip: 50% hiển thị hình đúng, 50% hiển thị hình sai
  const generateCard = () => {
    if (words.length === 0 || currentIndex >= words.length) return;

    const currentWord = words[currentIndex];
    
    // Coin flip: 50% chance
    const isCorrectImage = Math.random() < 0.5;
    
    let wrongImageWord: WordWithProgressDto | undefined;
    let finalIsCorrectImage = isCorrectImage;
    
    if (!isCorrectImage) {
      // Chọn ngẫu nhiên một từ vựng khác có hình ảnh
      const wordsWithImages = words.filter(
        (w) => w.id !== currentWord.id && w.imageUrl
      );
      
      if (wordsWithImages.length > 0) {
        wrongImageWord = wordsWithImages[
          Math.floor(Math.random() * wordsWithImages.length)
        ];
        finalIsCorrectImage = false; // Có hình ảnh sai
      } else {
        // Nếu không có từ nào khác có hình ảnh, fallback về đúng
        wrongImageWord = undefined;
        finalIsCorrectImage = true; // Không có hình sai nên luôn đúng
      }
    }

    setCurrentCard({
      word: currentWord,
      wrongImageWord,
      isCorrectImage: finalIsCorrectImage,
    });
  };

  const handleAnswer = (isCorrect: boolean) => {
    setStats((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Hoàn thành
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setShowResult(true);
    const score = Math.round((stats.correct / stats.total) * 100);
    console.log("[VocabularyPractice] handleComplete called, score:", score);
    try {
      console.log("[VocabularyPractice] Calling markActivityCompleted...");
      const success = await markActivityCompleted("vocabulary-practice", score);
      console.log("[VocabularyPractice] markActivityCompleted result:", success);
      if (success) {
        toast.success("Đã lưu tiến độ hoàn thành hoạt động!");
      } else {
        console.warn("[VocabularyPractice] markActivityCompleted returned false");
        toast.warning("Không thể lưu tiến độ. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("[VocabularyPractice] Error marking activity as completed:", error);
      console.error("[VocabularyPractice] Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      toast.error("Lỗi khi lưu tiến độ: " + (error.message || "Vui lòng thử lại"));
    }
  };

  const handleRestart = () => {
    // Xáo trộn lại từ vựng
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    setCurrentIndex(0);
    setStats({ correct: 0, incorrect: 0, total: shuffledWords.length });
    setShowResult(false);
    generateCard();
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

  // Load activities from database (đồng bộ với các trang khác)
  const { activities } = useActivities({
    topicId,
    activeId: "vocabulary-practice",
    completedIds: completedActivityIds,
  });

  // Tính progress dựa trên activities (hoạt động học) của lesson topic
  // Dùng useMemo để đảm bảo tính lại khi activities thay đổi
  const totalActivities = useMemo(() => activities.length, [activities]);
  const completedActivities = useMemo(() => activities.filter(a => a.isCompleted).length, [activities]);

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
                Thực Hành Từ Vựng
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

  if (!topic || words.length === 0) {
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
                Thực Hành Từ Vựng
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">Không có từ vựng nào trong chủ đề này.</p>
              <Link
                href="/vocabulary"
                className="text-primary hover:text-primary-dark hover:underline"
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
                  📝 Thực hành từ vựng
                </h1>
                {topic && (
                  <p className="text-xl text-white/90">
                    {topic.title || `Chủ đề ${topicId}`}
                  </p>
                )}
              </div>
              {/* Progress */}
              {!showResult && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-white text-right">
                    <div className="text-3xl font-bold">{currentIndex + 1}/{words.length}</div>
                    <div className="text-white/80 text-sm">Tiến độ</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Practice Card */}
            <div className="lg:col-span-2">
              {showResult ? (
                // Màn hình kết quả
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-6">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Hoàn thành!
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Bạn đã hoàn thành {words.length} từ vựng
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="text-4xl font-bold text-green-600">{stats.correct}</div>
                      <div className="text-green-700 text-sm font-medium">Đúng</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-6">
                      <div className="text-4xl font-bold text-red-600">{stats.incorrect}</div>
                      <div className="text-red-700 text-sm font-medium">Sai</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="mb-8">
                    <div className="text-lg text-gray-600 mb-2">Điểm số của bạn</div>
                    <div className="text-5xl font-bold text-indigo-500">
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition font-medium"
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
              ) : currentCard ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tiến độ học</span>
                      <span className="text-sm font-medium text-indigo-600">
                        {currentIndex + 1} / {words.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Practice Card */}
                  <VocabularyPracticeCard
                    word={currentCard.word}
                    wrongImageWord={currentCard.wrongImageWord}
                    isCorrectImage={currentCard.isCorrectImage}
                    onAnswer={handleAnswer}
                    onNext={handleNext}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Activities */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <LearningActivities
                  activities={activities}
                  title={topic?.title || "Hán Ngữ"}
                  completedCount={completedActivities}
                  totalCount={totalActivities}
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

