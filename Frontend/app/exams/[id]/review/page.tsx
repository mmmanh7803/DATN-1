'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { examService, ExamResult, AnswerDetail } from '@/lib/services/examService';

// Icon Components
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

type FilterType = 'all' | 'correct' | 'wrong' | 'unanswered';

export default function ExamReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = parseInt(params.id as string);
  const progressId = searchParams.get('progressId');
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingQuestionId, setPlayingQuestionId] = useState<number | null>(null);

  useEffect(() => {
    loadResult();
    return () => {
      // Cleanup audio on unmount
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [examId, progressId]);

  const loadResult = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let examResult: ExamResult | null = null;

      if (progressId) {
        examResult = await examService.getExamResult(parseInt(progressId));
      } else {
        const savedProgressId = localStorage.getItem(`exam_${examId}_progressId`);
        if (savedProgressId) {
          examResult = await examService.getExamResult(parseInt(savedProgressId));
        }
      }
      
      if (!examResult) {
        examResult = await examService.getLatestExamResult(examId);
      }
      
      if (examResult) {
        setResult(examResult);
      } else {
        setError('Không tìm thấy kết quả thi để xem lại.');
      }
    } catch (error) {
      console.error('Error loading result:', error);
      setError('Có lỗi xảy ra khi tải kết quả.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string, questionId: number) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    if (playingQuestionId === questionId) {
      setPlayingQuestionId(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => setPlayingQuestionId(null);
    audio.play();
    setCurrentAudio(audio);
    setPlayingQuestionId(questionId);
  };

  const getFilteredQuestions = (): AnswerDetail[] => {
    if (!result) return [];
    
    switch (filter) {
      case 'correct':
        return result.details.filter(d => d.isCorrect);
      case 'wrong':
        return result.details.filter(d => !d.isCorrect && d.selectedOption);
      case 'unanswered':
        return result.details.filter(d => !d.selectedOption);
      default:
        return result.details;
    }
  };

  const filteredQuestions = getFilteredQuestions();
  const listeningQuestions = filteredQuestions.filter(q => q.skillType?.toUpperCase() === 'LISTENING');
  const readingQuestions = filteredQuestions.filter(q => q.skillType?.toUpperCase() === 'READING');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Xem Lại Đề Thi
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
        </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/exams" 
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-block"
            >
              Về trang đề thi
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderQuestion = (question: AnswerDetail, index: number) => {
    const isListening = question.skillType?.toUpperCase() === 'LISTENING';
    
    return (
      <div
        key={question.questionId}
        className={`bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 ${
          question.isCorrect 
            ? 'border-green-500' 
            : question.selectedOption 
              ? 'border-red-500' 
              : 'border-gray-300'
        }`}
      >
        {/* Question Header */}
        <div className={`px-6 py-4 ${
          isListening 
            ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {question.questionOrder}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  {isListening ? <HeadphonesIcon /> : <BookIcon />}
                  <span className="text-sm opacity-80">
                    {isListening ? 'Phần Nghe' : 'Phần Đọc'} - Phần {question.partNumber}
                  </span>
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.isCorrect 
                ? 'bg-green-400 text-green-900' 
                : question.selectedOption 
                  ? 'bg-red-400 text-red-900' 
                  : 'bg-gray-400 text-gray-900'
            }`}>
              {question.isCorrect ? '✓ Đúng' : question.selectedOption ? '✗ Sai' : '○ Bỏ qua'}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          {/* Audio Player */}
          {question.audioUrl && (
            <div className="mb-4">
              <button
                onClick={() => playAudio(question.audioUrl!, question.questionId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  playingQuestionId === question.questionId
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                {playingQuestionId === question.questionId ? <PauseIcon /> : <PlayIcon />}
                <span>{playingQuestionId === question.questionId ? 'Đang phát' : 'Phát audio'}</span>
              </button>
            </div>
          )}

          {/* Image */}
          {question.imageUrl && (
            <div className="mb-4">
              <Image
                src={question.imageUrl}
                alt={`Question ${question.questionOrder}`}
                width={400}
                height={300}
                className="rounded-xl object-contain max-h-64"
                unoptimized
              />
            </div>
          )}

          {/* Question Text */}
          {question.questionText && (
            <p className="text-lg font-medium text-gray-800 mb-4">{question.questionText}</p>
          )}

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = option.label === question.selectedOption;
              const isCorrect = option.isCorrect;
              
              let bgColor = 'bg-gray-50';
              let borderColor = 'border-gray-200';
              let textColor = 'text-gray-700';
              
              if (isCorrect) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-500';
                textColor = 'text-green-700';
              } else if (isSelected && !isCorrect) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-500';
                textColor = 'text-red-700';
              }
              
              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${bgColor} ${borderColor}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCorrect 
                      ? 'bg-green-500 text-white' 
                      : isSelected 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {option.label}
                  </span>
                  
                  {option.imageUrl ? (
                    <Image
                      src={option.imageUrl}
                      alt={option.label}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className={textColor}>{option.text}</span>
                  )}
                  
                  {isCorrect && (
                    <span className="ml-auto flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckIcon /> Đáp án đúng
                    </span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="ml-auto flex items-center gap-1 text-red-600 text-sm font-medium">
                      <XIcon /> Bạn đã chọn
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-800 mb-1">💡 Giải thích:</p>
              <p className="text-amber-700">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Link
            href={`/exams/${examId}/result?progressId=${result.progressId}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <BackIcon />
            Quay lại kết quả
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Xem Lại Đáp Án</h1>
          <p className="text-xl text-white/90">{result.examTitle}</p>
          
          {/* Stats Summary */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
              <CheckIcon />
              <span>Đúng: {result.correctAnswers}</span>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
              <XIcon />
              <span>Sai: {result.wrongAnswers}</span>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span>Bỏ qua: {result.unanswered}</span>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span>Điểm: {result.score}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-gray-600">
              <FilterIcon />
              Lọc:
            </span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({result.totalQuestions})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'correct' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đúng ({result.correctAnswers})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'wrong' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sai ({result.wrongAnswers})
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unanswered' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bỏ qua ({result.unanswered})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {/* Listening Section */}
          {listeningQuestions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎧 Phần Nghe ({listeningQuestions.length} câu)
              </h2>
              <div className="space-y-4">
                {listeningQuestions.map((q, idx) => renderQuestion(q, idx))}
              </div>
            </div>
          )}

          {/* Reading Section */}
          {readingQuestions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📖 Phần Đọc ({readingQuestions.length} câu)
              </h2>
              <div className="space-y-4">
                {readingQuestions.map((q, idx) => renderQuestion(q, idx))}
              </div>
            </div>
          )}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không có câu hỏi nào với bộ lọc này.</p>
            </div>
          )}
        </div>

        {/* Back to Result Button */}
        <div className="mt-8 text-center">
          <Link
            href={`/exams/${examId}/result?progressId=${result.progressId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <BackIcon />
            Quay lại kết quả
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

