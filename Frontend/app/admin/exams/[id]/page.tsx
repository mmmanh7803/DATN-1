'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import apiClient from '@/lib/api';

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
  questions: ExamQuestion[];
}

interface ExamQuestion {
  id: number;
  questionOrder: number;
  questionText: string;
  questionType: string;
  skillType?: string;
  partNumber?: number;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
  options: QuestionOption[];
}

interface QuestionOption {
  id: number;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

interface AvailableQuestion {
  id: number;
  questionText: string;
  questionType: string;
  skillType?: string;
  partNumber?: number;
  points: number;
  difficultyLevel?: number;
  audioUrl?: string;
  imageUrl?: string;
  optionsCount?: number;
  correctOption?: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export default function AdminExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.id as string);

  const [exam, setExam] = useState<ExamPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterSkillType, setFilterSkillType] = useState<string>('all');
  const [filterPartNumber, setFilterPartNumber] = useState<number | null>(null);
  const [filterQuestionType, setFilterQuestionType] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 50, totalCount: 0, totalPages: 0 });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    durationMinutes: 40,
    totalQuestions: 40,
    totalPoints: 100,
    passingScore: 60,
    isActive: true,
  });

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/exampapers/${examId}`);
      const examData = response.data.data;
      setExam(examData);
      setEditForm({
        title: examData.title,
        description: examData.description || '',
        durationMinutes: examData.durationMinutes,
        totalQuestions: examData.totalQuestions,
        totalPoints: examData.totalPoints,
        passingScore: examData.passingScore,
        isActive: examData.isActive,
      });
    } catch (error) {
      console.error('Lỗi khi tải đề thi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuestions = async (page: number = 1) => {
    setLoadingQuestions(true);
    try {
      // Sử dụng API available-questions
      const params = new URLSearchParams();
      if (filterSkillType !== 'all') params.append('skillType', filterSkillType);
      if (filterPartNumber) params.append('partNumber', filterPartNumber.toString());
      if (filterQuestionType !== 'all') params.append('questionType', filterQuestionType);
      params.append('page', page.toString());
      params.append('pageSize', '50');
      
      const response = await apiClient.get(`/api/exampapers/${examId}/available-questions?${params.toString()}`);
      const data = response.data.data;
      
      setAvailableQuestions(data.questions || []);
      setPagination(data.pagination || { page: 1, pageSize: 50, totalCount: 0, totalPages: 0 });
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      setAvailableQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (showAddModal && exam) {
      loadAvailableQuestions(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal, filterSkillType, filterPartNumber, filterQuestionType]);

  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      alert('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }

    setAdding(true);
    try {
      // Sử dụng API bulk để thêm nhiều câu hỏi cùng lúc
      const response = await apiClient.post(`/api/exampapers/${examId}/questions/bulk`, {
        questionIds: selectedQuestions
      });
      
      const addedCount = response.data.addedCount || selectedQuestions.length;
      alert(`Đã thêm ${addedCount} câu hỏi vào đề thi`);
      setShowAddModal(false);
      setSelectedQuestions([]);
      loadExam();
    } catch (error) {
      console.error('Lỗi khi thêm câu hỏi:', error);
      alert('Không thể thêm câu hỏi');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveQuestion = async (questionId: number) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;

    try {
      await apiClient.delete(`/api/exampapers/${examId}/questions/${questionId}`);
      loadExam();
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      alert('Không thể xóa câu hỏi');
    }
  };

  const handleUpdateExam = async () => {
    try {
      await apiClient.put(`/api/exampapers/${examId}`, editForm);
      alert('Cập nhật đề thi thành công');
      setShowEditModal(false);
      loadExam();
    } catch (error) {
      console.error('Lỗi khi cập nhật đề thi:', error);
      alert('Không thể cập nhật đề thi');
    }
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'TRUE_FALSE': 'Đúng/Sai',
      'SELECT_IMAGE': 'Chọn hình',
      'MULTIPLE_CHOICE': 'Trắc nghiệm',
      'FILL_BLANK': 'Điền khuyết',
      'CHOOSE_MEANING': 'Chọn nghĩa',
    };
    return labels[type] || type;
  };

  const getSkillTypeLabel = (type?: string) => {
    if (!type) return '-';
    return type === 'LISTENING' ? '🎧 Nghe' : '📖 Đọc';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!exam) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy đề thi</p>
          <button
            onClick={() => router.push('/admin/exams')}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/exams')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
            >
              ← Quay lại danh sách
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                exam.examType === 'HSK' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {exam.examType} {exam.level && `Level ${exam.level}`}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                exam.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {exam.isActive ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500">Câu hỏi</div>
            <div className="text-2xl font-bold mt-1">
              <span className={exam.questions.length < exam.totalQuestions ? 'text-orange-600' : 'text-green-600'}>
                {exam.questions.length}
              </span>
              <span className="text-gray-400">/{exam.totalQuestions}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500">Thời gian</div>
            <div className="text-2xl font-bold mt-1">{exam.durationMinutes} <span className="text-sm font-normal text-gray-400">phút</span></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500">Tổng điểm</div>
            <div className="text-2xl font-bold mt-1">{exam.totalPoints}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500">Điểm đạt</div>
            <div className="text-2xl font-bold mt-1">{exam.passingScore}</div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Danh sách câu hỏi ({exam.questions.length})</h2>
          </div>
          
          {exam.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-4">📝</span>
              <p>Chưa có câu hỏi nào trong đề thi</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Thêm câu hỏi
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {exam.questions
                .sort((a, b) => a.questionOrder - b.questionOrder)
                .map((question, index) => (
                <div key={question.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {getQuestionTypeLabel(question.questionType)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getSkillTypeLabel(question.skillType)}
                        </span>
                        {question.partNumber && (
                          <span className="text-xs text-gray-500">Part {question.partNumber}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {question.points} điểm
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{question.questionText}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {question.options.map(opt => (
                            <span 
                              key={opt.id} 
                              className={`text-xs px-2 py-1 rounded ${
                                opt.isCorrect 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {opt.optionLabel}: {opt.optionText || '(hình ảnh)'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                      title="Xóa khỏi đề thi"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Questions Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-bold mb-4">Thêm câu hỏi vào đề thi</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
                  <select
                    value={filterSkillType}
                    onChange={(e) => setFilterSkillType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="LISTENING">🎧 Nghe</option>
                    <option value="READING">📖 Đọc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
                  <select
                    value={filterPartNumber || ''}
                    onChange={(e) => setFilterPartNumber(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="1">Part 1</option>
                    <option value="2">Part 2</option>
                    <option value="3">Part 3</option>
                    <option value="4">Part 4</option>
                    <option value="5">Part 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                  <select
                    value={filterQuestionType}
                    onChange={(e) => setFilterQuestionType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="TRUE_FALSE">Đúng/Sai</option>
                    <option value="SELECT_IMAGE">Chọn hình</option>
                    <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                    <option value="FILL_BLANK">Điền khuyết</option>
                    <option value="CHOOSE_MEANING">Chọn nghĩa</option>
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-sm text-gray-500">
                    Tìm thấy: <strong>{pagination.totalCount}</strong> câu hỏi
                  </span>
                  <span className="text-sm text-indigo-600 font-medium">
                    Đã chọn: <strong>{selectedQuestions.length}</strong>
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : availableQuestions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Không có câu hỏi nào khả dụng</p>
                    <p className="text-sm mt-2">Thử thay đổi bộ lọc hoặc kiểm tra ngân hàng câu hỏi</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {availableQuestions.map((question) => (
                      <div
                        key={question.id}
                        onClick={() => toggleQuestionSelection(question.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedQuestions.includes(question.id) ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-400">#{question.id}</span>
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                {getQuestionTypeLabel(question.questionType)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getSkillTypeLabel(question.skillType)}
                              </span>
                              {question.partNumber && (
                                <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                                  Part {question.partNumber}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">{question.points} điểm</span>
                              {question.correctOption && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                  Đáp án: {question.correctOption}
                                </span>
                              )}
                              {question.audioUrl && (
                                <span className="text-xs" title="Có file âm thanh">🎵</span>
                              )}
                              {question.imageUrl && (
                                <span className="text-xs" title="Có hình ảnh">🖼️</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {question.questionText || <span className="text-gray-400 italic">(Không có nội dung câu hỏi)</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadAvailableQuestions(pagination.page - 1)}
                      disabled={pagination.page <= 1 || loadingQuestions}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>
                    <button
                      onClick={() => loadAvailableQuestions(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages || loadingQuestions}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allIds = availableQuestions.map(q => q.id);
                      const newSelected = [...selectedQuestions];
                      allIds.forEach(id => {
                        if (!newSelected.includes(id)) newSelected.push(id);
                      });
                      setSelectedQuestions(newSelected);
                    }}
                    className="px-3 py-2 text-sm text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Chọn tất cả trang này
                  </button>
                  {selectedQuestions.length > 0 && (
                    <button
                      onClick={() => setSelectedQuestions([])}
                      className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Bỏ chọn ({selectedQuestions.length})
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedQuestions([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddQuestions}
                    disabled={adding || selectedQuestions.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {adding ? 'Đang thêm...' : `Thêm ${selectedQuestions.length} câu hỏi`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Chỉnh sửa đề thi</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                    <input
                      type="number"
                      value={editForm.durationMinutes}
                      onChange={(e) => setEditForm({ ...editForm, durationMinutes: parseInt(e.target.value) || 40 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số câu hỏi</label>
                    <input
                      type="number"
                      value={editForm.totalQuestions}
                      onChange={(e) => setEditForm({ ...editForm, totalQuestions: parseInt(e.target.value) || 40 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng điểm</label>
                    <input
                      type="number"
                      value={editForm.totalPoints}
                      onChange={(e) => setEditForm({ ...editForm, totalPoints: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đạt</label>
                    <input
                      type="number"
                      value={editForm.passingScore}
                      onChange={(e) => setEditForm({ ...editForm, passingScore: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Kích hoạt đề thi</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateExam}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

