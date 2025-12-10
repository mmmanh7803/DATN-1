"use client";

import { useState, useEffect, useRef } from "react";
import { WordWithProgressDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";

type TabType = "choose" | "listen";

interface FillInBlankActivityProps {
  words: WordWithProgressDto[];
  onComplete: (result: { correct: number; total: number; score: number }) => void;
}

interface Question {
  word: WordWithProgressDto;
  options?: WordWithProgressDto[]; // Cho tab "choose"
  correctAnswer: string;
  sentenceWithBlank: string;
}

export default function FillInBlankActivity({
  words,
  onComplete,
}: FillInBlankActivityProps) {
  const [activeTab, setActiveTab] = useState<TabType>("choose");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tạo câu hỏi khi tab hoặc words thay đổi
  useEffect(() => {
    if (words.length > 0) {
      generateQuestions();
    }
  }, [words, activeTab]);

  const generateQuestions = () => {
    // Xáo trộn và chọn từ vựng
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, Math.min(10, shuffledWords.length));

    const newQuestions: Question[] = selectedWords.map((word) => {
      // Tạo câu có chỗ trống
      let sentenceWithBlank = word.exampleSentence || `这是${word.character}。`;
      sentenceWithBlank = sentenceWithBlank.replace(
        word.character,
        "_____"
      );

      // Tạo options cho tab "choose" (4 lựa chọn)
      const wrongWords = words
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [word, ...wrongWords].sort(() => Math.random() - 0.5);

      return {
        word,
        options,
        correctAnswer: word.character,
        sentenceWithBlank,
      };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setUserAnswer("");
    setSelectedOption(null);
    setShowFeedback(false);
    setStats({ correct: 0, incorrect: 0 });
    setIsCompleted(false);
  };

  const playAudio = (text?: string) => {
    const textToPlay = text || questions[currentIndex]?.word.character;
    if (!textToPlay) return;

    const audioUrl = getProxyAudioUrl(textToPlay);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play().catch((error) => {
      console.error("Lỗi khi phát audio:", error);
    });
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const currentQuestion = questions[currentIndex];
    let answer = activeTab === "choose" ? selectedOption : userAnswer.trim();
    
    if (!answer) return;

    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setStats((prev) => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: !correct ? prev.incorrect + 1 : prev.incorrect,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Hoàn thành
      const total = questions.length;
      const correct = stats.correct + (isCorrect ? 0 : 0); // Đã cập nhật ở handleSubmit
      const score = Math.round((stats.correct / total) * 100);
      setIsCompleted(true);
      onComplete({ correct: stats.correct, total, score });
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // generateQuestions sẽ được gọi bởi useEffect
  };

  const handleRestart = () => {
    generateQuestions();
  };

  const currentQuestion = questions[currentIndex];

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tạo câu hỏi...</p>
      </div>
    );
  }

  if (isCompleted) {
    const score = Math.round((stats.correct / questions.length) * 100);
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">
          {score >= 80 ? "🎉" : score >= 50 ? "👍" : "💪"}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Hoàn thành!
        </h2>
        <p className="text-gray-600 mb-8">
          Bạn đã hoàn thành {questions.length} câu hỏi
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
          <div className={`text-5xl font-bold ${
            score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
          }`}>
            {score}%
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition font-medium"
        >
          🔄 Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange("choose")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
              activeTab === "choose"
                ? "bg-indigo-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Chọn đáp án
            </span>
          </button>
          <button
            onClick={() => handleTabChange("listen")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
              activeTab === "listen"
                ? "bg-indigo-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Nghe và điền từ
            </span>
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tiến độ</span>
            <span className="text-sm font-medium text-indigo-600">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="p-6">
          {activeTab === "choose" ? (
            // Tab: Chọn đáp án
            <div className="space-y-6">
              {/* Sentence with blank */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
                <p className="text-3xl font-medium text-gray-800 leading-relaxed">
                  {currentQuestion.sentenceWithBlank?.split("_____").map((part: string, i: number, arr: string[]) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={`inline-block min-w-[80px] mx-2 px-4 py-2 rounded-lg border-2 border-dashed ${
                          showFeedback
                            ? isCorrect
                              ? "border-green-400 bg-green-50 text-green-700"
                              : "border-red-400 bg-red-50 text-red-700"
                            : selectedOption
                              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}>
                          {showFeedback
                            ? currentQuestion.correctAnswer
                            : selectedOption || "?"}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => !showFeedback && setSelectedOption(option.character)}
                    disabled={showFeedback}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      showFeedback
                        ? option.character === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50 text-green-700"
                          : option.character === selectedOption
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                        : selectedOption === option.character
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="text-2xl font-bold mb-1">{option.character}</div>
                    <div className="text-sm opacity-75">{option.pinyin}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Tab: Nghe và điền từ
            <div className="space-y-6">

              {/* Audio Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => playAudio()}
                  className="flex items-center gap-3 px-8 py-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105 active:scale-95"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-xl font-bold">Phát âm thanh</span>
                </button>
              </div>

              {/* Sentence with blank */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
                <p className="text-3xl font-medium text-gray-800 leading-relaxed">
                  {currentQuestion.sentenceWithBlank?.split("_____").map((part: string, i: number, arr: string[]) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={`inline-block min-w-[80px] mx-2 px-4 py-2 rounded-lg border-2 border-dashed ${
                          showFeedback
                            ? isCorrect
                              ? "border-green-400 bg-green-50 text-green-700"
                              : "border-red-400 bg-red-50 text-red-700"
                            : userAnswer
                              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}>
                          {showFeedback
                            ? currentQuestion.correctAnswer
                            : userAnswer || "?"}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Input */}
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Điền từ tiếng Trung bạn nghe được:
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (showFeedback) {
                        handleNext();
                      } else {
                        handleSubmit();
                      }
                    }
                  }}
                  disabled={showFeedback}
                  placeholder="Nhập từ tiếng Trung..."
                  className={`w-full px-6 py-4 text-2xl text-center border-2 rounded-xl focus:outline-none transition-all ${
                    showFeedback
                      ? isCorrect
                        ? "border-green-400 bg-green-50"
                        : "border-red-400 bg-red-50"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  } disabled:bg-gray-50`}
                  autoComplete="off"
                />
                {showFeedback && !isCorrect && (
                  <p className="mt-2 text-center text-red-600">
                    Đáp án đúng: <span className="font-bold">{currentQuestion.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Feedback & Actions */}
          <div className="mt-6">
            {showFeedback && (
              <div
                className={`mb-4 p-4 rounded-xl text-center font-medium animate-fade-in ${
                  isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {isCorrect ? (
                  <span className="text-lg">🎉 Chính xác!</span>
                ) : (
                  <span className="text-lg">❌ Không đúng rồi!</span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {!showFeedback ? (
                <button
                  onClick={handleSubmit}
                  disabled={activeTab === "choose" ? !selectedOption : !userAnswer.trim()}
                  className="flex-1 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Kiểm tra
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all"
                >
                  {currentIndex < questions.length - 1 ? "Tiếp theo →" : "Xem kết quả"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
          <div className="text-green-700 text-sm">Đúng</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
          <div className="text-red-700 text-sm">Sai</div>
        </div>
      </div>
    </div>
  );
}

