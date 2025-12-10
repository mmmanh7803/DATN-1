"use client";

import { useState } from "react";
import { QuestionDto, AnswerSubmissionDto, QuizResultDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";
import { useToast } from "@/contexts/ToastContext";

interface QuizComponentProps {
  questions: QuestionDto[];
  onSubmit: (answers: AnswerSubmissionDto[]) => Promise<QuizResultDto>;
  onComplete: (result: QuizResultDto) => void;
}

export default function QuizComponent({ questions, onSubmit, onComplete }: QuizComponentProps) {
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultDto | null>(null);
  const toast = useToast();

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

  const handleSubmit = async () => {
    if (answers.size !== questions.length) {
      const confirmed = window.confirm(
        `Bạn chưa trả lời tất cả các câu hỏi. Bạn có muốn nộp bài không?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      const answerList: AnswerSubmissionDto[] = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers.get(q.id),
      }));

      const quizResult = await onSubmit(answerList);
      setResult(quizResult);
      onComplete(quizResult);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result.lessonCompleted ? "bg-green-100" : "bg-primary/20"
          }`}>
            <span className={`text-4xl ${result.lessonCompleted ? "text-green-600" : "text-primary"}`}>
              {result.lessonCompleted ? "✓" : "!"}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-dark mb-2">
            {result.lessonCompleted ? "Chúc mừng!" : "Hoàn thành"}
          </h3>
          <p className="text-gray-600">
            Bạn đã hoàn thành bài quiz với {result.correctAnswers}/{result.totalQuestions} câu đúng
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-dark">{result.score}</p>
              <p className="text-sm text-gray-600">Điểm số</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
              <p className="text-sm text-gray-600">Đúng</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
              <p className="text-sm text-gray-600">Sai</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{result.totalPoints}</p>
              <p className="text-sm text-gray-600">Tổng điểm</p>
            </div>
          </div>
        </div>

        {result.questionResults && result.questionResults.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="text-xl font-bold text-dark mb-4">Kết quả chi tiết:</h4>
            {result.questionResults.map((qr, index) => {
              const question = questions.find(q => q.id === qr.questionId);
              if (!question) return null;

              return (
                <div
                  key={qr.questionId}
                  className={`p-4 rounded-lg border-2 ${
                    qr.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-dark">
                      Câu {index + 1}: {question.questionText}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        qr.isCorrect
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {qr.isCorrect ? "✓ Đúng" : "✗ Sai"}
                    </span>
                  </div>
                  {qr.pointsEarned > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      Điểm: +{qr.pointsEarned} / {question.points}
                    </p>
                  )}
                  {qr.explanation && (
                    <p className="text-sm text-gray-700 bg-white/50 p-2 rounded mt-2">
                      {qr.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {result.nextLessonUnlocked && result.nextLessonId && (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 mb-6 text-center">
            <p className="text-primary font-semibold mb-2">
              🎉 Bài học tiếp theo đã được mở khóa!
            </p>
            <a
              href={`/lessons/${result.nextLessonId}`}
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Đi đến bài học tiếp theo
            </a>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => {
              setResult(null);
              setCurrentQuestionIndex(0);
              setAnswers(new Map());
            }}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Xem lại bài quiz
          </button>
        </div>
      </div>
    );
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

        {currentQuestion.audioUrl && (
          <audio controls className="w-full mb-4">
            <source src={getProxyAudioUrl(currentQuestion.audioUrl)} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ audio.
          </audio>
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

