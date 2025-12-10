'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import apiClient from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { useToast } from '@/contexts/ToastContext';

interface ExamPaper {
  id: number;
  title: string;
  examType: string;
  level: number | null;
  description: string | null;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  questionCount?: number;
}

interface CreateExamDto {
  title: string;
  examType: string;
  level: number | null;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
}

export default function AdminExamsPage() {
  const toast = useToast();
  const router = useRouter();
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newExam, setNewExam] = useState<CreateExamDto>({
    title: '',
    examType: 'HSK',
    level: 1,
    description: '',
    durationMinutes: 40,
    totalQuestions: 40,
    totalPoints: 100,
    passingScore: 60,
  });

  useEffect(() => {
    loadExams();
  }, [filterType, filterLevel]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('examType', filterType);
      if (filterLevel) params.append('level', filterLevel.toString());
      
      const response = await apiClient.get(`/api/exampapers${params.toString() ? `?${params.toString()}` : ''}`);
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đề thi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    if (!newExam.title.trim()) {
      toast.warning('Vui lòng nhập tiêu đề đề thi');
      return;
    }

    setCreating(true);
    try {
      const response = await apiClient.post('/api/exampapers', newExam);
      if (response.data.success) {
        toast.success('Tạo đề thi thành công!');
        setShowCreateModal(false);
        setNewExam({
          title: '',
          examType: 'HSK',
          level: 1,
          description: '',
          durationMinutes: 40,
          totalQuestions: 40,
          totalPoints: 100,
          passingScore: 60,
        });
        loadExams();
      }
    } catch (error) {
      console.error('Lỗi khi tạo đề thi:', error);
      toast.error('Không thể tạo đề thi');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;

    try {
      await apiClient.delete(`/api/exampapers/${id}`);
      toast.success('Đã xóa đề thi');
      loadExams();
    } catch (error) {
      console.error('Lỗi khi xóa đề thi:', error);
      toast.error('Không thể xóa đề thi');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Đề thi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tạo và quản lý đề thi HSK, THPT
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Tạo đề thi mới
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại đề</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả</option>
              <option value="HSK">HSK</option>
              <option value="THPT">THPT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ HSK</label>
            <select
              value={filterLevel || ''}
              onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              <option value="1">HSK 1</option>
              <option value="2">HSK 2</option>
              <option value="3">HSK 3</option>
              <option value="4">HSK 4</option>
              <option value="5">HSK 5</option>
              <option value="6">HSK 6</option>
            </select>
          </div>
        </div>

        {/* Exam List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-4">📝</span>
              <p>Chưa có đề thi nào</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Tạo đề thi đầu tiên
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cấp độ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Câu hỏi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{exam.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{exam.title}</div>
                      {exam.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{exam.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exam.examType === 'HSK' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {exam.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {exam.level ? `Level ${exam.level}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${
                        (exam.questionCount || 0) < exam.totalQuestions 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                      }`}>
                        {exam.questionCount || 0}/{exam.totalQuestions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {exam.durationMinutes} phút
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exam.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {exam.isActive ? 'Hoạt động' : 'Tắt'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/exams/${exam.id}`)}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold mb-4">Tạo đề thi mới</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề đề thi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    placeholder="VD: Đề thi HSK 1 - Đề số 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại đề thi</label>
                    <select
                      value={newExam.examType}
                      onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="HSK">HSK</option>
                      <option value="THPT">THPT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                    <select
                      value={newExam.level || ''}
                      onChange={(e) => setNewExam({ ...newExam, level: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Không chọn</option>
                      <option value="1">HSK 1</option>
                      <option value="2">HSK 2</option>
                      <option value="3">HSK 3</option>
                      <option value="4">HSK 4</option>
                      <option value="5">HSK 5</option>
                      <option value="6">HSK 6</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    placeholder="Mô tả ngắn về đề thi..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                    <input
                      type="number"
                      value={newExam.durationMinutes}
                      onChange={(e) => setNewExam({ ...newExam, durationMinutes: parseInt(e.target.value) || 40 })}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số câu hỏi</label>
                    <input
                      type="number"
                      value={newExam.totalQuestions}
                      onChange={(e) => setNewExam({ ...newExam, totalQuestions: parseInt(e.target.value) || 40 })}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng điểm</label>
                    <input
                      type="number"
                      value={newExam.totalPoints}
                      onChange={(e) => setNewExam({ ...newExam, totalPoints: parseInt(e.target.value) || 100 })}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đạt</label>
                    <input
                      type="number"
                      value={newExam.passingScore}
                      onChange={(e) => setNewExam({ ...newExam, passingScore: parseInt(e.target.value) || 60 })}
                      min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateExam}
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo đề thi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

