"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminService } from "@/lib/services/adminService";
import { AdminWordDto } from "@/lib/services/adminService";

export default function AdminQuizPage() {
  const [words, setWords] = useState<AdminWordDto[]>([]);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [hskLevel, setHskLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadWords();
  }, [hskLevel]);

  const loadWords = async () => {
    try {
      setLoading(true);
      const hsk = hskLevel !== "all" ? parseInt(hskLevel) : undefined;
      const data = await adminService.getWords(hsk);
      setWords(data);
    } catch (error: any) {
      console.error("Error loading words:", error);
      setMessage({ type: "error", text: "Không thể tải danh sách từ vựng" });
    } finally {
      setLoading(false);
    }
  };

  const toggleWordSelection = (wordId: number) => {
    setSelectedWords((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  };

  const handleGenerateQuiz = async () => {
    if (selectedWords.length === 0) {
      setMessage({ type: "error", text: "Vui lòng chọn ít nhất một từ vựng" });
      return;
    }

    if (!quizTitle.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập tiêu đề quiz" });
      return;
    }

    try {
      setGenerating(true);
      setMessage(null);

      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle,
          wordIds: selectedWords,
          hskLevel: hskLevel !== "all" ? parseInt(hskLevel) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lỗi khi tạo quiz");
      }

      const result = await response.json();
      setMessage({ type: "success", text: result.message || `Đã tạo quiz "${quizTitle}" với ${selectedWords.length} từ vựng` });
      setSelectedWords([]);
      setQuizTitle("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Lỗi khi tạo quiz" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Quiz</h1>
          <p className="text-gray-600">Tạo quiz từ danh sách từ vựng</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Quiz Builder */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo Quiz Mới</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề Quiz
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Ví dụ: Quiz HSK 1 - Bài 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo cấp độ HSK
              </label>
              <select
                value={hskLevel}
                onChange={(e) => setHskLevel(e.target.value)}
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

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Đã chọn: <span className="font-semibold text-gray-900">{selectedWords.length}</span> từ vựng
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={generating || selectedWords.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {generating ? "Đang tạo..." : "Tạo Quiz"}
            </button>
          </div>

          {/* Words List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải từ vựng...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              {words.map((word) => (
                <div
                  key={word.id}
                  onClick={() => toggleWordSelection(word.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedWords.includes(word.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900 mb-1">{word.character}</div>
                      <div className="text-sm text-gray-600 mb-1">{word.pinyin}</div>
                      <div className="text-sm text-gray-700">{word.meaning}</div>
                      {word.hskLevel && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          HSK {word.hskLevel}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedWords.includes(word.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedWords.includes(word.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

