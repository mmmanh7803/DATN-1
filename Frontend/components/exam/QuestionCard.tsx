'use client';

import { useState } from 'react';
import { Question } from '@/types/exam';
import AudioPlayer from './AudioPlayer';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (optionLabel: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
}: QuestionCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {/* Question header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold">
            {questionNumber}
          </div>
          <div>
            <div className="text-sm text-gray-500">
              Câu {questionNumber} / {totalQuestions}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {question.questionType === 'LISTENING' ? (
                <>
                  <svg className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-pink-600">Nghe</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-600">Đọc</span>
                </>
              )}
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                {question.points} điểm
              </span>
            </div>
          </div>
        </div>

        {/* Translation toggle */}
        {question.translation && (
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            {showTranslation ? 'Ẩn dịch' : 'Hiện dịch'}
          </button>
        )}
      </div>

      {/* Audio player for listening questions */}
      {question.questionType === 'LISTENING' && question.audioUrl && (
        <div className="mb-6">
          <AudioPlayer audioUrl={question.audioUrl} />
        </div>
      )}

      {/* Image */}
      {question.imageUrl && (
        <div className="mb-6 flex justify-center">
          <img
            src={question.imageUrl}
            alt={`Question ${questionNumber}`}
            className="max-w-md w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Question text */}
      {question.questionText && (
        <div className="mb-6">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <p className="text-lg text-gray-900 whitespace-pre-wrap">{question.questionText}</p>
          </div>
        </div>
      )}

      {/* Translation */}
      {showTranslation && question.translation && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <p className="text-sm text-gray-700 italic">{question.translation}</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.optionLabel;
          
          return (
            <button
              key={option.optionLabel}
              onClick={() => onAnswerSelect(option.optionLabel)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium
                    ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 text-gray-600'
                    }
                  `}
                >
                  {option.optionLabel}
                </div>
                <span className={`flex-1 ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                  {option.optionText}
                </span>
                {isSelected && (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${
              isFirstQuestion
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Câu trước</span>
        </button>

        <div className="text-sm text-gray-500">
          {selectedAnswer ? (
            <span className="text-green-600 font-medium">✓ Đã chọn đáp án</span>
          ) : (
            <span>Chọn đáp án của bạn</span>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={isLastQuestion}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${
              isLastQuestion
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-md'
            }
          `}
        >
          <span>Câu tiếp</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

