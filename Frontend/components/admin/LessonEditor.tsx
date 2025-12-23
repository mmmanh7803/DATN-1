"use client";

import { useState, useEffect } from "react";
import { 
  adminService, 
  AdminLessonTopicDto, 
  AdminCourseDto, 
  CreateLessonTopicDto,
  UpdateLessonTopicDto 
} from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

interface LessonEditorProps {
  topicId?: number;
  defaultHskLevel?: number;
  defaultCourseId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function LessonEditor({ 
  topicId, 
  defaultHskLevel,
  defaultCourseId, 
  isOpen, 
  onClose, 
  onSave 
}: LessonEditorProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [topics, setTopics] = useState<AdminLessonTopicDto[]>([]);
  const [formData, setFormData] = useState<CreateLessonTopicDto>({
    courseId: defaultCourseId,
    hskLevel: defaultHskLevel,
    title: "",
    description: "",
    topicIndex: 1,
    imageUrl: "",
    isLocked: true,
    prerequisiteTopicId: undefined,
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (topicId) {
        loadTopicData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, topicId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load courses
      const coursesData = await adminService.getCourses();
      setCourses(coursesData);

      // Load existing topics để làm prerequisite options
      const topicsData = await adminService.getLessonTopics(formData.hskLevel);
      setTopics(topicsData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadTopicData = async () => {
    if (!topicId) return;
    
    setLoading(true);
    try {
      const topic = await adminService.getLessonTopicById(topicId);
      setFormData({
        courseId: topic.courseId,
        hskLevel: topic.hskLevel,
        title: topic.title,
        description: topic.description || "",
        topicIndex: topic.topicIndex,
        imageUrl: topic.imageUrl || "",
        isLocked: topic.isLocked,
        prerequisiteTopicId: topic.prerequisiteTopicId,
        isActive: topic.isActive,
      });

      // Load topics cùng hskLevel để làm prerequisite options
      const topicsData = await adminService.getLessonTopics(topic.hskLevel);
      setTopics(topicsData.filter(t => t.id !== topicId)); // Exclude current topic
    } catch (error) {
      console.error("Lỗi khi tải chi tiết chủ đề:", error);
      toast.error("Không thể tải chi tiết chủ đề");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: defaultCourseId,
      hskLevel: defaultHskLevel,
      title: "",
      description: "",
      topicIndex: 1,
      imageUrl: "",
      isLocked: true,
      prerequisiteTopicId: undefined,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.warning("Vui lòng nhập tên chủ đề");
      return;
    }

    if (!formData.hskLevel && !formData.courseId) {
      toast.warning("Vui lòng chọn HSK Level hoặc Khóa học");
      return;
    }

    setSaving(true);
    try {
      if (topicId) {
        // Update
        const updateData: UpdateLessonTopicDto = { ...formData };
        await adminService.updateLessonTopic(topicId, updateData);
        toast.success("Cập nhật chủ đề bài học thành công!");
      } else {
        // Create
        await adminService.createLessonTopic(formData);
        toast.success("Tạo chủ đề bài học thành công!");
      }
      onSave();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Lỗi khi lưu chủ đề:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể lưu chủ đề";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleHskLevelChange = async (hskLevel: number | undefined) => {
    setFormData({ ...formData, hskLevel, prerequisiteTopicId: undefined });
    if (hskLevel) {
      // Load topics cùng hskLevel
      try {
        const topicsData = await adminService.getLessonTopics(hskLevel);
        setTopics(topicsData.filter(t => t.id !== topicId));
      } catch (error) {
        console.error("Lỗi khi tải danh sách chủ đề:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {topicId ? "Sửa chủ đề bài học" : "Thêm chủ đề bài học mới"}
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HSK Level
                  </label>
                  <select
                    value={formData.hskLevel || ""}
                    onChange={(e) => handleHskLevelChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn HSK Level</option>
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <option key={level} value={level}>HSK {level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khóa học (tùy chọn)
                  </label>
                  <select
                    value={formData.courseId || ""}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn khóa học (tùy chọn)</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} {course.hskLevel ? `(HSK ${course.hskLevel})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chủ đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Gia đình, Màu sắc, Động vật..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn gọn về chủ đề"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số thứ tự chủ đề
                  </label>
                  <input
                    type="number"
                    value={formData.topicIndex}
                    onChange={(e) => setFormData({ ...formData, topicIndex: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề tiên quyết (tùy chọn)
                  </label>
                  <select
                    value={formData.prerequisiteTopicId || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      prerequisiteTopicId: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Không có</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title} (Index: {topic.topicIndex})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Kích hoạt</span>
                </label>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLocked ?? true}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Khóa chủ đề</span>
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
              disabled={loading || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Đang lưu..." : topicId ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
