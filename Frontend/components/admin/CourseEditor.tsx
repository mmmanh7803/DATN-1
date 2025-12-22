"use client";

import { useState, useEffect } from "react";
import { adminService, AdminCourseDto, CreateCourseDto, UpdateCourseDto } from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

interface CourseEditorProps {
  courseId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function CourseEditor({ courseId, isOpen, onClose, onSave }: CourseEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState<CreateCourseDto>({
    categoryId: 1,
    title: "",
    description: "",
    imageUrl: "",
    level: "",
    hskLevel: undefined,
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (isOpen && courseId) {
      loadCourse();
    } else if (isOpen && !courseId) {
      // Reset form for new course
      setFormData({
        categoryId: 1,
        title: "",
        description: "",
        imageUrl: "",
        level: "",
        hskLevel: undefined,
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [isOpen, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const course = await adminService.getCourseById(courseId);
      setFormData({
        categoryId: course.categoryId || 1,
        title: course.title || "",
        description: course.description || "",
        imageUrl: course.imageUrl || "",
        level: course.level || "",
        hskLevel: course.hskLevel,
        sortOrder: course.sortOrder || 0,
        isActive: course.isActive ?? true,
      });
    } catch (error: any) {
      console.error("Error loading course:", error);
      toast.error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.warning("Vui lòng điền tên khóa học");
      return;
    }

    try {
      setSaving(true);
      if (courseId) {
        await adminService.updateCourse(courseId, formData);
      } else {
        await adminService.createCourse(formData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast.error(error.message || "Lỗi khi lưu khóa học.");
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
            {courseId ? "Sửa khóa học" : "Thêm khóa học mới"}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: HSK 1 - Từ vựng cơ bản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn gọn về khóa học"
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
                    Mức độ
                  </label>
                  <select
                    value={formData.level || ""}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn mức độ</option>
                    <option value="beginner">Sơ cấp</option>
                    <option value="elementary">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="upper-intermediate">Trung cấp cao</option>
                    <option value="advanced">Cao cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Kích hoạt</span>
                  </label>
                </div>
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

