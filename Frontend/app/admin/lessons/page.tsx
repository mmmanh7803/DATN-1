"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LessonEditor from "@/components/admin/LessonEditor";
import { adminService, AdminLessonTopicDto, AdminCourseDto } from "@/lib/services/adminService";
import ConfirmModal from "@/components/common/ConfirmModal";
import MessageModal from "@/components/common/MessageModal";

export default function AdminLessonsPage() {
  const [topics, setTopics] = useState<AdminLessonTopicDto[]>([]);
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [hskLevelFilter, setHskLevelFilter] = useState<string>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<number | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; type: "success" | "error"; title: string; message: string }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadTopics();
  }, [courseFilter, hskLevelFilter]);

  const loadCourses = async () => {
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseId = courseFilter !== "all" ? parseInt(courseFilter) : undefined;
      const hskLevel = hskLevelFilter !== "all" ? parseInt(hskLevelFilter) : undefined;
      const data = await adminService.getLessonTopics(hskLevel, courseId);
      // Đảm bảo data luôn là array
      setTopics(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading topics:", err);
      setError(err.message || "Không thể tải danh sách chủ đề");
      setTopics([]); // Set empty array khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTopicToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!topicToDelete) return;

    try {
      await adminService.deleteLessonTopic(topicToDelete);
      setTopics(topics.filter((t) => t.id !== topicToDelete));
      setDeleteConfirmOpen(false);
      setTopicToDelete(null);
      setMessageModal({
        isOpen: true,
        type: "success",
        title: "Thành công",
        message: "Đã xóa chủ đề thành công",
      });
    } catch (err: any) {
      setDeleteConfirmOpen(false);
      setMessageModal({
        isOpen: true,
        type: "error",
        title: "Lỗi",
        message: "Lỗi khi xóa chủ đề: " + (err.message || "Unknown error"),
      });
    }
  };

  const handleCreate = () => {
    setEditingTopicId(undefined);
    setEditorOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditingTopicId(id);
    setEditorOpen(true);
  };

  const handleSave = () => {
    loadTopics();
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Chủ đề Bài học</h1>
              <p className="text-gray-600">Quản lý chủ đề bài học và nội dung học tập</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Thêm chủ đề
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo khóa học
              </label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả khóa học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} {course.hskLevel ? `(HSK ${course.hskLevel})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo HSK Level
              </label>
              <select
                value={hskLevelFilter}
                onChange={(e) => setHskLevelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả HSK</option>
                <option value="1">HSK 1</option>
                <option value="2">HSK 2</option>
                <option value="3">HSK 3</option>
                <option value="4">HSK 4</option>
                <option value="5">HSK 5</option>
                <option value="6">HSK 6</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Topics Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!Array.isArray(topics) || topics.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-md p-12 text-center">
                <p className="text-gray-500 mb-2">Không tìm thấy chủ đề nào.</p>
                <p className="text-sm text-gray-400">
                  Vui lòng thêm chủ đề mới hoặc kiểm tra bộ lọc.
                </p>
              </div>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {topic.hskLevel && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            HSK {topic.hskLevel}
                          </span>
                        )}
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            topic.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {topic.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Chủ đề số:</span>
                      <span>{topic.topicIndex}</span>
                    </div>
                    {topic.description && (
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {topic.description}
                      </div>
                    )}
                    {topic.isLocked && (
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 text-xs">🔒 Đã khóa</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(topic.id)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => handleEdit(topic.id)}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(topic.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Topic Editor Modal */}
      <LessonEditor
        topicId={editingTopicId}
        defaultCourseId={courseFilter !== "all" ? parseInt(courseFilter) : undefined}
        defaultHskLevel={hskLevelFilter !== "all" ? parseInt(hskLevelFilter) : undefined}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingTopicId(undefined);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa chủ đề này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTopicToDelete(null);
        }}
      />

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
      />
    </AdminLayout>
  );
}
