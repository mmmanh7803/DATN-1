"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LearningActivities, {
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import { exerciseService } from "@/lib/services/exerciseService";
import { topicService } from "@/lib/services/topicService";
import {
  LessonTopicDto,
  WordWithProgressDto,
} from "@/types";

const STORAGE_PREFIX = "grammar-words-";

export default function GrammarActivityPage() {
  const params = useParams();
  const topicId = parseInt(params.id as string, 10);

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [wordsWithGrammar, setWordsWithGrammar] = useState<WordWithProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studiedWordIds, setStudiedWordIds] = useState<Set<number>>(new Set());
  const [selectedPartOfSpeech, setSelectedPartOfSpeech] = useState<string>("all");
  const [hasMarkedCompletion, setHasMarkedCompletion] = useState(false);

  const {
    completedActivityIds,
    markActivityCompleted,
  } = useCompletedActivities({ topicId });

  const vocabStats = useMemo(() => {
    if (!topic?.words) {
      return { total: 0, mastered: 0, learning: 0, new: 0 };
    }
    const mastered = topic.words.filter((w) => w.progress?.status === "Mastered").length;
    const learning = topic.words.filter((w) => w.progress?.status === "Learning").length;
    const total = topic.words.length;
    return {
      total,
      mastered,
      learning,
      new: total - mastered - learning,
    };
  }, [topic]);

  const completedCount = vocabStats.mastered + vocabStats.learning;

  const grammarProgress = useMemo(() => {
    if (wordsWithGrammar.length === 0) return 0;
    return Math.round((studiedWordIds.size / wordsWithGrammar.length) * 100);
  }, [wordsWithGrammar.length, studiedWordIds]);

  const activities = useMemo(() => {
    if (!topic) return [];
    const progressMap = new Map<string, number>();
    if (grammarProgress > 0) {
      progressMap.set("grammar", grammarProgress);
    }
    return createDefaultActivities({
      vocabularyLink: `/topics/${topicId}`,
      quickMemorizeLink: topic.hskLevel ? `/topics/${topicId}/quick-memorize` : undefined,
      imageQuizLink: `/topics/${topicId}/image-quiz`,
      pronunciationLink: `/topics/${topicId}/pronunciation`,
      grammarLink: `/topics/${topicId}/grammar`,
      progressLink: `/topics/${topicId}/progress`,
      flashcardLink: `/topics/${topicId}/flashcard`,
      vocabularyPracticeLink: `/topics/${topicId}/vocabulary-practice`,
      fillBlankLink: `/topics/${topicId}/fill-blank`,
      activeId: "grammar",
      completedIds: completedActivityIds,
      activityProgressMap: progressMap,
    });
  }, [topic, topicId, completedActivityIds, grammarProgress]);

  const filteredWords = useMemo(() => {
    if (selectedPartOfSpeech === "all") {
      return wordsWithGrammar;
    }
    return wordsWithGrammar.filter((word) => word.partOfSpeechVi === selectedPartOfSpeech);
  }, [wordsWithGrammar, selectedPartOfSpeech]);

  const partOfSpeechOptions = useMemo(() => {
    const partOfSpeeches = new Set<string>();
    wordsWithGrammar.forEach((word) => {
      if (word.partOfSpeechVi) {
        partOfSpeeches.add(word.partOfSpeechVi);
      }
    });
    return Array.from(partOfSpeeches).sort();
  }, [wordsWithGrammar]);

  const storageKey = useMemo(() => `${STORAGE_PREFIX}${topicId}`, [topicId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        setStudiedWordIds(new Set(parsed));
      } else {
        setStudiedWordIds(new Set());
      }
    } catch (err) {
      console.warn("Không thể đọc tiến độ ngữ pháp từ localStorage:", err);
      setStudiedWordIds(new Set());
    }
  }, [storageKey]);

  const persistStudiedWords = useCallback((wordIds: Set<number>) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(wordIds)));
  }, [storageKey]);

  const toggleWordStudied = (wordId: number) => {
    setStudiedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      persistStudiedWords(next);
      return next;
    });
  };

  const markAllStudied = () => {
    const allIds = new Set(wordsWithGrammar.map((word) => word.id));
    setStudiedWordIds(allIds);
    persistStudiedWords(allIds);
  };

  const loadGrammarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);

      // Lọc các từ vựng có thông tin ngữ pháp
      const wordsWithGrammarData = (topicData.words || []).filter(
        (word) => word.grammarNote || word.partOfSpeech || word.structure
      );
      setWordsWithGrammar(wordsWithGrammarData);
    } catch (err: any) {
      console.error("Error loading grammar data:", err);
      setError(err?.response?.data?.message || "Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (topicId) {
      loadGrammarData();
    }
  }, [topicId, loadGrammarData]);

  useEffect(() => {
    if (hasMarkedCompletion) return;
    const studiedAll = wordsWithGrammar.length > 0 && studiedWordIds.size === wordsWithGrammar.length;
    if (studiedAll) {
      markActivityCompleted("grammar");
      setHasMarkedCompletion(true);
    }
  }, [wordsWithGrammar.length, studiedWordIds, hasMarkedCompletion, markActivityCompleted]);

  const renderExamples = (word: WordWithProgressDto) => {
    if (!word.examples || word.examples.length === 0) return null;
    return (
      <div className="space-y-3">
        {word.examples.map((example, index) => (
          <div key={`${word.id}-example-${index}`} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
              {/* Audio Button with Number */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(example.character);
                      utterance.lang = "zh-CN";
                      utterance.rate = 0.9;
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Phát âm"
                  title="Nghe phát âm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
              </div>
              
              {/* Example Content */}
              <div className="flex-1 space-y-1">
                <p className="text-lg font-semibold text-gray-900">{example.character}</p>
                <p className="text-sm text-primary font-medium">{example.pinyin}</p>
                <p className="text-sm text-gray-700">{example.meaning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Đang tải bài học ngữ pháp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-dark mb-4">Không thể tải dữ liệu</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadGrammarData}
              className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Thử lại
            </button>
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
                  Ngữ Pháp Từ Vựng
                </h1>
                <p className="text-xl text-white/90">
                  {topic?.title || `Chủ đề ${topicId}`}
                  </p>
                </div>
              </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              {/* Progress Bar */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tiến độ học tập</span>
                  <span className="text-sm font-semibold text-primary">{grammarProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${grammarProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <StatCard
                  label="Từ vựng"
                  value={wordsWithGrammar.length}
                  description="Tổng số từ"
                />
                <StatCard
                  label="Đã học"
                  value={`${studiedWordIds.size}/${wordsWithGrammar.length}`}
                  description="Đã lướt qua"
                />
                <StatCard
                  label="Tiến độ"
                  value={`${grammarProgress}%`}
                  description="Hoàn thành"
                />
                <StatCard
                  label="Từ loại"
                  value={partOfSpeechOptions.length}
                  description="Loại khác nhau"
                />
            </div>

            {/* Filter and Actions */}
            {wordsWithGrammar.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Danh sách từ vựng</h2>
                    <p className="text-sm text-gray-600">Lướt qua các từ vựng để học ngữ pháp</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={selectedPartOfSpeech}
                      onChange={(e) => setSelectedPartOfSpeech(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="all">Tất cả từ loại</option>
                      {partOfSpeechOptions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={markAllStudied}
                      className="px-5 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      Đánh dấu tất cả
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Words List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">

              {wordsWithGrammar.length === 0 ? (
                <EmptyState
                  title="Chủ đề này chưa có dữ liệu ngữ pháp"
                  description="Hãy quay lại sau khi giáo trình được cập nhật."
                />
              ) : filteredWords.length === 0 ? (
                <EmptyState
                  title="Không có từ vựng trong nhóm này"
                  description="Hãy chọn từ loại khác."
                />
              ) : (
                <div className="space-y-5">
                  {filteredWords.map((word, index) => (
                    <div
                      key={word.id}
                      className={`group relative border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                        studiedWordIds.has(word.id)
                          ? "border-green-400 bg-gradient-to-br from-green-50 to-white shadow-md"
                          : "border-gray-200 bg-white hover:border-primary/30"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Checkmark Badge */}
                      {studiedWordIds.has(word.id) && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Word Header */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-4xl font-bold text-gray-900">{word.character}</h3>
                            <div className="flex flex-wrap gap-2">
                              {word.partOfSpeechVi && (
                                <span className="inline-flex items-center text-xs font-semibold bg-blue-500 text-white px-3 py-1 rounded-full shadow-sm">
                                  {word.partOfSpeechVi}
                                </span>
                              )}
                              {word.partOfSpeechEn && (
                                <span className="inline-flex items-center text-xs font-semibold bg-purple-500 text-white px-3 py-1 rounded-full shadow-sm">
                                  {word.partOfSpeechEn}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xl text-primary font-semibold">{word.pinyin}</p>
                            <p className="text-lg text-gray-700 font-medium">{word.meaning}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleWordStudied(word.id)}
                          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap shadow-sm ${
                            studiedWordIds.has(word.id)
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                          }`}
                        >
                          {studiedWordIds.has(word.id) ? (
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Đã xem
                            </span>
                          ) : (
                            "Đánh dấu đã xem"
                          )}
                        </button>
                      </div>

                      {/* Grammar Content */}
                      <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                        {word.grammarNote && (
                          <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  <span className="font-semibold">Ghi chú ngữ pháp:</span> {word.grammarNote}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {word.structure && (
                          <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  <span className="font-semibold">Cấu trúc:</span> {word.structure}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {renderExamples(word)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

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

function StatCard({ label, value, description }: { label: string; value: string | number; description: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618V15.5a2 2 0 01-2 2H8m7-7l-7 3m7-3V5.5A2.5 2.5 0 0012.5 3h-5A2.5 2.5 0 005 5.5v11A2.5 2.5 0 007.5 19H8" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}


