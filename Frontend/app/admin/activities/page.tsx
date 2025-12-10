"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { createActivityIcons } from "@/components/vocabulary/LearningActivities";

interface LearningActivity {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isEnabled: boolean;
  completionCount: number;
  averageScore: number;
  lastUpdated: string;
}

export default function AdminActivitiesPage() {
  const icons = createActivityIcons();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedActivity, setSelectedActivity] = useState<LearningActivity | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Danh sách hoạt động học tập mẫu
  const [activities, setActivities] = useState<LearningActivity[]>([
    {
      id: "vocabulary",
      name: "Từ vựng",
      description: "Học từ vựng theo chủ đề",
      icon: icons.vocabulary,
      isActive: true,
      isEnabled: true,
      completionCount: 1234,
      averageScore: 85,
      lastUpdated: "2024-01-15",
    },
    {
      id: "quick-memorize",
      name: "Nhớ nhanh từ",
      description: "Nhớ từ vựng qua hội thoại",
      icon: icons.quickMemorize,
      isActive: true,
      isEnabled: true,
      completionCount: 987,
      averageScore: 78,
      lastUpdated: "2024-01-14",
    },
    {
      id: "image-quiz",
      name: "Kiểm tra từ vựng bằng hình ảnh",
      description: "Kiểm tra từ vựng thông qua hình ảnh minh họa",
      icon: icons.imageQuiz,
      isActive: true,
      isEnabled: true,
      completionCount: 756,
      averageScore: 82,
      lastUpdated: "2024-01-15",
    },
    {
      id: "true-false",
      name: "Chọn đúng sai",
      description: "Luyện tập chọn đúng sai",
      icon: icons.trueFalse,
      isActive: true,
      isEnabled: false,
      completionCount: 654,
      averageScore: 75,
      lastUpdated: "2024-01-13",
    },
    {
      id: "true-false-sentence",
      name: "Chọn đúng sai với câu",
      description: "Chọn đúng sai với câu hoàn chỉnh",
      icon: icons.trueFalseSentence,
      isActive: false,
      isEnabled: false,
      completionCount: 432,
      averageScore: 70,
      lastUpdated: "2024-01-12",
    },
    {
      id: "listen-image",
      name: "Nghe câu chọn hình ảnh",
      description: "Nghe câu và chọn hình ảnh phù hợp",
      icon: icons.listenImage,
      isActive: false,
      isEnabled: false,
      completionCount: 321,
      averageScore: 68,
      lastUpdated: "2024-01-11",
    },
    {
      id: "match-sentence",
      name: "Ghép câu",
      description: "Ghép các thành phần câu lại với nhau",
      icon: icons.matchSentence,
      isActive: false,
      isEnabled: false,
      completionCount: 210,
      averageScore: 65,
      lastUpdated: "2024-01-10",
    },
    {
      id: "fill-blank",
      name: "Điền từ",
      description: "Điền từ vào chỗ trống",
      icon: icons.fillBlank,
      isActive: false,
      isEnabled: false,
      completionCount: 198,
      averageScore: 72,
      lastUpdated: "2024-01-09",
    },
    {
      id: "flashcard",
      name: "Flash card từ vựng",
      description: "Học từ vựng bằng flashcard",
      icon: icons.flashcard,
      isActive: true,
      isEnabled: true,
      completionCount: 1456,
      averageScore: 88,
      lastUpdated: "2024-01-15",
    },
    {
      id: "conversation",
      name: "Hội thoại",
      description: "Luyện tập hội thoại tiếng Trung",
      icon: icons.conversation,
      isActive: false,
      isEnabled: false,
      completionCount: 167,
      averageScore: 73,
      lastUpdated: "2024-01-08",
    },
    {
      id: "reading",
      name: "Đọc hiểu",
      description: "Luyện đọc hiểu tiếng Trung",
      icon: icons.reading,
      isActive: false,
      isEnabled: false,
      completionCount: 154,
      averageScore: 69,
      lastUpdated: "2024-01-07",
    },
    {
      id: "grammar",
      name: "Ngữ pháp",
      description: "Học ngữ pháp tiếng Trung",
      icon: icons.grammar,
      isActive: false,
      isEnabled: false,
      completionCount: 143,
      averageScore: 71,
      lastUpdated: "2024-01-06",
    },
  ]);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && activity.isActive) ||
      (statusFilter === "inactive" && !activity.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = (id: string) => {
    const updatedActivities = activities.map(activity =>
      activity.id === id ? { ...activity, isActive: !activity.isActive } : activity
    );
    setActivities(updatedActivities);
    // Cập nhật selectedActivity nếu đang được chọn
    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity(updatedActivities.find(a => a.id === id) || null);
    }
  };

  const handleToggleEnabled = (id: string) => {
    const updatedActivities = activities.map(activity =>
      activity.id === id ? { ...activity, isEnabled: !activity.isEnabled } : activity
    );
    setActivities(updatedActivities);
    // Cập nhật selectedActivity nếu đang được chọn
    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity(updatedActivities.find(a => a.id === id) || null);
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Hoạt động Học tập</h1>
              <p className="text-gray-600">Quản lý và cấu hình các hoạt động học tập</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Thêm hoạt động
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Tổng hoạt động</div>
            <div className="text-3xl font-bold text-gray-900">{activities.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Đang hoạt động</div>
            <div className="text-3xl font-bold text-green-600">
              {activities.filter(a => a.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Đã kích hoạt</div>
            <div className="text-3xl font-bold text-blue-600">
              {activities.filter(a => a.isEnabled).length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Tổng lượt hoàn thành</div>
            <div className="text-3xl font-bold text-purple-600">
              {activities.reduce((sum, a) => sum + a.completionCount, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt hoàn thành
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm trung bình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cập nhật
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          activity.isActive ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"
                        }`}>
                          {activity.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                          <div className="text-xs text-gray-500">ID: {activity.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">{activity.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activity.isActive}
                            onChange={() => handleToggleActive(activity.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm text-gray-700">
                            {activity.isActive ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activity.isEnabled}
                            onChange={() => handleToggleEnabled(activity.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          <span className="ml-3 text-sm text-gray-700">
                            {activity.isEnabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.completionCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{activity.averageScore}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              activity.averageScore >= 80
                                ? "bg-green-500"
                                : activity.averageScore >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${activity.averageScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const currentActivity = activities.find(a => a.id === activity.id);
                            if (currentActivity) {
                              setSelectedActivity(currentActivity);
                              setShowDetailModal(true);
                            }
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            const currentActivity = activities.find(a => a.id === activity.id);
                            if (currentActivity) {
                              setSelectedActivity(currentActivity);
                              setShowConfigModal(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Cấu hình"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Sửa">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Xóa">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Details Modal Placeholder */}
        {filteredActivities.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">Không tìm thấy hoạt động nào.</p>
          </div>
        )}

        {/* Configuration Modal */}
        {showConfigModal && selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Cấu hình Hoạt động</h2>
                  <button
                    onClick={() => {
                      setShowConfigModal(false);
                      setSelectedActivity(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      {selectedActivity.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedActivity.name}</h3>
                      <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái hoạt động
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedActivity.isActive}
                        onChange={() => handleToggleActive(selectedActivity.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm text-gray-700">
                        {selectedActivity.isActive ? "Đang hoạt động" : "Tạm dừng"}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kích hoạt cho người dùng
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedActivity.isEnabled}
                        onChange={() => handleToggleEnabled(selectedActivity.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-sm text-gray-700">
                        {selectedActivity.isEnabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={activities.findIndex(a => a.id === selectedActivity.id) + 1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    setSelectedActivity(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    setSelectedActivity(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết Hoạt động</h2>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedActivity(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      {selectedActivity.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedActivity.name}</h3>
                      <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Lượt hoàn thành</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedActivity.completionCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Điểm trung bình</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedActivity.averageScore}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedActivity.isActive ? (
                        <span className="text-green-600">Đang hoạt động</span>
                      ) : (
                        <span className="text-gray-400">Tạm dừng</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Kích hoạt</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedActivity.isEnabled ? (
                        <span className="text-blue-600">Đã kích hoạt</span>
                      ) : (
                        <span className="text-gray-400">Chưa kích hoạt</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Biểu đồ thống kê</h4>
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Biểu đồ thống kê sẽ được hiển thị ở đây</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedActivity(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

