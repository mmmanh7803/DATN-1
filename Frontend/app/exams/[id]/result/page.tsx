'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { examService, ExamResult } from '@/lib/services/examService';

// Icon Components
const TrophyIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = parseInt(params.id as string);
  const progressId = searchParams.get('progressId');
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResult();
  }, [examId, progressId]);

  const loadResult = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let examResult: ExamResult | null = null;

      // Ưu tiên lấy từ progressId trong URL
      if (progressId) {
        examResult = await examService.getExamResult(parseInt(progressId));
      }
      
      // Nếu không có progressId, thử lấy từ localStorage
      if (!examResult) {
        const savedProgressId = localStorage.getItem(`exam_${examId}_progressId`);
        if (savedProgressId) {
          examResult = await examService.getExamResult(parseInt(savedProgressId));
        }
      }
      
      // Cuối cùng, lấy kết quả mới nhất từ server
      if (!examResult) {
        examResult = await examService.getLatestExamResult(examId);
      }
      
      if (examResult) {
        setResult(examResult);
      } else {
        setError('Không tìm thấy kết quả thi. Vui lòng làm bài thi trước.');
      }
    } catch (error) {
      console.error('Error loading result:', error);
      setError('Có lỗi xảy ra khi tải kết quả. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 90) return 'from-emerald-400 to-emerald-600';
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 70) return 'from-blue-400 to-blue-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tính toán kết quả...</p>
        </div>
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
            <p className="text-gray-600 mb-6">{error || 'Vui lòng làm bài thi trước.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href={`/exams/${examId}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Làm bài thi
              </Link>
              <Link 
                href="/exams" 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Về trang đề thi
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Hero Result Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${result.isPassed ? 'from-green-500 via-emerald-500 to-teal-500' : 'from-orange-500 via-red-500 to-pink-500'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-16 text-center">
          {/* Trophy/Medal */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            result.isPassed ? 'bg-yellow-400 text-yellow-800' : 'bg-gray-300 text-gray-600'
          }`}>
            <TrophyIcon />
          </div>

          {/* Status */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {result.isPassed ? '🎉 Chúc mừng! Bạn đã đạt!' : '💪 Cố gắng thêm nhé!'}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {result.examTitle}
          </p>

          {/* Score */}
          <div className="inline-block bg-white rounded-3xl px-12 py-8 shadow-2xl">
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {result.score}%
            </div>
            <div className="text-gray-500 mt-2">
              Điểm đạt: {result.passingScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
              <div className="text-gray-500 flex items-center justify-center gap-1 mt-1">
                <CheckIcon />
                <span>Đúng</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-red-600">{result.wrongAnswers}</div>
              <div className="text-gray-500 flex items-center justify-center gap-1 mt-1">
                <XIcon />
                <span>Sai</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-400">{result.unanswered}</div>
              <div className="text-gray-500 mt-1">Bỏ qua</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-indigo-600 flex items-center justify-center gap-1">
                <ClockIcon />
                {result.timeSpent}
              </div>
              <div className="text-gray-500 mt-1">Thời gian</div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Chi tiết theo phần</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Listening */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-pink-700 flex items-center gap-2">
                    🎧 Phần Nghe
                  </h3>
                  <span className={`text-2xl font-bold ${getScoreColor(result.listeningScore)}`}>
                    {result.listeningScore}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tiến độ</span>
                  <span>{result.listeningCorrect}/{result.listeningTotal} câu đúng</span>
                </div>
                <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getScoreGradient(result.listeningScore)} transition-all duration-500`}
                    style={{ width: `${result.listeningScore}%` }}
                  />
                </div>
              </div>

              {/* Reading */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    📖 Phần Đọc
                  </h3>
                  <span className={`text-2xl font-bold ${getScoreColor(result.readingScore)}`}>
                    {result.readingScore}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tiến độ</span>
                  <span>{result.readingCorrect}/{result.readingTotal} câu đúng</span>
                </div>
                <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getScoreGradient(result.readingScore)} transition-all duration-500`}
                    style={{ width: `${result.readingScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Score Visualization */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Phân bố câu trả lời</h2>
            
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {/* Pie Chart Representation */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  {/* Correct */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeDasharray={`${(result.correctAnswers / result.totalQuestions) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                  {/* Wrong */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${(result.wrongAnswers / result.totalQuestions) * 251.2} 251.2`}
                    strokeDashoffset={`${-(result.correctAnswers / result.totalQuestions) * 251.2}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{result.totalQuestions}</div>
                    <div className="text-sm text-gray-500">Tổng câu</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Đúng: {result.correctAnswers} ({Math.round((result.correctAnswers / result.totalQuestions) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Sai: {result.wrongAnswers} ({Math.round((result.wrongAnswers / result.totalQuestions) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Bỏ qua: {result.unanswered} ({Math.round((result.unanswered / result.totalQuestions) * 100)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm">Điểm đạt được</p>
                <p className="text-2xl font-bold text-purple-600">{result.earnedPoints}/{result.totalPoints}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tỷ lệ đạt</p>
                <p className="text-2xl font-bold text-indigo-600">{result.score}%</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-600 text-sm">Kết quả</p>
                <p className={`text-2xl font-bold ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isPassed ? '✓ ĐẠT' : '✗ CHƯA ĐẠT'}
                </p>
              </div>
            </div>
          </div>

          {/* Completion Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-gray-600">Hoàn thành lúc:</p>
                <p className="text-lg font-semibold text-gray-800">{formatDate(result.completedAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Mã bài thi:</p>
                <p className="text-lg font-semibold text-gray-800">#{result.progressId}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/exams/${examId}/review?progressId=${result.progressId}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-indigo-500 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              <EyeIcon />
              Xem lại đáp án
            </Link>
            <Link
              href={`/exams/${examId}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-colors shadow-lg"
            >
              <RefreshIcon />
              Làm lại
            </Link>
            <Link
              href="/exams"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg"
            >
              <HomeIcon />
              Về trang đề thi
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
