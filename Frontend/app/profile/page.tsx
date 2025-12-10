'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { userService, UserProfile, LearnedWord } from '@/lib/services/userService';
import { examService, ExamHistoryItem } from '@/lib/services/examService';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
  const [selectedHskLevel, setSelectedHskLevel] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'vocabulary' | 'exams'>('overview');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await userService.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Lỗi khi tải profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLearnedWords = async () => {
    if (!profile) return;
    try {
      const data = await userService.getLearnedWords(
        selectedHskLevel,
        selectedStatus,
        currentPage,
        20
      );
      setLearnedWords(data.words);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải từ vựng:', error);
    }
  };

  const loadExamHistory = async () => {
    if (!profile) return;
    try {
      const data = await examService.getExamHistory(undefined, 50);
      setExamHistory(data);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử thi:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      loadLearnedWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, selectedHskLevel, selectedStatus, currentPage]);

  useEffect(() => {
    if (profile) {
      loadExamHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-lg text-gray-600">Không thể tải thông tin profile</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Đăng nhập
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      New: { label: 'Mới', className: 'bg-gray-100 text-gray-700' },
      Learning: { label: 'Đang học', className: 'bg-blue-100 text-blue-700' },
      Reviewing: { label: 'Ôn tập', className: 'bg-yellow-100 text-yellow-700' },
      Mastered: { label: 'Thành thạo', className: 'bg-green-100 text-green-700' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-md ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.user.email}</h1>
                <div className="flex gap-2 mt-1">
                  {profile.user.roles.map((role) => (
                    <span key={role} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md border">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab('vocabulary')}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'vocabulary'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Từ vựng
                </button>
                <button
                  onClick={() => setActiveTab('exams')}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'exams'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lịch sử thi
                </button>
              </nav>
            </div>

            {/* Tab Tổng quan */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Thống kê từ vựng */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">📚</span>
                      <h3 className="text-sm font-medium text-gray-600">Từ vựng</h3>
                    </div>
                    <div className="text-2xl font-bold mb-4">{profile.statistics.vocabulary.total}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thành thạo:</span>
                        <span className="font-medium text-green-600">{profile.statistics.vocabulary.mastered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đang học:</span>
                        <span className="font-medium text-blue-600">{profile.statistics.vocabulary.learning}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mới:</span>
                        <span className="font-medium text-gray-600">{profile.statistics.vocabulary.new}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thống kê thi */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🏆</span>
                      <h3 className="text-sm font-medium text-gray-600">Kết quả thi</h3>
                    </div>
                    <div className="text-2xl font-bold mb-4">{profile.statistics.exams.total} bài</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đạt:</span>
                        <span className="font-medium text-green-600">{profile.statistics.exams.passed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chưa đạt:</span>
                        <span className="font-medium text-red-600">{profile.statistics.exams.failed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Điểm TB:</span>
                        <span className="font-medium">{profile.statistics.exams.averageScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tiến độ học */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">📈</span>
                      <h3 className="text-sm font-medium text-gray-600">Tiến độ</h3>
                    </div>
                    <div className="text-2xl font-bold mb-4">{profile.statistics.topics.completed} chủ đề</div>
                    <div className="text-sm text-gray-600">
                      Số chủ đề đã hoàn thành
                    </div>
                  </div>
                </div>

                {/* Bài thi gần nhất */}
                {profile.statistics.recentExam && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">⭐</span>
                      <h3 className="text-lg font-semibold">Bài thi gần nhất</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{profile.statistics.recentExam.examTitle}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(profile.statistics.recentExam.completedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                          {profile.statistics.recentExam.score}
                        </div>
                        <div className="text-sm text-gray-600">điểm</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Từ vựng */}
            {activeTab === 'vocabulary' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Từ vựng đã học ({profile.statistics.vocabulary.total})</h3>
                    <div className="flex gap-2">
                      <select
                        value={selectedHskLevel?.toString() || 'all'}
                        onChange={(e) => {
                          setSelectedHskLevel(e.target.value === 'all' ? undefined : parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">Tất cả</option>
                        <option value="1">HSK 1</option>
                        <option value="2">HSK 2</option>
                        <option value="3">HSK 3</option>
                        <option value="4">HSK 4</option>
                        <option value="5">HSK 5</option>
                        <option value="6">HSK 6</option>
                      </select>
                      <select
                        value={selectedStatus?.toString() || 'all'}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value === 'all' ? undefined : parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">Tất cả</option>
                        <option value="0">Mới</option>
                        <option value="1">Đang học</option>
                        <option value="2">Ôn tập</option>
                        <option value="3">Thành thạo</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {learnedWords.map((word) => (
                      <div
                        key={word.wordId}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl font-bold">{word.character}</span>
                            <span className="text-sm text-gray-600">{word.pinyin}</span>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md border">
                              HSK {word.hskLevel}
                            </span>
                            {getStatusBadge(word.status)}
                          </div>
                          <p className="text-sm text-gray-600">{word.meaning}</p>
                        </div>
                        <div className="text-right text-sm space-y-1">
                          <div className="text-gray-600">
                            Ôn tập: {word.reviewCount} lần
                          </div>
                          <div className="text-green-600">
                            Đúng: {word.correctCount} / Sai: {word.wrongCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <span className="flex items-center px-4 text-sm">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Lịch sử thi */}
            {activeTab === 'exams' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-6">Lịch sử thi ({examHistory.length})</h3>
                  
                  <div className="space-y-3">
                    {examHistory.map((exam) => (
                      <div
                        key={exam.progressId}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/exams/${exam.examId}/result?progressId=${exam.progressId}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{exam.examTitle}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md border">
                              HSK {exam.level}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              exam.isPassed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {exam.isPassed ? 'Đạt' : 'Chưa đạt'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span>📅</span>
                              {new Date(exam.completedAt).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>⏱️</span>
                              {Math.floor((exam.timeSpentSeconds || 0) / 60)} phút
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-indigo-600">{exam.score}</div>
                          <div className="text-sm text-gray-600">
                            {exam.correctAnswers}/{exam.totalQuestions}
                          </div>
                        </div>
                      </div>
                    ))}

                    {examHistory.length === 0 && (
                      <div className="text-center py-12 text-gray-600">
                        <span className="text-5xl mb-4 block">🏆</span>
                        <p className="mb-4">Chưa có lịch sử thi</p>
                        <button
                          onClick={() => router.push('/exams')}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          Bắt đầu thi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
