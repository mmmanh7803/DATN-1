"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { topicService } from "@/lib/services/topicService";
import { LessonTopicListDto } from "@/types";

export default function CoursesPage() {
  const [topics, setTopics] = useState<LessonTopicListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHSKLevel, setSelectedHSKLevel] = useState<number | undefined>(undefined);
  const [activitiesCount, setActivitiesCount] = useState<number>(0);

  useEffect(() => {
    if (selectedHSKLevel) {
      // Hiển thị lessons/topics của HSK level được chọn
      setTopics([]);
      loadLessonTopicsByHSKLevel(selectedHSKLevel);
    } else {
      setTopics([]);
    }
  }, [selectedHSKLevel]);

  const loadLessonTopicsByHSKLevel = async (hskLevel: number) => {
    try {
      setLoading(true);
      console.log("Loading lessons for HSK level:", hskLevel);
      const data = await topicService.getTopicsByHSKLevel(hskLevel);
      console.log("Loaded lessons data:", data);
      setTopics(data || []);
    } catch (error: any) {
      console.error("Error loading lesson topics:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const hskLevels = [
    { level: 1, name: "HSK 1", description: "Cấp độ cơ bản nhất", color: "from-green-500 to-emerald-500" },
    { level: 2, name: "HSK 2", description: "Giao tiếp cơ bản", color: "from-blue-500 to-cyan-500" },
    { level: 3, name: "HSK 3", description: "Giao tiếp hàng ngày", color: "from-purple-500 to-violet-500" },
    { level: 4, name: "HSK 4", description: "Giao tiếp lưu loát", color: "from-orange-500 to-amber-500" },
    { level: 5, name: "HSK 5", description: "Đọc báo, xem phim", color: "from-red-500 to-pink-500" },
    { level: 6, name: "HSK 6", description: "Thành thạo như người bản ngữ", color: "from-indigo-500 to-blue-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải giáo trình HSK...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
              Giáo trình HSK
            </h1>
            <p className="text-xl text-white/90 text-center max-w-2xl mx-auto">
              Chọn cấp độ HSK phù hợp và bắt đầu hành trình học tiếng Trung của bạn
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedHSKLevel(undefined)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  selectedHSKLevel === undefined
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              {hskLevels.map((hsk) => (
                <button
                  key={hsk.level}
                  onClick={() => setSelectedHSKLevel(hsk.level)}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    selectedHSKLevel === hsk.level
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {hsk.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Topics List */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {!selectedHSKLevel ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">
                  Vui lòng chọn cấp độ HSK để xem danh sách chủ đề
                </p>
                <p className="text-gray-500">
                  Chọn một trong các cấp độ HSK 1-6 ở trên để bắt đầu học
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách bài học...</p>
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">
                  Chưa có bài học nào cho HSK {selectedHSKLevel}
                </p>
                <p className="text-gray-500">
                  Vui lòng kiểm tra lại hoặc thử lại sau
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-dark mb-2">
                  {hskLevels.find(h => h.level === selectedHSKLevel)?.name} - Danh sách bài học
                </h2>
                <p className="text-gray-600 mb-6">
                  Chọn bài học để bắt đầu học từ vựng và làm bài tập
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((topic, index) => {
                    // Tất cả topics ở đây đều là LessonTopicListDto
                    const lessonTopic = topic as LessonTopicListDto;
                    const previousTopic = index > 0 ? topics[index - 1] : null;

                    const topicLink = `/topics/${lessonTopic.id}`;

                    const topicTitle = lessonTopic.title;
                    const topicDescription = lessonTopic.description;
                    const wordCount = lessonTopic.totalWords || 0;
                    
                    // Kiểm tra trạng thái hoàn thành (100% progress)
                    const isCompleted = lessonTopic.progressPercentage >= 100;

                    // Nội dung card
                    const cardContent = (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                lessonTopic.isLocked 
                                  ? "bg-gray-200 text-gray-500" 
                                  : isCompleted
                                    ? "bg-green-500 text-white"
                                    : "bg-primary/20 text-primary"
                              }`}>
                                {lessonTopic.isLocked ? "🔒" : isCompleted ? "✓" : lessonTopic.topicIndex}
                              </div>
                              <div>
                                <h3 className={`text-lg font-bold ${
                                  lessonTopic.isLocked ? "text-gray-400" : "text-dark"
                                }`}>
                                  {topicTitle}
                                </h3>
                                {isCompleted && (
                                  <span className="text-xs text-green-600 font-medium">Đã hoàn thành</span>
                                )}
                              </div>
                            </div>
                            {topicDescription && (
                              <p className={`text-sm mb-3 line-clamp-2 ${
                                lessonTopic.isLocked ? "text-gray-400" : "text-gray-600"
                              }`}>{topicDescription}</p>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-4 text-sm mb-3 ${
                          lessonTopic.isLocked ? "text-gray-400" : "text-gray-500"
                        }`}>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {activitiesCount} hoạt động học
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {wordCount} từ vựng
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{lessonTopic.isLocked ? "Tiến độ yêu cầu" : "Tiến độ"}</span>
                            <span>{lessonTopic.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isCompleted ? "bg-green-500" : "bg-primary"
                              }`}
                              style={{ width: `${lessonTopic.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Thông tin mở khóa */}
                        {lessonTopic.isLocked && previousTopic && (
                          <p className="text-xs text-amber-600 mt-2">
                            Hoàn thành "{previousTopic.title}" để mở khóa
                          </p>
                        )}
                        <div className={`font-semibold text-sm mt-3 ${
                          lessonTopic.isLocked 
                            ? "text-gray-400" 
                            : isCompleted 
                              ? "text-green-600" 
                              : "text-primary"
                        }`}>
                          {lessonTopic.isLocked 
                            ? "🔒 Đã khóa" 
                            : isCompleted 
                              ? "✓ Hoàn thành" 
                              : "Bắt đầu →"}
                        </div>
                      </>
                    );

                    // Nếu topic bị khóa, không cho click
                    if (lessonTopic.isLocked) {
                      return (
                        <div
                          key={topic.id}
                          className="block bg-gray-50 rounded-lg shadow-md p-6 cursor-not-allowed opacity-70"
                          title="Hoàn thành chủ đề trước để mở khóa"
                        >
                          {cardContent}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={topic.id}
                        href={topicLink}
                        className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1 ${
                          isCompleted ? "border-2 border-green-200" : ""
                        }`}
                      >
                        {cardContent}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

