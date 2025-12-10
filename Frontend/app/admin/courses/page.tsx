"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CourseEditor from "@/components/admin/CourseEditor";
import { adminService, AdminCourseDto } from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

export default function AdminCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error("Error loading courses:", err);
      setError(err.message || "Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      return;
    }

    try {
      await adminService.deleteCourse(id);
      toast.success("Đã xóa khóa học");
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error("Lỗi khi xóa khóa học: " + (err.message || "Unknown error"));
    }
  };

  const handleCreate = () => {
    setEditingCourseId(undefined);
    setEditorOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditingCourseId(id);
    setEditorOpen(true);
  };

  const handleSave = () => {
    loadCourses();
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Khóa học</h1>
              <p className="text-gray-600">Quản lý các khóa học HSK</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Thêm khóa học
            </button>
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

        {/* Courses Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-md p-12 text-center">
                <p className="text-gray-500 mb-2">Không tìm thấy khóa học nào.</p>
                <p className="text-sm text-gray-400">
                  Vui lòng seed dữ liệu từ trang Dashboard hoặc thêm khóa học mới.
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{course.description || "Khóa học HSK"}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        course.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Số bài học:</span>
                      <span className="font-medium">{course.totalLessons || course.lessonCount || 0} bài</span>
                    </div>
                    {course.hskLevel && (
                      <div className="flex items-center justify-between">
                        <span>Cấp độ HSK:</span>
                        <span className="font-medium">HSK {course.hskLevel}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Tiến độ:</span>
                      <span className="font-medium">{course.progressPercentage || 0}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Quản lý
                    </button>
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
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

      {/* Course Editor Modal */}
      <CourseEditor
        courseId={editingCourseId}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingCourseId(undefined);
        }}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
