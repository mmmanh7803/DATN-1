"use client";

import { useState, useEffect } from "react";
import { adminService, AdminLessonDto, AdminCourseDto, CreateLessonDto } from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

interface LessonEditorProps {
  lessonId?: number;
  defaultCourseId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function LessonEditor({ lessonId, defaultCourseId, isOpen, onClose, onSave }: LessonEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [formData, setFormData] = useState<CreateLessonDto>({
    courseId: defaultCourseId || 0,
    title: "",
    description: "",
    lessonIndex: 1,
    content: "",
    isLocked: false,
    prerequisiteLessonId: undefined,
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadCourses();
      if (lessonId) {
        loadLesson();
      } else {
        // Reset form for new lesson
        setFormData({
          courseId: defaultCourseId || 0,
          title: "",
          description: "",
          lessonIndex: 1,
          content: "",
          isLocked: false,
          prerequisiteLessonId: undefined,
          isActive: true,
        });
      }
    }
  }, [isOpen, lessonId, defaultCourseId]);

  const loadCourses = async () => {
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadLesson = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      const lesson = await adminService.getLessonById(lessonId);
      setFormData({
        courseId: lesson.courseId || 0,
        title: lesson.title || "",
        description: lesson.description || "",
        lessonIndex: lesson.lessonIndex || 1,
        content: lesson.content || "",
        isLocked: lesson.isLocked ?? false,
        prerequisiteLessonId: lesson.prerequisiteLessonId,
        isActive: lesson.isActive ?? true,
      });
    } catch (error: any) {
      console.error("Error loading lesson:", error);
      toast.error("Không thể tải thông tin bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.warning("Vui lòng điền tên bài học");
      return;
    }

    if (!formData.courseId) {
      toast.warning("Vui lòng chọn khóa học");
      return;
    }

    try {
      setSaving(true);
      if (lessonId) {
        await adminService.updateLesson(lessonId, formData);
      } else {
        await adminService.createLesson(formData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      toast.error("Lỗi khi lưu bài học: " + (error.message || "Unknown error"));
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
            {lessonId ? "Sửa bài học" : "Thêm bài học mới"}
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
                  Khóa học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.courseId || ""}
                  onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} {course.hskLevel ? `(HSK ${course.hskLevel})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Bài 1 - Giới thiệu bản thân"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn gọn về bài học"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài học
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nội dung chi tiết của bài học (có thể sử dụng markdown)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số thứ tự bài học
                  </label>
                  <input
                    type="number"
                    value={formData.lessonIndex}
                    onChange={(e) => setFormData({ ...formData, lessonIndex: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài học điều kiện tiên quyết
                  </label>
                  <input
                    type="number"
                    value={formData.prerequisiteLessonId || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      prerequisiteLessonId: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="ID bài học tiên quyết"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
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

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Khóa bài học</span>
                </label>
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

