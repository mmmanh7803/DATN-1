'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { examService, ExamPaper } from '@/lib/services/examService';

// Icon components
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 1l3 6 6 1-4.5 4.5L16 19l-6-3-6 3 1.5-6.5L1 8l6-1 3-6z" />
  </svg>
);

type FilterType = 'all' | 'completed' | 'notCompleted' | 'premium';

interface ExamItem {
  id: number;
  examNumber: number;
  title: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  isPremium: boolean;
  isCompleted: boolean;
  lastScore?: number;
  attempts: number;
}

// Level configurations
const levelConfig: Record<number, { 
  gradient: string; 
  color: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}> = {
  1: { 
    gradient: 'from-emerald-500 to-teal-600', 
    color: 'emerald',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    textColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-700'
  },
  2: { 
    gradient: 'from-emerald-500 to-teal-600', 
    color: 'emerald',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    textColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-700'
  },
  3: { 
    gradient: 'from-blue-500 to-indigo-600', 
    color: 'blue',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    textColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700'
  },
  4: { 
    gradient: 'from-blue-500 to-indigo-600', 
    color: 'blue',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    textColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700'
  },
  5: { 
    gradient: 'from-purple-500 to-pink-600', 
    color: 'purple',
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    textColor: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-700'
  },
  6: { 
    gradient: 'from-purple-500 to-pink-600', 
    color: 'purple',
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    textColor: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-700'
  },
};

