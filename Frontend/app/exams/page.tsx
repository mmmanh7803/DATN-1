'use client';

import { useState, useEffect } from 'react';
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

// Types
interface ExamTypeDisplay {
  id: number;
  level: number;
  title: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  gradient: string;
  borderColor: string;
  examCount: number;
}

interface CategoryFilter {
  id: string;
  name: string;
  levels: number[];
  description: string;
  progress: number;
  examCount: number;
}

// Default HSK exam type configurations
const hskExamConfig: Record<number, { gradient: string; borderColor: string; description: string }> = {
  1: {
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    description: 'Đề thi chuẩn HSK cấp độ 1 - Nghe và đọc cơ bản',
  },
  2: {
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    description: 'Đề thi chuẩn HSK cấp độ 2 - Nghe và đọc sơ cấp',
  },
  3: {
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-200 hover:border-blue-400',
    description: 'Đề thi chuẩn HSK cấp độ 3 - Nghe, đọc và viết cơ bản',
  },
  4: {
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-200 hover:border-blue-400',
    description: 'Đề thi chuẩn HSK cấp độ 4 - Nghe, đọc, viết trung cấp',
  },
  5: {
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-200 hover:border-purple-400',
    description: 'Đề thi chuẩn HSK cấp độ 5 - Nghe, đọc, viết nâng cao',
  },
  6: {
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-200 hover:border-purple-400',
    description: 'Đề thi chuẩn HSK cấp độ 6 - Nghe, đọc, viết cao cấp',
  },
};

const tips = [
  {
    icon: '⏱️',
    title: 'Quản lý thời gian',
    description: 'Phân chia thời gian hợp lý cho từng phần thi, không nên mắc kẹt ở một câu quá lâu',
  },
  {
    icon: '📝',
    title: 'Luyện tập thường xuyên',
    description: 'Làm đề thi thử hàng ngày để quen với format và cải thiện tốc độ làm bài',
  },
  {
    icon: '📚',
    title: 'Ghi nhớ từ vựng',
    description: 'Học thuộc từ vựng theo từng cấp độ HSK, đặc biệt chú ý các từ xuất hiện thường xuyên',
  },
  {
    icon: '📊',
    title: 'Theo dõi tiến bộ',
    description: 'Ghi chép điểm số và phân tích lỗi sai để có kế hoạch ôn tập phù hợp',
  },
];

