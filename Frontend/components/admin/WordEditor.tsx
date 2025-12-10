"use client";

import { useState, useEffect } from "react";
import { adminService, AdminWordDto, CreateWordDto, UpdateWordDto } from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

interface WordEditorProps {
  wordId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function WordEditor({ wordId, isOpen, onClose, onSave }: WordEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState<CreateWordDto>({
    character: "",
    pinyin: "",
    meaning: "",
    hskLevel: undefined,
    lessonId: undefined,
    audioUrl: "",
    exampleSentence: "",
  });

  useEffect(() => {
    if (isOpen && wordId) {
      loadWord();
    } else if (isOpen && !wordId) {
      // Reset form for new word
      setFormData({
        character: "",
        pinyin: "",
        meaning: "",
        hskLevel: undefined,
        lessonId: undefined,
        audioUrl: "",
        exampleSentence: "",
      });
    }
  }, [isOpen, wordId]);

  const loadWord = async () => {
    if (!wordId) return;

    try {
      setLoading(true);
      const word = await adminService.getWordById(wordId);
      setFormData({
        character: word.character || "",
        pinyin: word.pinyin || "",
        meaning: word.meaning || "",
        hskLevel: word.hskLevel,
        lessonId: word.lessonId,
        audioUrl: word.audioUrl || "",
        exampleSentence: word.exampleSentence || "",
      });
    } catch (error: any) {
      console.error("Error loading word:", error);
      toast.error("Không thể tải thông tin từ vựng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.character || !formData.pinyin || !formData.meaning) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      if (wordId) {
        await adminService.updateWord(wordId, formData);
      } else {
        await adminService.createWord(formData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving word:", error);
      toast.error("Lỗi khi lưu từ vựng: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {wordId ? "Sửa từ vựng" : "Thêm từ vựng mới"}
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
                    Chữ Hán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.character}
                    onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pinyin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pinyin}
                    onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nghĩa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ HSK
                  </label>
                  <select
                    value={formData.hskLevel || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hskLevel: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="1">HSK 1</option>
                    <option value="2">HSK 2</option>
                    <option value="3">HSK 3</option>
                    <option value="4">HSK 4</option>
                    <option value="5">HSK 5</option>
                    <option value="6">HSK 6</option>
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
                  Câu ví dụ
                </label>
                <textarea
                  value={formData.exampleSentence}
                  onChange={(e) => setFormData({ ...formData, exampleSentence: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

