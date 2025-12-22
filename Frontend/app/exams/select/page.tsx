'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { examService, ExamPaper } from '@/lib/services/examService';

// Icon components
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// HSK Level configurations
const hskLevelConfig: Record<number, { gradient: string; bgGradient: string; name: string }> = {
  1: { gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', name: 'HSK 1' },
  2: { gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', name: 'HSK 2' },
  3: { gradient: 'from-blue-500 to-indigo-600', bgGradient: 'from-blue-50 to-indigo-50', name: 'HSK 3' },
  4: { gradient: 'from-blue-500 to-indigo-600', bgGradient: 'from-blue-50 to-indigo-50', name: 'HSK 4' },
  5: { gradient: 'from-purple-500 to-pink-600', bgGradient: 'from-purple-50 to-pink-50', name: 'HSK 5' },
  6: { gradient: 'from-purple-500 to-pink-600', bgGradient: 'from-purple-50 to-pink-50', name: 'HSK 6' },
};

function ExamSelectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = parseInt(searchParams.get('level') || '1');
  
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const levelConfig = hskLevelConfig[level] || hskLevelConfig[1];

  useEffect(() => {
    loadExams();
  }, [level]);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await examService.getHSKExamsByLevel(level);
      setExams(data);
      
      if (data.length === 0) {
        setError('Chưa có đề thi nào cho cấp độ này');
      }
    } catch (err) {
      console.error('Error loading exams:', err);
      setError('Không thể tải danh sách đề thi');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${levelConfig.bgGradient}`}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <BackIcon />
            <span>Quay lại</span>
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-white font-semibold">{levelConfig.name}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Chọn đề thi {levelConfig.name}
            </h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              {exams.length > 0 
                ? `Có ${exams.length} đề thi sẵn sàng cho bạn luyện tập`
                : 'Đề thi sẽ sớm được cập nhật'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="flex gap-4 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error && exams.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 shadow-lg max-w-lg mx-auto">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
              <p className="text-gray-600 mb-8">
                Đề thi {levelConfig.name} đang được chuẩn bị. Vui lòng quay lại sau!
              </p>
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-light via-primary to-primary-dark hover:opacity-90 transition-all shadow-lg"
              >
                <BackIcon />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, index) => (
              <div
                key={exam.id}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Exam Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {exam.title}
                </h3>
                
                {/* Description */}
                {exam.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exam.description}
                  </p>
                )}

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <QuestionIcon />
                      <span>{exam.totalQuestions} câu hỏi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <ClockIcon />
                      <span>{exam.durationMinutes} phút</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <TrophyIcon />
                      <span>Điểm đạt: {exam.passingScore}/{exam.totalPoints}</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400 mb-4">
                  Tạo ngày: {formatDate(exam.createdAt)}
                </p>

                {/* Start Button */}
                <Link
                  href={`/exams/${exam.id}`}
                  className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${levelConfig.gradient} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                >
                  <PlayIcon />
                  Bắt đầu làm bài
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Level Navigation */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Chọn cấp độ khác</h3>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((lvl) => {
              const config = hskLevelConfig[lvl];
              const isActive = lvl === level;
              return (
                <Link
                  key={lvl}
                  href={`/exams/select?level=${lvl}`}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-100'
                  }`}
                >
                  HSK {lvl}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ExamSelectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ExamSelectContent />
    </Suspense>
  );
}