export default function ExamsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [examTypes, setExamTypes] = useState<ExamTypeDisplay[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    completed: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExamData();
  }, []);

  const loadExamData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch exams from API
      const exams = await examService.getAllExams();
      
      if (exams.length > 0) {
        // Group exams by level and create display data
        const examsByLevel = examService.groupExamsByLevel(exams);
        const examCountByLevel = examService.countExamsByLevel(exams);
        
        // Create exam types for display (one per level)
        const displayTypes: ExamTypeDisplay[] = [];
        
        for (let level = 1; level <= 6; level++) {
          const levelExams = examsByLevel[level] || [];
          const config = hskExamConfig[level];
          
          // Use first exam of this level for default values, or create placeholder
          const firstExam = levelExams[0];
          
          displayTypes.push({
            id: level,
            level,
            title: `Đề thi HSK ${level}`,
            description: config?.description || `Đề thi HSK cấp độ ${level}`,
            totalQuestions: firstExam?.totalQuestions || getDefaultQuestions(level),
            durationMinutes: firstExam?.durationMinutes || getDefaultDuration(level),
            passingScore: firstExam?.passingScore || getDefaultPassingScore(level),
            gradient: config?.gradient || 'from-gray-500 to-gray-600',
            borderColor: config?.borderColor || 'border-gray-200 hover:border-gray-400',
            examCount: examCountByLevel[level] || 0,
          });
        }
        
        setExamTypes(displayTypes);
        
        // Update category filters with exam counts
        const filters: CategoryFilter[] = [
          {
            id: 'basic',
            name: 'HSK 1-2',
            levels: [1, 2],
            description: 'Cơ bản',
            progress: 0,
            examCount: (examCountByLevel[1] || 0) + (examCountByLevel[2] || 0),
          },
          {
            id: 'intermediate',
            name: 'HSK 3-4',
            levels: [3, 4],
            description: 'Trung cấp',
            progress: 0,
            examCount: (examCountByLevel[3] || 0) + (examCountByLevel[4] || 0),
          },
          {
            id: 'advanced',
            name: 'HSK 5-6',
            levels: [5, 6],
            description: 'Nâng cao',
            progress: 0,
            examCount: (examCountByLevel[5] || 0) + (examCountByLevel[6] || 0),
          },
        ];
        
        setCategoryFilters(filters);
        
        // Update stats
        setStats({
          totalExams: exams.length,
          completed: 0, // TODO: Get from user progress
          averageScore: 0, // TODO: Get from user progress
        });
      } else {
        // Use default data if no exams from API
        loadDefaultData();
      }
    } catch (err) {
      console.error('Error loading exam data:', err);
      setError('Không thể tải dữ liệu đề thi');
      loadDefaultData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultData = () => {
    // Default exam types
    const defaultTypes: ExamTypeDisplay[] = [
      { id: 1, level: 1, title: 'Đề thi HSK 1', description: hskExamConfig[1].description, totalQuestions: 40, durationMinutes: 35, passingScore: 120, gradient: hskExamConfig[1].gradient, borderColor: hskExamConfig[1].borderColor, examCount: 0 },
      { id: 2, level: 2, title: 'Đề thi HSK 2', description: hskExamConfig[2].description, totalQuestions: 60, durationMinutes: 50, passingScore: 120, gradient: hskExamConfig[2].gradient, borderColor: hskExamConfig[2].borderColor, examCount: 0 },
      { id: 3, level: 3, title: 'Đề thi HSK 3', description: hskExamConfig[3].description, totalQuestions: 80, durationMinutes: 85, passingScore: 180, gradient: hskExamConfig[3].gradient, borderColor: hskExamConfig[3].borderColor, examCount: 0 },
      { id: 4, level: 4, title: 'Đề thi HSK 4', description: hskExamConfig[4].description, totalQuestions: 100, durationMinutes: 100, passingScore: 180, gradient: hskExamConfig[4].gradient, borderColor: hskExamConfig[4].borderColor, examCount: 0 },
      { id: 5, level: 5, title: 'Đề thi HSK 5', description: hskExamConfig[5].description, totalQuestions: 100, durationMinutes: 120, passingScore: 180, gradient: hskExamConfig[5].gradient, borderColor: hskExamConfig[5].borderColor, examCount: 0 },
      { id: 6, level: 6, title: 'Đề thi HSK 6', description: hskExamConfig[6].description, totalQuestions: 101, durationMinutes: 135, passingScore: 180, gradient: hskExamConfig[6].gradient, borderColor: hskExamConfig[6].borderColor, examCount: 0 },
    ];
    
    setExamTypes(defaultTypes);
    
    // Default category filters
    const defaultFilters: CategoryFilter[] = [
      { id: 'basic', name: 'HSK 1-2', levels: [1, 2], description: 'Cơ bản', progress: 0, examCount: 0 },
      { id: 'intermediate', name: 'HSK 3-4', levels: [3, 4], description: 'Trung cấp', progress: 0, examCount: 0 },
      { id: 'advanced', name: 'HSK 5-6', levels: [5, 6], description: 'Nâng cao', progress: 0, examCount: 0 },
    ];
    
    setCategoryFilters(defaultFilters);
    
    setStats({
      totalExams: 0,
      completed: 0,
      averageScore: 0,
    });
  };

  // Helper functions for default values
  const getDefaultQuestions = (level: number): number => {
    const defaults: Record<number, number> = { 1: 40, 2: 60, 3: 80, 4: 100, 5: 100, 6: 101 };
    return defaults[level] || 50;
  };

  const getDefaultDuration = (level: number): number => {
    const defaults: Record<number, number> = { 1: 35, 2: 50, 3: 85, 4: 100, 5: 120, 6: 135 };
    return defaults[level] || 60;
  };

  const getDefaultPassingScore = (level: number): number => {
    return level <= 2 ? 120 : 180;
  };

  const filteredExamTypes = selectedCategory
    ? examTypes.filter((exam) =>
        categoryFilters.find((cat) => cat.id === selectedCategory)?.levels.includes(exam.level)
      )
    : examTypes;

  const getLevelBadge = (level: number) => {
    if (level <= 2) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (level <= 4) return { bg: 'bg-blue-100', text: 'text-blue-700' };
    return { bg: 'bg-purple-100', text: 'text-purple-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🎯 Đề Thi HSK
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Luyện thi HSK với các đề thi chuẩn quốc tế
            </p>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 text-white">
                <div className="text-3xl font-bold">{stats.totalExams}</div>
                <div className="text-sm text-white/80">Đề thi</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 text-white">
                <div className="text-3xl font-bold">{stats.completed}</div>
                <div className="text-sm text-white/80">Đã làm</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 text-white">
                <div className="text-3xl font-bold">
                  {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '--'}
                </div>
                <div className="text-sm text-white/80">Điểm TB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
            <p className="flex items-center gap-2">
              <span>⚠️</span>
              {error}. Đang hiển thị dữ liệu mặc định.
            </p>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn loại đề thi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryFilters.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                      : 'bg-white hover:bg-gray-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {category.description}
                        {category.examCount > 0 && ` • ${category.examCount} đề`}
                      </p>
                    </div>
                    <div className={`text-right ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      <div className="text-sm font-medium">{category.progress}% hoàn thành</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className={`mt-4 h-2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSelected ? 'bg-white' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${category.progress}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exam Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đề thi HSK</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExamTypes.map((exam, index) => {
                const badge = getLevelBadge(exam.level);
                return (
                  <div
                    key={exam.id}
                    className={`group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${exam.borderColor} animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Level Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                        HSK {exam.level}
                      </span>
                      {exam.examCount > 0 && (
                        <span className="text-xs text-gray-400">{exam.examCount} đề thi</span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">{exam.description}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <QuestionIcon />
                        <span>{exam.totalQuestions} câu</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon />
                        <span>{exam.durationMinutes} phút</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckIcon />
                        <span>{exam.passingScore} điểm đạt</span>
                      </div>
                    </div>

                    {/* Start Button */}
                    <Link
                      href={`/exams/list/${exam.level}`}
                      className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${exam.gradient} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                    >
                      <PlayIcon />
                      {exam.examCount > 0 ? 'Xem danh sách' : 'Sắp ra mắt'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            💡 Mẹo luyện thi HSK hiệu quả
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Những bí quyết giúp bạn đạt điểm cao trong kỳ thi HSK
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
