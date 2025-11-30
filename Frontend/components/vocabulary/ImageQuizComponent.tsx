"use client";

import { useState } from "react";
import { QuestionDto } from "@/types";

interface ImageQuizComponentProps {
  questions: QuestionDto[];
  onComplete: (result: { correct: number; total: number; score: number }) => void;
}

export default function ImageQuizComponent({ questions, onComplete }: ImageQuizComponentProps) {
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelectAnswer = (optionId: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, optionId);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answers.size !== questions.length) {
      const confirmed = window.confirm(
        `Bạn chưa trả lời tất cả các câu hỏi. Bạn có muốn nộp bài không?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    
    // Tính điểm
    let correctCount = 0;
    questions.forEach((question) => {
      const selectedOptionId = answers.get(question.id);
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (selectedOption?.isCorrect) {
          correctCount++;
        }
      }
    });

    const total = questions.length;
    const score = Math.round((correctCount / total) * 100);

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete({
        correct: correctCount,
        total: total,
        score: score,
      });
    }, 500);
  };

  if (showResult) {
    return null; // Result sẽ được hiển thị ở parent component
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Câu {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="text-sm font-semibold text-gray-600">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">
          {currentQuestion.questionText}
        </h3>

        {/* Image */}
        {currentQuestion.imageUrl ? (
          <div className="mb-6 flex justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt="Câu hỏi"
              className="max-w-full h-auto rounded-lg shadow-md max-h-64"
              onError={(e) => {
                // Fallback nếu hình ảnh không load được
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="mb-6 flex justify-center items-center bg-gray-100 rounded-lg h-64">
            <div className="text-center text-gray-400">
              <svg
                className="w-24 h-24 mx-auto mb-2"
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
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers.get(currentQuestion.id) === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "bg-gray-50 border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="font-semibold text-gray-600 mr-2">{option.optionLabel}.</span>
                  <span className="text-dark">{option.optionText}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50"
          >
            {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary-dark transition"
          >
            Tiếp theo →
          </button>
        )}
      </div>
    </div>
  );
}

