"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import WordEditor from "@/components/admin/WordEditor";
import { adminService, AdminWordDto } from "@/lib/services/adminService";
import apiClient from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function AdminVocabularyPage() {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [hskFilter, setHskFilter] = useState<string>("all");
  const [words, setWords] = useState<AdminWordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingWordId, setEditingWordId] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadWords();
  }, [hskFilter, searchTerm]);

  const loadWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const hskLevel = hskFilter !== "all" ? parseInt(hskFilter) : undefined;
      const search = searchTerm.trim() || undefined;
      const data = await adminService.getWords(hskLevel, search);
      setWords(data);
    } catch (err: any) {
      console.error("Error loading words:", err);
      setError(err.message || "Không thể tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ vựng này?")) {
      return;
    }

    try {
      await adminService.deleteWord(id);
      toast.success("Đã xóa từ vựng");
      setWords(words.filter((w) => w.id !== id));
    } catch (err: any) {
      toast.error("Lỗi khi xóa từ vựng: " + (err.message || "Unknown error"));
    }
  };

  const handleExportWordsWithoutHskLevel = async () => {
    try {
      // Sử dụng apiClient với responseType blob để download file
      const response = await apiClient.get("/api/admin/words/without-hsk-level/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `words-without-hsk-level_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Đã export thành công");
    } catch (error: any) {
      console.error("Lỗi khi export:", error);
      toast.error("Lỗi khi export: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  const filteredWords = words.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(words.length / pageSize);

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Từ vựng</h1>
              <p className="text-gray-600">Quản lý từ vựng HSK (HSK1-6)</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportWordsWithoutHskLevel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export từ chưa có HSK
              </button>
              <button
                onClick={() => {
                  setEditingWordId(undefined);
                  setEditorOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Thêm từ vựng
              </button>
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
                placeholder="Tìm theo từ, pinyin, nghĩa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadWords();
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo cấp độ HSK
              </label>
              <select
                value={hskFilter}
                onChange={(e) => setHskFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
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
            {error.includes("chưa được implement") && (
              <p className="text-sm mt-2">
                Vui lòng implement API endpoint: GET /api/admin/words
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Data Grid */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Tổng số: <span className="font-semibold text-gray-900">{words.length}</span> từ vựng
                </div>
                <div className="text-sm text-gray-600">
                  Trang {page} / {totalPages || 1}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Từ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pinyin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nghĩa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HSK Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          Không tìm thấy từ vựng nào.
                          {words.length === 0 && (
                            <p className="text-sm mt-2">
                              Vui lòng seed dữ liệu từ trang Dashboard hoặc thêm từ vựng mới.
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredWords.map((word) => (
                        <tr key={word.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {word.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {word.character}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {word.pinyin}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {word.meaning}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {word.hskLevel ? (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                HSK {word.hskLevel}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {word.createdAt
                              ? new Date(word.createdAt).toLocaleDateString("vi-VN")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingWordId(word.id);
                                  setEditorOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(word.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Xóa
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Word Editor Modal */}
      <WordEditor
        wordId={editingWordId}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingWordId(undefined);
        }}
        onSave={() => {
          loadWords();
        }}
      />
    </AdminLayout>
  );
}
