"use client";

import { useState, useEffect } from "react";
import { WordWithProgressDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";

interface VocabularyPracticeCardProps {
  word: WordWithProgressDto;
  wrongImageWord?: WordWithProgressDto; // Từ vựng khác để hiển thị hình ảnh sai
  isCorrectImage: boolean; // true = hiển thị hình đúng, false = hiển thị hình sai
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export default function VocabularyPracticeCard({
  word,
  wrongImageWord,
  isCorrectImage,
  onAnswer,
  onNext,
}: VocabularyPracticeCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Hình ảnh hiển thị: nếu isCorrectImage = true thì dùng word.imageUrl, ngược lại dùng wrongImageWord?.imageUrl
  const displayedImage = isCorrectImage 
    ? word.imageUrl 
    : (wrongImageWord?.imageUrl || word.imageUrl); // Fallback nếu không có wrongImageWord

  useEffect(() => {
    // Reset khi word thay đổi
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsAnimating(false);
  }, [word.id]);

  const handleAnswer = (userAnswer: boolean) => {
    if (selectedAnswer !== null) return; // Đã trả lời rồi

    setSelectedAnswer(userAnswer);
    setIsAnimating(true);

    // Kiểm tra đáp án: userAnswer phải khớp với isCorrectImage
    const isCorrect = userAnswer === isCorrectImage;
    
    setTimeout(() => {
      setShowFeedback(true);
      onAnswer(isCorrect);
      
      // Tự động chuyển sang từ tiếp theo sau 1.5 giây
      setTimeout(() => {
        setIsAnimating(false);
        setSelectedAnswer(null);
        setShowFeedback(false);
        onNext();
      }, 1500);
    }, 300);
  };

  const playAudio = () => {
    if (word.character) {
      const audioUrl = getProxyAudioUrl(word.character);
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Lỗi khi phát audio:", error);
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card Container */}
      <div
        className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          showFeedback
            ? selectedAnswer === isCorrectImage
              ? "ring-4 ring-green-500"
              : "ring-4 ring-red-500"
            : ""
        } ${isAnimating ? "scale-95" : "scale-100"}`}
      >
        {/* Image Section */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-video flex items-center justify-center overflow-hidden">
          {displayedImage ? (
            <img
              src={displayedImage}
              alt={isCorrectImage ? word.character : wrongImageWord?.character || "Image"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback nếu hình ảnh không load được
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-24 h-24 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Chưa có hình ảnh</p>
            </div>
          )}

          {/* Feedback Overlay */}
          {showFeedback && (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
                showFeedback ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`text-8xl animate-bounce ${
                  selectedAnswer === isCorrectImage ? "text-green-400" : "text-red-400"
                }`}
              >
                {selectedAnswer === isCorrectImage ? "✓" : "✗"}
              </div>
            </div>
          )}
        </div>

        {/* Word Section */}
        <div className="p-8">
          <div className="text-center mb-6">
            {/* Chinese Character */}
            <div className="text-7xl font-bold text-gray-900 mb-4">
              {word.character}
            </div>

            {/* Pinyin */}
            <div className="text-3xl text-blue-600 mb-2 font-medium">
              {word.pinyin}
            </div>

            {/* Meaning - chỉ hiển thị sau khi trả lời */}
            {showFeedback && (
              <div className="text-xl text-gray-600 mt-4 animate-fade-in">
                {word.meaning}
              </div>
            )}
          </div>

          {/* Audio Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={playAudio}
              className="px-6 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Nghe phát âm
            </button>
          </div>

          {/* Action Buttons */}
          {!showFeedback && (
            <div className="flex gap-4">
              {/* True Button */}
              <button
                onClick={() => handleAnswer(true)}
                disabled={selectedAnswer !== null}
                className={`flex-1 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                  selectedAnswer === true
                    ? "bg-green-500 scale-95"
                    : "bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95"
                } text-white shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Đúng</span>
              </button>

              {/* False Button */}
              <button
                onClick={() => handleAnswer(false)}
                disabled={selectedAnswer !== null}
                className={`flex-1 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                  selectedAnswer === false
                    ? "bg-red-500 scale-95"
                    : "bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95"
                } text-white shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Sai</span>
              </button>
            </div>
          )}

          {/* Feedback Message */}
          {showFeedback && (
            <div
              className={`mt-4 p-4 rounded-xl text-center font-medium animate-fade-in ${
                selectedAnswer === isCorrectImage
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {selectedAnswer === isCorrectImage ? (
                <span className="text-lg">🎉 Chính xác! Hình ảnh khớp với từ vựng.</span>
              ) : (
                <span className="text-lg">
                  ❌ Không đúng. Hình ảnh {isCorrectImage ? "khớp" : "không khớp"} với từ vựng này.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

