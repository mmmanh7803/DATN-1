"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { topicService } from "@/lib/services/topicService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import {
  LessonTopicDto,
  WordWithProgressDto,
} from "@/types";
import VocabularyPopupCard from "@/components/vocabulary/VocabularyPopupCard";
import ActivityProgressChart from "@/components/vocabulary/ActivityProgressChart";
import { 
  getQuickMemorizeCompletion,
  calculateQuickMemorizeProgress,
  storeQuickMemorizeCompletion
} from "@/lib/services/activityProgressService";
import { completeActivity } from "@/lib/services/activityService";
import LearningActivities, {
  ActivityItem,
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import DisplayOptionsModal, {
  DisplayOptions,
} from "@/components/vocabulary/DisplayOptionsModal";
import { aiService } from "@/lib/services/aiService";

export default function QuickMemorizePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<WordWithProgressDto | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [conversationText, setConversationText] = useState("");
  const [conversationData, setConversationData] = useState<{
    topic: string;
    monologue: Array<{ chinese: string; pinyin: string; translation: string }>;
  } | null>(null);
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(() => {
    // Load from localStorage hoặc dùng default
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickMemorizeDisplayOptions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      showChinese: true,
      showPinyin: false,
      showVietnamese: false,
    };
  });
  const [isGeneratingConversation, setIsGeneratingConversation] = useState(false);
  const [activityProgress, setActivityProgress] = useState<any>(null);
  const [hasMarkedAsCompleted, setHasMarkedAsCompleted] = useState(false);
  
  // Sử dụng hook để quản lý completed activities (đồng bộ giữa các trang)
  const {
    completedActivityIds,
    markActivityCompleted,
    loadCompletedActivities,
  } = useCompletedActivities({ topicId });

  useEffect(() => {
    if (topicId) {
      loadData();
    }
  }, [topicId]);

  // Tự động đánh dấu hoàn thành ngay khi user vào trang (chỉ cần lướt qua 1 lần)
  useEffect(() => {
    // Chỉ đánh dấu nếu:
    // 1. Đã load xong topic data
    // 2. Chưa đánh dấu trước đó
    // 3. Activity chưa được đánh dấu completed
    if (!topic || !topic.words || topic.words.length === 0 || 
        hasMarkedAsCompleted || 
        completedActivityIds.includes("quick-memorize")) {
      return;
    }

    // Đánh dấu hoàn thành ngay khi data đã load
    const markAsCompleted = async () => {
      try {
        // Lấy tất cả từ vựng thuộc chủ đề hiện tại
        // topic.words đã được filter từ backend, chỉ chứa các từ thuộc chủ đề này
        const wordsInTopic = topic.words || [];
        
        if (wordsInTopic.length === 0) {
          return;
        }
        
        // Lấy tất cả word IDs của các từ thuộc chủ đề
        // Đảm bảo chỉ lấy các từ có trong topic.words (thuộc chủ đề hiện tại)
        const wordIdsInTopic = wordsInTopic
          .filter(w => w && w.id) // Filter null/undefined
          .map(w => w.id)
          .filter(id => typeof id === 'number' && id > 0); // Chỉ lấy valid IDs
        
        // XÓA dữ liệu cũ nếu có (tránh lỗi từ các chủ đề khác)
        // Lưu lại chỉ các word IDs của chủ đề hiện tại
        storeQuickMemorizeCompletion(topicId, wordIdsInTopic);
        
        // Cập nhật progress - chỉ tính các từ thuộc chủ đề
        const completedWords = new Set(wordIdsInTopic);
        const progress = calculateQuickMemorizeProgress(wordsInTopic, completedWords);
        
        // Đảm bảo total luôn bằng số từ trong chủ đề (không phải từ nguồn khác)
        progress.total = wordsInTopic.length;
        progress.completed = Math.min(progress.completed, wordsInTopic.length);
        progress.notStarted = Math.max(0, wordsInTopic.length - progress.completed);
        
        setActivityProgress(progress);
        
        // Đánh dấu activity là completed (hook sẽ tự động cập nhật và đồng bộ)
        await markActivityCompleted("quick-memorize");
        setHasMarkedAsCompleted(true);
      } catch (error) {
        // Silent error handling
      }
    };

    // Đánh dấu ngay khi component mount và data đã sẵn sàng
    markAsCompleted();
  }, [topic, topicId, hasMarkedAsCompleted, completedActivityIds]);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);
      
      // Completed activities được load tự động bởi hook useCompletedActivities
      
      // Tạo đoạn hội thoại từ các từ vựng
      generateConversationText(topicData.words || []);
      
      // Load quick memorize progress
      // Chỉ tính progress cho các từ thuộc chủ đề hiện tại
      const wordsInTopic = (topicData.words || []).filter(w => w && w.id); // Filter valid words
      const topicWordIds = new Set(wordsInTopic.map(w => w.id));
      
      
      // Lấy completed words từ localStorage (đã được lưu theo topicId)
      const completedWords = getQuickMemorizeCompletion(topicId);
      
      // Filter completedWords để CHỈ lấy các từ thuộc chủ đề này
      // Đây là bước quan trọng để tránh lấy word IDs từ chủ đề khác
      const completedWordsInTopic = new Set(
        Array.from(completedWords).filter(id => topicWordIds.has(id))
      );
      
      // Nếu có word IDs không hợp lệ trong localStorage, clean up
      if (completedWords.size > completedWordsInTopic.size) {
        // Lưu lại chỉ các word IDs hợp lệ
        storeQuickMemorizeCompletion(topicId, Array.from(completedWordsInTopic));
      }
      
      // Tính progress - đảm bảo total = số từ trong chủ đề
      const progress = calculateQuickMemorizeProgress(wordsInTopic, completedWordsInTopic);
      
      // Đảm bảo total luôn bằng số từ trong chủ đề (KHÔNG phải từ nguồn khác)
      // Force update để tránh lỗi hiển thị sai (ví dụ: hiển thị 150 thay vì 14)
      progress.total = wordsInTopic.length;
      progress.completed = Math.min(progress.completed, wordsInTopic.length);
      progress.notStarted = Math.max(0, wordsInTopic.length - progress.completed);
      
      setActivityProgress(progress);
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert("Chủ đề từ vựng chưa được tạo.");
        router.push(`/topics/${topicId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tạo đoạn hội thoại từ các từ vựng bằng AI
  const generateConversationText = async (words: WordWithProgressDto[]) => {
    if (!words || words.length === 0) {
      setConversationText("Chưa có từ vựng nào trong chủ đề này.");
      setConversationData(null);
      return;
    }

    try {
      setIsGeneratingConversation(true);
      
      // Lấy 15 từ đầu tiên để tạo đoạn hội thoại
      const selectedWords = words.slice(0, 15);
      const wordsWithMeaning = selectedWords.map(w => ({
        word: w.character,
        meaning: w.meaning,
      }));
      
      // Gọi AI để generate conversation
      const conversation = await aiService.generateConversation(wordsWithMeaning);
      setConversationData(conversation);
      
      // Tạo text từ monologue để highlight
      const text = conversation.monologue.map(m => m.chinese).join("");
      setConversationText(text);
    } catch (error: any) {
      // Fallback về text mẫu nếu AI fail
      const selectedWords = words.slice(0, 15);
      const characters = selectedWords.map(w => w.character);
      const sampleText = `你好! Hôm nay ${characters[1] || ""} có khỏe không? Tôi thì rất vui vì đã gặp được ${characters[2] || ""} người bạn mới. Chúng tôi cùng nhau ngắm nhìn ${characters[3] || ""} chú ${characters[4] || ""} đang phi nước đại trên cánh đồng ${characters[5] || ""}. Bỗng nhiên, có ${characters[6] || ""} con chim lạ bay đến, đậu trên một cái ${characters[7] || ""} giếng cạn. Chúng có bộ lông ${characters[8] || ""} như tuyết. Một ${characters[9] || ""} đi tới, cố gắng xua chúng đi, nhưng chúng lại ${characters[10] || ""} hề sợ hãi.`;
      setConversationText(sampleText);
      setConversationData(null);
    } finally {
      setIsGeneratingConversation(false);
    }
  };

  // Highlight từ vựng trong text với tùy chọn hiển thị
  const highlightWords = (text: string) => {
    if (!topic || !text) return <span>{text}</span>;

    const words = topic.words || [];
    
    // Sắp xếp từ vựng theo độ dài (từ dài đến ngắn) để match từ dài trước
    const sortedWords = [...words].sort((a, b) => b.character.length - a.character.length);
    
    const parts: Array<{ text: string; isWord: boolean; word?: WordWithProgressDto }> = [];
    let lastIndex = 0;
    const processedIndices = new Set<number>();

    // Duyệt qua text và tìm các từ vựng có trong part
    for (let i = 0; i < text.length; i++) {
      // Bỏ qua nếu đã được xử lý
      if (processedIndices.has(i)) continue;
      
      // Thử match với từ dài nhất trước
      let matched = false;
      for (const word of sortedWords) {
        const wordLength = word.character.length;
        const substring = text.substring(i, i + wordLength);
        
        // Chỉ match chính xác
        if (substring === word.character) {
          // Thêm phần text trước từ
          if (i > lastIndex) {
            parts.push({
              text: text.substring(lastIndex, i),
              isWord: false,
            });
          }
          
          // Thêm từ vựng được highlight
          parts.push({
            text: word.character,
            isWord: true,
            word: word,
          });
          
          // Đánh dấu các vị trí đã xử lý
          for (let j = i; j < i + wordLength; j++) {
            processedIndices.add(j);
          }
          
          lastIndex = i + wordLength;
          matched = true;
          break;
        }
      }
      
      // Nếu không match, chỉ cần tăng i (sẽ được xử lý ở phần text còn lại)
    }

    // Thêm phần text còn lại
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isWord: false,
      });
    }

    return (
      <>
        {parts.map((part, index) => {
          if (part.isWord && part.word) {
            const word = part.word;
            const elements: React.ReactNode[] = [];

            // Hiển thị chữ Hán
            if (displayOptions.showChinese) {
              elements.push(
                <span
                  key={`${index}-char`}
                  onClick={(e) => handleWordClick(word, e)}
                  className="text-red-500 font-semibold cursor-pointer hover:text-red-400 transition-colors"
                >
                  {part.text}
                </span>
              );
            }

            // Hiển thị Pinyin
            if (displayOptions.showPinyin && word.pinyin) {
              elements.push(
                <span
                  key={`${index}-pinyin`}
                  className="text-blue-600 italic ml-1"
                >
                  ({word.pinyin})
                </span>
              );
            }

            // Hiển thị nghĩa tiếng Việt
            if (displayOptions.showVietnamese && word.meaning) {
              elements.push(
                <span
                  key={`${index}-meaning`}
                  className="text-gray-600 ml-1"
                >
                  [{word.meaning}]
                </span>
              );
            }

            // Nếu không hiển thị gì, vẫn hiển thị chữ Hán
            if (elements.length === 0) {
              elements.push(
                <span
                  key={`${index}-char`}
                  onClick={(e) => handleWordClick(word, e)}
                  className="text-red-500 font-semibold cursor-pointer hover:text-red-400 transition-colors"
                >
                  {part.text}
                </span>
              );
            }

            return <span key={index}>{elements}</span>;
          }
          return <span key={index}>{part.text}</span>;
        })}
      </>
    );
  };

  const handleSaveDisplayOptions = (options: DisplayOptions) => {
    setDisplayOptions(options);
    // Lưu vào localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("quickMemorizeDisplayOptions", JSON.stringify(options));
    }
  };

  const handleWordClick = (word: WordWithProgressDto, event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setSelectedWord(word);
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
    setPopupPosition(null);
  };

  // COPY từ trang vocabulary learning - Cách tính ĐÚNG
  const vocabStats = topic
    ? {
        total: topic.words?.length || 0, // CHỈ dùng topic.words.length
        mastered: topic.words?.filter((w: any) => w.progress?.status === "Mastered").length || 0,
        learning: topic.words?.filter((w: any) => w.progress?.status === "Learning").length || 0,
        new: topic.words?.filter((w: any) => !w.progress || w.progress.status === "New").length || 0,
      }
    : { total: 0, mastered: 0, learning: 0, new: 0 };

  // completedCount = mastered + learning (giống trang vocabulary learning)
  const completedCount = vocabStats.mastered + vocabStats.learning;
  
  // Giữ lại progressStats cho UI khác (nếu cần)
  const progressStats = {
    completed: vocabStats.mastered,
    inProgress: vocabStats.learning,
    notStarted: vocabStats.new,
    total: vocabStats.total
  };


  // Tính phần trăm cho biểu đồ tròn
  const completedPercent = progressStats.total > 0 
    ? Math.round((progressStats.completed / progressStats.total) * 100) 
    : 0;
  const inProgressPercent = progressStats.total > 0 
    ? Math.round((progressStats.inProgress / progressStats.total) * 100) 
    : 0;
  const notStartedPercent = progressStats.total > 0 
    ? Math.round((progressStats.notStarted / progressStats.total) * 100) 
    : 0;

  // Danh sách hoạt động học tập
  const activities = useMemo(() => {
    if (!topic) return [];
    return createDefaultActivities({
      vocabularyLink: `/topics/${topicId}`,
      quickMemorizeLink: `/topics/${topicId}/quick-memorize`,
      imageQuizLink: `/topics/${topicId}/image-quiz`,
      pronunciationLink: `/topics/${topicId}/pronunciation`,
      progressLink: `/topics/${topicId}/progress`,
      grammarLink: `/topics/${topicId}/grammar`,
      activeId: "quick-memorize",
      completedIds: completedActivityIds,
    });
  }, [topic, topicId, completedActivityIds]);

  // Vẽ biểu đồ tròn
  const renderPieChart = () => {
    const size = 120;
    const radius = size / 2 - 5;
    const centerX = size / 2;
    const centerY = size / 2;
    const circumference = 2 * Math.PI * radius;

    // Tính độ dài cho mỗi phần (theo phần trăm)
    const completedLength = (completedPercent / 100) * circumference;
    const inProgressLength = (inProgressPercent / 100) * circumference;
    const notStartedLength = (notStartedPercent / 100) * circumference;

    // Tính offset cho mỗi phần
    // Completed: bắt đầu từ 0, hiển thị completedLength
    const completedOffset = circumference - completedLength;
    // In Progress: bắt đầu sau completed, hiển thị inProgressLength
    const inProgressOffset = circumference - inProgressLength - completedLength;
    // Not Started: bắt đầu sau completed + inProgress, hiển thị notStartedLength
    const notStartedOffset = circumference - notStartedLength - inProgressLength - completedLength;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Completed - Green (vẽ đầu tiên từ góc 0) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="10"
          strokeDasharray={`${completedLength} ${circumference}`}
          strokeDashoffset="0"
          className="transition-all duration-500"
        />
        {/* In Progress - Orange (vẽ sau completed) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="10"
          strokeDasharray={`${inProgressLength} ${circumference}`}
          strokeDashoffset={-completedLength}
          className="transition-all duration-500"
        />
        {/* Not Started - Gray (vẽ cuối cùng) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeDasharray={`${notStartedLength} ${circumference}`}
          strokeDashoffset={-(completedLength + inProgressLength)}
          className="transition-all duration-500"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Nhớ từ qua hội thoại
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Nhớ từ qua hội thoại
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">Không tìm thấy chủ đề từ vựng.</p>
              <Link
                href="/vocabulary"
                className="text-primary hover:text-primary-dark underline"
              >
                Quay lại danh sách chủ đề
              </Link>
            </div>
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
            <Link
              href={`/topics/${topicId}`}
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại chủ đề
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Nhớ từ qua hội thoại
                </h1>
                {topic && (
                  <p className="text-xl text-white/90">
                    {topic.title || `Chủ đề ${topicId}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsDisplayOptionsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                <span className="text-sm font-medium">Tùy chọn hiển thị</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thống kê tiến độ */}
            {activityProgress && topic && (
              <ActivityProgressChart 
                progress={{
                  ...activityProgress,
                  // Dùng vocabStats.total (đã copy từ vocabulary learning page)
                  total: vocabStats.total,
                  completed: Math.min(activityProgress.completed, vocabStats.total),
                  notStarted: Math.max(0, vocabStats.total - activityProgress.completed),
                }} 
                showDetails={true} 
              />
            )}

            {/* Đoạn hội thoại */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isGeneratingConversation ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-gray-600">Đang tạo đoạn hội thoại bằng AI...</span>
                </div>
              ) : conversationData ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{conversationData.topic}</h3>
                  <div className="space-y-3">
                    {conversationData.monologue.map((sentence, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                        <p className="text-lg leading-relaxed text-gray-800 mb-1">
                          {highlightWords(sentence.chinese)}
                        </p>
                        {displayOptions.showPinyin && (
                          <p className="text-blue-600 italic text-sm mb-1">{sentence.pinyin}</p>
                        )}
                        {displayOptions.showVietnamese && (
                          <p className="text-gray-600 text-sm">{sentence.translation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed text-gray-800">
                    {highlightWords(conversationText)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Activities */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <LearningActivities
                activities={activities}
                title={topic?.title || "Hán Ngữ"}
                completedCount={completedCount}
                totalCount={vocabStats.total}
                maxHeight="calc(100vh-200px)"
              />
            </div>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Popup hiển thị chi tiết từ vựng */}
      {selectedWord && popupPosition && (
        <VocabularyPopupCard
          word={selectedWord}
          position={popupPosition}
          onClose={handleClosePopup}
          onViewDetail={(word) => {
            router.push(`/topics/${topicId}?word=${word.id}`);
            handleClosePopup();
          }}
        />
      )}

      {/* Display Options Modal */}
      <DisplayOptionsModal
        isOpen={isDisplayOptionsOpen}
        onClose={() => setIsDisplayOptionsOpen(false)}
        onSave={handleSaveDisplayOptions}
        initialOptions={displayOptions}
      />
    </div>
  );
}

