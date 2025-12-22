"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PronunciationRecorder from "@/components/pronunciation/PronunciationRecorder";
import ActivityProgressChart from "@/components/vocabulary/ActivityProgressChart";
import { topicService } from "@/lib/services/topicService";
import { useToast } from "@/contexts/ToastContext";
import { 
  storePronunciationScore, 
  getPronunciationScores,
  calculatePronunciationProgress 
} from "@/lib/services/activityProgressService";
import { LessonTopicDto, WordDto } from "@/types";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import LearningActivities, {
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";

export default function PronunciationPracticePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [words, setWords] = useState<WordDto[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [activityProgress, setActivityProgress] = useState<any>(null);
  
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

  const activities = useMemo(() => {
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
      activeId: "pronunciation",
      completedIds: completedActivityIds,
    });
  }, [topic, topicId, completedActivityIds]);

  useEffect(() => {
    if (topicId) {
      loadTopicData();
    }
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);
      
      if (topicData.words && topicData.words.length > 0) {
        // Shuffle words for practice
        const shuffledWords = [...topicData.words].sort(() => Math.random() - 0.5);
        setWords(shuffledWords);
        
        // Load existing pronunciation scores
        const pronunciationScores = getPronunciationScores(topicId);
        const progress = calculatePronunciationProgress(topicData.words, pronunciationScores);
        setActivityProgress(progress);
      } else {
        toast.warning("Chủ đề này chưa có từ vựng để luyện phát âm.");
        router.push(`/topics/${topicId}`);
      }
    } catch (error: any) {
      console.error("Error loading topic:", error);
      toast.error("Lỗi khi tải dữ liệu chủ đề.");
      router.push(`/topics/${topicId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    // Store pronunciation score
    const currentWord = words[currentWordIndex];
    storePronunciationScore(topicId, currentWord.id, score);

    // Update progress
    if (topic?.words) {
      const pronunciationScores = getPronunciationScores(topicId);
      const progress = calculatePronunciationProgress(topic.words, pronunciationScores);
      setActivityProgress(progress);
    }

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // All words completed
      setIsComplete(true);
    }
  };

  const handleSkip = () => {
    const newScores = [...scores, 0];
    setScores(newScores);

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setScores([]);
    setIsComplete(false);
    // Shuffle words again
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
  };

  const handleBackToTopic = () => {
    router.push(`/topics/${topicId}`);
  };

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
                Luyện phát âm
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải bài luyện phát âm...</p>
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
                Luyện phát âm
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">
              Không có từ vựng để luyện phát âm
            </p>
              <Link href={`/topics/${topicId}`} className="text-primary hover:text-primary-dark hover:underline">
              Quay lại chủ đề
            </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

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
                  Luyện phát âm
                </h1>
                <p className="text-xl text-white/90">
                  {topic.title}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Progress Stats and Bar */}
              {!isComplete && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tiến độ session hiện tại
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {currentWordIndex + 1} / {words.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                  ></div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{scores.length}</div>
                    <div className="text-xs text-gray-600">Đã luyện</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0}
                    </div>
                    <div className="text-xs text-gray-600">Điểm TB</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {scores.filter(s => s >= 80).length}
                    </div>
                    <div className="text-xs text-gray-600">Đạt yêu cầu</div>
                  </div>
                </div>
              </div>
              )}

              {/* Activity Progress Chart */}
              {activityProgress && (
                <ActivityProgressChart progress={activityProgress} showDetails={true} />
              )}

              {/* Main Content */}
              {!isComplete ? (
            <PronunciationRecorder
              word={words[currentWordIndex]}
              onComplete={handleComplete}
              onSkip={handleSkip}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Hoàn thành!
                </h2>
                <p className="text-gray-600">
                  Bạn đã hoàn thành luyện phát âm {words.length} từ vựng
                </p>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {words.length}
                    </div>
                    <div className="text-sm text-gray-600">Tổng số từ</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${
                      averageScore >= 90 ? "text-green-500" :
                      averageScore >= 80 ? "text-blue-500" :
                      averageScore >= 70 ? "text-yellow-500" :
                      "text-orange-500"
                    }`}>
                      {averageScore}
                    </div>
                    <div className="text-sm text-gray-600">Điểm trung bình</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      {scores.filter(s => s >= 70).length}
                    </div>
                    <div className="text-sm text-gray-600">Từ đạt yêu cầu</div>
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      averageScore >= 90 ? "bg-green-500" :
                      averageScore >= 80 ? "bg-blue-500" :
                      averageScore >= 70 ? "bg-yellow-500" :
                      "bg-orange-500"
                    }`}
                    style={{ width: `${averageScore}%` }}
                  />
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Chi tiết điểm số
                </h3>
                <div className="space-y-2">
                  {words.map((word, index) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{word.character}</span>
                        <span className="text-sm text-gray-600">{word.pinyin}</span>
                      </div>
                      <div className={`text-lg font-bold ${
                        scores[index] >= 90 ? "text-green-500" :
                        scores[index] >= 80 ? "text-blue-500" :
                        scores[index] >= 70 ? "text-yellow-500" :
                        scores[index] > 0 ? "text-orange-500" :
                        "text-gray-400"
                      }`}>
                        {scores[index] > 0 ? scores[index] : "Bỏ qua"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleBackToTopic}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Quay lại chủ đề
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Luyện lại
                </button>
              </div>
            </div>
          )}
            </div>

            {/* Sidebar - Activities */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <LearningActivities
                  activities={activities}
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

