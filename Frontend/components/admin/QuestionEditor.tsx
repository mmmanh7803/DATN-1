"use client";

import { useState, useEffect } from "react";
import { adminService, AdminQuestionDto, CreateQuestionDto, CreateQuestionOptionDto, AdminLessonDto } from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

interface QuestionEditorProps {
  questionId?: number;
  defaultLessonId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface OptionForm {
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
}

export default function QuestionEditor({ questionId, defaultLessonId, isOpen, onClose, onSave }: QuestionEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [lessons, setLessons] = useState<AdminLessonDto[]>([]);
  const [formData, setFormData] = useState<CreateQuestionDto>({
    lessonId: defaultLessonId,
    questionText: "",
    questionType: "CHOOSE_MEANING",
    audioUrl: "",
    points: 1,
    difficultyLevel: 1,
    explanation: "",
    options: [],
  });
  const [options, setOptions] = useState<OptionForm[]>([
    { optionText: "", isCorrect: true, explanation: "" },
    { optionText: "", isCorrect: false, explanation: "" },
    { optionText: "", isCorrect: false, explanation: "" },
    { optionText: "", isCorrect: false, explanation: "" },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadLessons();
      if (questionId) {
        loadQuestion();
      } else {
        // Reset form for new question
        setFormData({
          lessonId: defaultLessonId,
          questionText: "",
          questionType: "CHOOSE_MEANING",
          audioUrl: "",
          points: 1,
          difficultyLevel: 1,
          explanation: "",
          options: [],
        });
        setOptions([
          { optionText: "", isCorrect: true, explanation: "" },
          { optionText: "", isCorrect: false, explanation: "" },
          { optionText: "", isCorrect: false, explanation: "" },
          { optionText: "", isCorrect: false, explanation: "" },
        ]);
      }
    }
  }, [isOpen, questionId, defaultLessonId]);

  const loadLessons = async () => {
    try {
      const data = await adminService.getLessons();
      setLessons(data);
    } catch (error) {
      console.error("Error loading lessons:", error);
    }
  };

  const loadQuestion = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      const question = await adminService.getQuestionById(questionId);
      setFormData({
        lessonId: question.lessonId,
        exerciseId: question.exerciseId,
        questionText: question.questionText || "",
        questionType: question.questionType || "CHOOSE_MEANING",
        audioUrl: question.audioUrl || "",
        points: question.points || 1,
        difficultyLevel: question.difficultyLevel || 1,
        explanation: question.explanation || "",
        options: [],
      });

      // Load options from question
      if (question.options && question.options.length > 0) {
        setOptions(question.options.map(opt => ({
          optionText: opt.optionText || "",
          isCorrect: opt.isCorrect || false,
          explanation: opt.explanation || "",
        })));
      }
    } catch (error: any) {
      console.error("Error loading question:", error);
      toast.error("Không thể tải thông tin câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, field: keyof OptionForm, value: string | boolean) => {
    const newOptions = [...options];
    if (field === "isCorrect" && value === true) {
      // Nếu chọn đáp án đúng, bỏ chọn các đáp án khác
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { optionText: "", isCorrect: false, explanation: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.warning("Câu hỏi phải có ít nhất 2 lựa chọn");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.questionText) {
      toast.warning("Vui lòng điền nội dung câu hỏi");
      return;
    }

    const validOptions = options.filter(opt => opt.optionText.trim());
    if (validOptions.length < 2) {
      toast.warning("Câu hỏi phải có ít nhất 2 lựa chọn");
      return;
    }

    if (!validOptions.some(opt => opt.isCorrect)) {
      toast.warning("Vui lòng chọn đáp án đúng");
      return;
    }

    try {
      setSaving(true);
      const submitData: CreateQuestionDto = {
        ...formData,
        options: validOptions,
      };

      if (questionId) {
        await adminService.updateQuestion(questionId, submitData);
      } else {
        await adminService.createQuestion(submitData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving question:", error);
      toast.error("Lỗi khi lưu câu hỏi: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const questionTypes = [
    { value: "CHOOSE_MEANING", label: "Chọn nghĩa đúng" },
    { value: "CHOOSE_PINYIN", label: "Chọn pinyin đúng" },
    { value: "CHOOSE_CHARACTER", label: "Chọn chữ Hán đúng" },
    { value: "LISTEN", label: "Nghe và chọn" },
    { value: "READING", label: "Đọc hiểu" },
    { value: "TRUE_FALSE", label: "Đúng/Sai" },
    { value: "IMAGE_QUIZ", label: "Câu hỏi hình ảnh" },
    { value: "FILL_BLANK", label: "Điền vào chỗ trống" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {questionId ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài học
                  </label>
                  <select
                    value={formData.lessonId || ""}
                    onChange={(e) => setFormData({ ...formData, lessonId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Không thuộc bài học</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Chọn nghĩa đúng của từ 你好?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ khó
                  </label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Dễ</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio URL
                  </label>
                  <input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giải thích đáp án
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Giải thích tại sao đáp án này đúng..."
                />
              </div>

              {/* Options Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Các lựa chọn</h3>
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    + Thêm lựa chọn
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center pt-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(index, "isCorrect", true)}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(index, "optionText", e.target.value)}
                          placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            option.isCorrect 
                              ? "border-green-300 bg-green-50 focus:ring-green-500" 
                              : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Xóa lựa chọn"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  * Chọn nút radio bên trái để đánh dấu đáp án đúng
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

