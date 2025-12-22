"use client";

import { useState, useEffect } from "react";
import { adminService, AdminLessonDto, AdminCourseDto, CreateLessonDto } from "@/lib/services/adminService";
import MessageModal from "@/components/common/MessageModal";

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
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
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
      // Hiển thị thông báo vì bảng Lessons đã bị xóa
      setShowInfoModal(true);
    }
  }, [isOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Chức năng này không còn khả dụng
    setShowInfoModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Info Modal */}
      <MessageModal
        isOpen={showInfoModal}
        title="Chức năng không khả dụng"
        message="Bảng Lessons đã bị xóa trong hệ thống. Hệ thống hiện sử dụng LessonTopics thay vì Lessons. Vui lòng sử dụng chức năng quản lý LessonTopics thay thế."
        type="info"
        onClose={() => {
          setShowInfoModal(false);
          onClose();
        }}
      />

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
          {/* Thông báo không khả dụng */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Chức năng này không còn khả dụng
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Bảng Lessons đã bị xóa. Hệ thống hiện sử dụng LessonTopics thay vì Lessons.
                </p>
              </div>
            </div>
          </div>

          <div className="opacity-50 pointer-events-none space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khóa học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.courseId || ""}
                  onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) || 0 })}
                  required
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}

