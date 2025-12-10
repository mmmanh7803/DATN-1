'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import apiClient from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  skillType?: string;
  partNumber?: number;
  exerciseId?: number;
  points: number;
  difficultyLevel: number;
  audioUrl?: string;
  imageUrl?: string;
  createdAt: string;
  options: QuestionOption[];
  exercise?: {
    id: number;
    exerciseType: string;
    title: string;
    topicId: number;
  };
}

interface QuestionOption {
  id: number;
  optionLabel: string;
  optionText: string;
  imageUrl?: string;
  isCorrect: boolean;
}

type QuestionCategory = 'exam' | 'activity';

const QUESTION_TYPES = [
  { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
  { value: 'SELECT_IMAGE', label: 'Chọn hình ảnh' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
  { value: 'FILL_BLANK', label: 'Điền khuyết' },
  { value: 'CHOOSE_MEANING', label: 'Chọn nghĩa' },
];

const SKILL_TYPES = [
  { value: 'LISTENING', label: '🎧 Nghe' },
  { value: 'READING', label: '📖 Đọc' },
];

const EXERCISE_TYPES = [
  { value: 'VOCABULARY', label: '📚 Từ vựng' },
  { value: 'QUICK_MEMORIZE', label: '⚡ Nhớ nhanh' },
  { value: 'TRUE_FALSE', label: '✓✗ Đúng/Sai' },
  { value: 'TRUE_FALSE_SENTENCE', label: '📝 Đúng/Sai câu' },
  { value: 'LISTEN_CHOOSE_IMAGE', label: '🎧🖼️ Nghe chọn hình' },
  { value: 'MATCH_SENTENCE', label: '🔗 Ghép câu' },
  { value: 'FILL_BLANK', label: '✏️ Điền từ' },
  { value: 'FLASHCARD', label: '🃏 Flashcard' },
  { value: 'DIALOGUE', label: '💬 Hội thoại' },
  { value: 'READING', label: '📖 Đọc hiểu' },
  { value: 'GRAMMAR', label: '📐 Ngữ pháp' },
  { value: 'ARRANGE_SENTENCE', label: '🔢 Sắp xếp câu' },
  { value: 'TRANSLATION', label: '🌐 Dịch' },
  { value: 'COMPREHENSIVE_TEST', label: '📋 Kiểm tra tổng hợp' },
];

export default function AdminQuestionsPage() {
  const toast = useToast();
  const [category, setCategory] = useState<QuestionCategory>('exam');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Filters - Đề thi
  const [filterSkillType, setFilterSkillType] = useState<string>('all');
  const [filterPartNumber, setFilterPartNumber] = useState<string>('all');
  const [filterQuestionType, setFilterQuestionType] = useState<string>('all');
  // Filters - Hoạt động
  const [filterExerciseType, setFilterExerciseType] = useState<string>('all');

  // Create form state
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    skillType: 'LISTENING',
    partNumber: 1,
    instruction: '',
    audioUrl: '',
    imageUrl: '',
    blankSentence: '',
    points: 1,
    difficultyLevel: 1,
    explanation: '',
    options: [
      { optionLabel: 'A', optionText: '', imageUrl: '', isCorrect: true },
      { optionLabel: 'B', optionText: '', imageUrl: '', isCorrect: false },
      { optionLabel: 'C', optionText: '', imageUrl: '', isCorrect: false },
      { optionLabel: 'D', optionText: '', imageUrl: '', isCorrect: false },
    ],
  });

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, filterSkillType, filterPartNumber, filterQuestionType, filterExerciseType]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (category === 'exam') {
        // Câu hỏi đề thi: có skillType, không có exerciseId
        params.append('forExam', 'true');
        if (filterSkillType !== 'all') params.append('skillType', filterSkillType);
        if (filterPartNumber !== 'all') params.append('partNumber', filterPartNumber);
      } else {
        // Câu hỏi hoạt động: có exerciseId
        params.append('forExam', 'false');
        if (filterExerciseType !== 'all') params.append('exerciseType', filterExerciseType);
      }
      
      if (filterQuestionType !== 'all') params.append('questionType', filterQuestionType);

      const response = await apiClient.get(`/api/admin/questions?${params.toString()}`);
      setQuestions(response.data.data || response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!formData.questionText && !formData.audioUrl && !formData.imageUrl) {
      toast.warning('Vui lòng nhập nội dung câu hỏi hoặc thêm audio/hình ảnh');
      return;
    }

    // Validate có đáp án đúng
    const hasCorrectOption = formData.options.some(opt => opt.isCorrect);
    if (!hasCorrectOption) {
      toast.warning('Vui lòng chọn ít nhất một đáp án đúng');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...formData,
        // Nếu là câu hỏi đề thi
        skillType: category === 'exam' ? formData.skillType : null,
        partNumber: category === 'exam' ? formData.partNumber : null,
        // Filter options có nội dung
        options: formData.options.filter(opt => opt.optionText || opt.imageUrl),
      };

      await apiClient.post('/api/admin/questions', payload);
      toast.success('Tạo câu hỏi thành công!');
      setShowCreateModal(false);
      resetForm();
      loadQuestions();
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      toast.error('Không thể tạo câu hỏi');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

    try {
      await apiClient.delete(`/api/admin/questions/${id}`);
      toast.success('Đã xóa câu hỏi');
      loadQuestions();
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      toast.error('Không thể xóa câu hỏi');
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      skillType: 'LISTENING',
      partNumber: 1,
      instruction: '',
      audioUrl: '',
      imageUrl: '',
      blankSentence: '',
      points: 1,
      difficultyLevel: 1,
      explanation: '',
      options: [
        { optionLabel: 'A', optionText: '', imageUrl: '', isCorrect: true },
        { optionLabel: 'B', optionText: '', imageUrl: '', isCorrect: false },
        { optionLabel: 'C', optionText: '', imageUrl: '', isCorrect: false },
        { optionLabel: 'D', optionText: '', imageUrl: '', isCorrect: false },
      ],
    });
  };

  const updateOption = (index: number, field: string, value: string | boolean) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // Nếu đặt isCorrect = true, bỏ correct của các option khác (nếu là single choice)
    if (field === 'isCorrect' && value === true && formData.questionType !== 'MULTIPLE_CHOICE') {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }
    
    setFormData({ ...formData, options: newOptions });
  };

  const getQuestionTypeLabel = (type: string) => {
    return QUESTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getSkillTypeLabel = (type?: string) => {
    if (!type) return '-';
    return SKILL_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Câu hỏi</h1>
            <p className="text-gray-500 mt-1">Quản lý ngân hàng câu hỏi cho đề thi và hoạt động học tập</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <span>+</span>
            <span>Tạo câu hỏi mới</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setCategory('exam')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  category === 'exam'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Câu hỏi Đề thi
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  HSK
                </span>
              </button>
              <button
                onClick={() => setCategory('activity')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  category === 'activity'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Câu hỏi Hoạt động học
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              {category === 'exam' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kỹ năng</label>
                    <select
                      value={filterSkillType}
                      onChange={(e) => setFilterSkillType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Tất cả</option>
                      {SKILL_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Part</label>
                    <select
                      value={filterPartNumber}
                      onChange={(e) => setFilterPartNumber(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Tất cả</option>
                      {[1, 2, 3, 4, 5].map(p => (
                        <option key={p} value={p}>Part {p}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Loại hoạt động</label>
                  <select
                    value={filterExerciseType}
                    onChange={(e) => setFilterExerciseType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Tất cả hoạt động</option>
                    {EXERCISE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Loại câu hỏi</label>
                <select
                  value={filterQuestionType}
                  onChange={(e) => setFilterQuestionType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả</option>
                  {QUESTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-500">
                  Tổng: <strong className="text-indigo-600">{questions.length}</strong> câu hỏi
                </span>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-4">📭</span>
                <p className="text-gray-500">Chưa có câu hỏi nào</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-indigo-600 hover:underline"
                >
                  Tạo câu hỏi đầu tiên
                </button>
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-400">#{question.id}</span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          {getQuestionTypeLabel(question.questionType)}
                        </span>
                        {category === 'exam' ? (
                          <>
                            <span className="text-xs">{getSkillTypeLabel(question.skillType)}</span>
                            {question.partNumber && (
                              <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                                Part {question.partNumber}
                              </span>
                            )}
                          </>
                        ) : (
                          question.exercise && (
                            <span className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded">
                              {EXERCISE_TYPES.find(t => t.value === question.exercise?.exerciseType)?.label || question.exercise.exerciseType}
                            </span>
                          )
                        )}
                        <span className="text-xs text-gray-400">{question.points} điểm</span>
                        {question.audioUrl && <span title="Có audio">🎵</span>}
                        {question.imageUrl && <span title="Có hình">🖼️</span>}
                      </div>
                      <p className="text-gray-800 line-clamp-2">
                        {question.questionText || <span className="text-gray-400 italic">(Không có nội dung text)</span>}
                      </p>
                      {question.exercise && (
                        <p className="text-xs text-gray-400 mt-1">
                          📌 {question.exercise.title}
                        </p>
                      )}
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
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Question Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  Tạo câu hỏi {category === 'exam' ? 'Đề thi' : 'Hoạt động'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Category specific fields */}
                {category === 'exam' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-3">Thông tin đề thi</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kỹ năng <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.skillType}
                          onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {SKILL_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Part <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.partNumber}
                          onChange={(e) => setFormData({ ...formData, partNumber: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {[1, 2, 3, 4, 5].map(p => (
                            <option key={p} value={p}>Part {p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                    <select
                      value={formData.questionType}
                      onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {QUESTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Điểm</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
                      <select
                        value={formData.difficultyLevel}
                        onChange={(e) => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={1}>Dễ</option>
                        <option value={2}>Trung bình</option>
                        <option value={3}>Khó</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Instruction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn (instruction)</label>
                  <input
                    type="text"
                    value={formData.instruction}
                    onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                    placeholder="VD: Chọn đáp án đúng cho câu hỏi sau"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Question text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                  <textarea
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    rows={3}
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Media URLs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🎵 Audio URL</label>
                    <input
                      type="text"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🖼️ Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Fill blank sentence */}
                {formData.questionType === 'FILL_BLANK' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Câu điền khuyết (dùng ____ cho chỗ trống)
                    </label>
                    <input
                      type="text"
                      value={formData.blankSentence}
                      onChange={(e) => setFormData({ ...formData, blankSentence: e.target.value })}
                      placeholder="VD: 我____喝茶。"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Các đáp án <span className="text-gray-400">(tick chọn đáp án đúng)</span>
                  </label>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type={formData.questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                          name="correctOption"
                          checked={option.isCorrect}
                          onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                          className="w-5 h-5 text-green-600"
                        />
                        <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg font-bold text-gray-600">
                          {option.optionLabel}
                        </span>
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                          placeholder="Nội dung đáp án"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {formData.questionType === 'SELECT_IMAGE' && (
                          <input
                            type="text"
                            value={option.imageUrl}
                            onChange={(e) => updateOption(index, 'imageUrl', e.target.value)}
                            placeholder="Image URL"
                            className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích đáp án</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={2}
                    placeholder="Giải thích tại sao đáp án đúng..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateQuestion}
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo câu hỏi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