export default function ExamListPage() {
  const params = useParams();
  const router = useRouter();
  const level = parseInt(params.level as string) || 1;
  
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    progress: 0,
    premiumCount: 0,
  });

  const config = levelConfig[level] || levelConfig[1];

  useEffect(() => {
    loadExams();
  }, [level]);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch exams from API
      const apiExams = await examService.getExamsByLevel(level);
      
      if (apiExams && apiExams.length > 0) {
        // Map API exams to display format
        const examItems: ExamItem[] = apiExams.map((exam: ExamPaper, index: number) => ({
          id: exam.id,
          examNumber: index + 1,
          title: exam.title || `Đề thi số ${index + 1}`,
          totalQuestions: exam.totalQuestions || getDefaultQuestions(level),
          durationMinutes: exam.durationMinutes || getDefaultDuration(level),
          passingScore: exam.passingScore || getDefaultPassingScore(level),
          isPremium: index >= 3 && index !== 4 && index !== 22 && index !== 30, // Some free exams
          isCompleted: false, // TODO: Get from user progress
          attempts: 0,
        }));
        
        setExams(examItems);
        updateStats(examItems);
      } else {
        // Generate demo exams if API returns empty
        generateDemoExams();
      }
    } catch (err) {
      console.error('Error loading exams:', err);
      setError('Không thể tải danh sách đề thi');
      generateDemoExams();
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoExams = () => {
    const demoExams: ExamItem[] = Array.from({ length: 46 }, (_, i) => ({
      id: i + 1,
      examNumber: i + 1,
      title: `Đề thi số ${i + 1}`,
      totalQuestions: getDefaultQuestions(level),
      durationMinutes: getDefaultDuration(level),
      passingScore: getDefaultPassingScore(level),
      isPremium: i >= 3 && i !== 4 && i !== 22 && i !== 30,
      isCompleted: false,
      attempts: 0,
    }));
    
    setExams(demoExams);
    updateStats(demoExams);
  };

  const updateStats = (examList: ExamItem[]) => {
    const completed = examList.filter(e => e.isCompleted).length;
    const premium = examList.filter(e => e.isPremium).length;
    setStats({
      total: examList.length,
      completed,
      progress: examList.length > 0 ? Math.round((completed / examList.length) * 100) : 0,
      premiumCount: premium,
    });
  };

  const getDefaultQuestions = (lvl: number): number => {
    const defaults: Record<number, number> = { 1: 40, 2: 60, 3: 80, 4: 100, 5: 100, 6: 101 };
    return defaults[lvl] || 40;
  };

  const getDefaultDuration = (lvl: number): number => {
    const defaults: Record<number, number> = { 1: 35, 2: 50, 3: 85, 4: 100, 5: 120, 6: 135 };
    return defaults[lvl] || 35;
  };

  const getDefaultPassingScore = (lvl: number): number => {
    return lvl <= 2 ? 120 : 180;
  };

  const filteredExams = exams.filter(exam => {
    switch (filter) {
      case 'completed':
        return exam.isCompleted;
      case 'notCompleted':
        return !exam.isCompleted;
      case 'premium':
        return exam.isPremium;
      default:
        return true;
    }
  });

  const filterCounts = {
    all: exams.length,
    completed: exams.filter(e => e.isCompleted).length,
    notCompleted: exams.filter(e => !e.isCompleted).length,
    premium: exams.filter(e => e.isPremium).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${config.gradient}`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-12">
          {/* Back Button */}
          <button 
            onClick={() => router.push('/exams')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <BackIcon />
            <span>Quay lại</span>
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white/80">Đề thi</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                  HSK {level}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Danh Sách Bài Thi HSK {level}
              </h1>
              <p className="text-white/80">
                Luyện tập với các đề thi chuẩn quốc tế
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-sm text-white/70 mb-1">Cấp độ</div>
                <div className="text-3xl font-bold text-white">{level}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-sm text-white/70 mb-1">Tổng đề thi</div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-sm text-white/70 mb-1">Đã hoàn thành</div>
                <div className="text-3xl font-bold text-white">{stats.completed}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-sm text-white/70 mb-1">Tiến độ</div>
                <div className="text-3xl font-bold text-white">{stats.progress}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
            <p className="flex items-center gap-2">
              <span>⚠️</span>
              {error}. Đang hiển thị dữ liệu mẫu.
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-8 inline-flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? `bg-gradient-to-r ${config.gradient} text-white`
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả ({filterCounts.all})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'completed'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã làm ({filterCounts.completed})
          </button>
          <button
            onClick={() => setFilter('notCompleted')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'notCompleted'
                ? 'bg-gray-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chưa làm ({filterCounts.notCompleted})
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1 ${
              filter === 'premium'
                ? 'bg-amber-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CrownIcon />
            Premium ({filterCounts.premium})
          </button>
        </div>

        {/* Section Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {filter === 'all' && `Tất cả (${filteredExams.length} bài thi)`}
          {filter === 'completed' && `Đã hoàn thành (${filteredExams.length} bài thi)`}
          {filter === 'notCompleted' && `Chưa làm (${filteredExams.length} bài thi)`}
          {filter === 'premium' && `Premium (${filteredExams.length} bài thi)`}
        </h2>

        {/* Exam Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-md animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExams.map((exam, index) => (
              <div
                key={exam.id}
                className={`group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${config.borderColor} animate-fade-in relative overflow-hidden`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Premium Badge */}
                {exam.isPremium && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <CrownIcon />
                      Premium
                    </div>
                  </div>
                )}

                {/* Exam Number */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${config.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {exam.examNumber}
                  </div>
                  {exam.isCompleted && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      ✓ Đã làm
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Bài thi HSK {level} chuẩn quốc tế
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <QuestionIcon />
                    <span>{exam.totalQuestions} câu</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon />
                    <span>{exam.durationMinutes} phút</span>
                  </div>
                </div>

                {/* Passing Score */}
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <CheckIcon />
                  <span>{exam.passingScore} điểm đạt</span>
                </div>

                {/* Action Section */}
                {exam.isPremium ? (
                  <div className={`${config.lightBg} rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <LockIcon />
                      <span className="font-semibold text-gray-700">Bài thi Premium</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Nâng cấp tài khoản để mở khóa
                    </p>
                    <Link
                      href="/pricing"
                      className="block w-full py-2 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-center font-semibold hover:opacity-90 transition-all"
                    >
                      Nâng cấp
                    </Link>
                  </div>
                ) : (
                  <div className={`${config.lightBg} rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <PlayIcon />
                      <span className="font-semibold text-gray-700">Sẵn sàng làm bài</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {exam.attempts > 0 
                        ? `Đã làm ${exam.attempts} lần` 
                        : 'Chưa có lần làm bài nào'}
                    </p>
                    <Link
                      href={`/exams/${exam.id}`}
                      className={`block w-full py-2 px-4 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-center font-semibold hover:opacity-90 transition-all hover:shadow-lg`}
                    >
                      Bắt đầu
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredExams.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không có đề thi nào</h3>
            <p className="text-gray-500">
              {filter === 'completed' && 'Bạn chưa hoàn thành đề thi nào'}
              {filter === 'notCompleted' && 'Bạn đã hoàn thành tất cả đề thi'}
              {filter === 'premium' && 'Không có đề thi Premium nào'}
            </p>
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

