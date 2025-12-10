"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminService, AdminUserDto } from "@/lib/services/adminService";
import { useToast } from "@/contexts/ToastContext";

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers(searchTerm || undefined);
      setUsers(data);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleMakeAdmin = async (id: string, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn gán quyền Admin cho ${email}?`)) {
      return;
    }

    try {
      setActionLoading(id);
      await adminService.makeAdmin(id);
      toast.success(`Đã gán quyền Admin cho ${email}`);
      await loadUsers();
    } catch (err: any) {
      toast.error("Lỗi: " + (err.message || "Không thể gán quyền Admin"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn gỡ quyền Admin của ${email}?`)) {
      return;
    }

    try {
      setActionLoading(id);
      await adminService.removeAdmin(id);
      toast.success(`Đã gỡ quyền Admin của ${email}`);
      await loadUsers();
    } catch (err: any) {
      toast.error("Lỗi: " + (err.message || "Không thể gỡ quyền Admin"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa người dùng ${email}? Hành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      setActionLoading(id);
      await adminService.deleteUser(id);
      toast.success(`Đã xóa người dùng ${email}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err: any) {
      toast.error("Lỗi khi xóa người dùng: " + (err.message || "Unknown error"));
    } finally {
      setActionLoading(null);
    }
  };

  const isAdmin = (user: AdminUserDto) => user.roles?.includes("Admin");

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
              <p className="text-gray-600">Quản lý học viên và phân quyền Admin</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo email, tên người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tìm kiếm
              </button>
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

        {/* Users Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-sm text-gray-600">
                Tổng số: <span className="font-semibold text-gray-900">{users.length}</span> người dùng
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              isAdmin(user) ? "bg-yellow-500" : "bg-blue-600"
                            }`}>
                              <span className="text-white text-sm font-medium">
                                {user.userName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.userName || "Người dùng"}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {user.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role}
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    role === "Admin"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {role === "Admin" ? "👑 Admin" : "👤 User"}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                Chưa có role
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.lockoutEnd && new Date(user.lockoutEnd) > new Date() ? (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              🔒 Bị khóa
                            </span>
                          ) : user.emailConfirmed ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              ✓ Đã xác thực
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Chưa xác thực
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin(user) ? (
                              <button
                                onClick={() => handleRemoveAdmin(user.id, user.email)}
                                disabled={actionLoading === user.id || user.email === "admin@hihsk.com"}
                                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={user.email === "admin@hihsk.com" ? "Không thể gỡ Admin mặc định" : "Gỡ quyền Admin"}
                              >
                                {actionLoading === user.id ? "..." : "Gỡ Admin"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMakeAdmin(user.id, user.email)}
                                disabled={actionLoading === user.id}
                                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
                              >
                                {actionLoading === user.id ? "..." : "Gán Admin"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id, user.email)}
                              disabled={actionLoading === user.id || user.email === "admin@hihsk.com"}
                              className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={user.email === "admin@hihsk.com" ? "Không thể xóa Admin mặc định" : "Xóa người dùng"}
                            >
                              {actionLoading === user.id ? "..." : "Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Chú thích vai trò:</h3>
          <div className="flex gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">👑 Admin</span>
              <span>Có toàn quyền quản trị hệ thống</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">👤 User</span>
              <span>Người dùng thông thường (học viên)</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
