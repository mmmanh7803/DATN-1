"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WordWithProgressDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";

interface VocabularyDetailViewProps {
  word: WordWithProgressDto;
  onClose?: () => void;
}

// Helper function to calculate progress
function calculateProgress(word: WordWithProgressDto): number {
  if (!word.progress) return 0;

  const { status, reviewCount, correctCount } = word.progress;

  if (status === "Mastered") return 100;
  if (status === "Reviewing") return 75;
  if (status === "Learning") {
    if (reviewCount === 0) return 10;
    const accuracy = (correctCount / reviewCount) * 100;
    return Math.min(90, Math.max(20, accuracy));
  }
  return 0; // New
}

// Learning activities list
const learningActivities = [
  { name: "Từ vựng", completed: true },
  { name: "Nhớ nhanh từ", completed: true },
  { name: "Chọn đúng sai", completed: false },
  { name: "Chọn đúng sai với câu", completed: false },
  { name: "Nghe câu chọn hình ảnh", completed: false },
  { name: "Ghép câu", completed: false },
];

export default function VocabularyDetailView({ word, onClose }: VocabularyDetailViewProps) {
  const router = useRouter();
  const [isExamplesCollapsed, setIsExamplesCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activities] = useState(learningActivities);
  const progress = calculateProgress(word);

  const playAudio = async (text?: string) => {
    try {
      setIsPlaying(true);
      const audioText = text || word.character;
      
      // Clean text để loại bỏ BOM
      const cleanAudioText = audioText ? audioText.replace(/^\uFEFF/, "").trim() : "";
      
      // Nếu text khác với word.character, đây là example sentence - không dùng word.audioUrl
      const isExampleSentence = text && text !== word.character;
      
      // Chỉ dùng word.audioUrl khi không phải example sentence
      let audioUrl = !isExampleSentence ? word.audioUrl : null;
      
      // Nếu có audioUrl và là Google TTS URL, convert sang proxy URL
      if (audioUrl) {
        // Loại bỏ BOM từ URL string
        audioUrl = audioUrl.replace(/%EF%BB%BF/gi, "");
        
        // Nếu là Google TTS URL, convert sang proxy URL
        if (audioUrl.includes("translate.google.com/translate_tts")) {
          try {
            const url = new URL(audioUrl);
            const q = url.searchParams.get("q");
            const lang = url.searchParams.get("tl") || "zh-CN";
            if (q) {
              const decodedQ = decodeURIComponent(q);
              const cleanedQ = decodedQ.replace(/^\uFEFF/, "").trim();
              if (cleanedQ) {
                audioUrl = getProxyAudioUrl(cleanedQ, lang);
              } else {
                audioUrl = getProxyAudioUrl(cleanAudioText);
              }
            } else {
              audioUrl = getProxyAudioUrl(cleanAudioText);
            }
          } catch (e) {
            console.warn("Không thể parse Google TTS URL, dùng text trực tiếp:", e);
            audioUrl = getProxyAudioUrl(cleanAudioText);
          }
        }
      } else {
        // Nếu không có audioUrl, generate từ text (luôn dùng proxy URL)
        audioUrl = getProxyAudioUrl(cleanAudioText);
      }
      
      // Kiểm tra audioUrl trước khi tạo Audio object
      if (!audioUrl || audioUrl.trim() === '') {
        console.warn("AudioUrl không hợp lệ:", audioUrl);
        setIsPlaying(false);
        return;
      }
      
      const audio = new Audio(audioUrl);
      
      // Thêm error handler trước khi play
      audio.onerror = (e) => {
        console.error("Lỗi khi load audio:", e, "URL:", audioUrl);
        setIsPlaying(false);
      };
      
      audio.onended = () => setIsPlaying(false);
      
      await audio.play();
    } catch (error) {
      console.error("Lỗi phát audio:", error);
      setIsPlaying(false);
    }
  };

  const getStatusButton = () => {
    if (!word.progress) {
      return (
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
          <span className="text-gray-700">Chưa học</span>
        </button>
      );
    }

    switch (word.progress.status) {
      case "Mastered":
        return (
          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-600"></div>
            <span>Đã thuộc</span>
          </button>
        );
      case "Learning":
        return (
          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-yellow-600"></div>
            <span>Đang học</span>
          </button>
        );
      default:
        return (
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
            <span className="text-gray-700">Chưa học</span>
          </button>
        );
    }
  };

  // Tách exampleSentence thành nhiều ví dụ
  // Format có thể là:
  // - "chữ Hán (pinyin) - nghĩa" (format từ seed data)
  // - "pinyin | chữ Hán | nghĩa" (format khác)
  // - "chữ Hán | nghĩa"
  // - Nhiều ví dụ phân cách bởi ; hoặc \n
  const getExamples = () => {
    if (!word.exampleSentence) {
      // Nếu không có exampleSentence, tạo 1 ví dụ mẫu
      return [{
        pinyin: word.pinyin,
        character: word.character,
        meaning: word.meaning,
      }];
    }
    
    // Tách theo dấu ; hoặc \n để lấy nhiều ví dụ
    const exampleStrings = word.exampleSentence.split(/[;\n]/).map(e => e.trim()).filter(e => e);
    
    const examples = exampleStrings.map(example => {
      // Format 1: "chữ Hán (pinyin) - nghĩa"
      // Ví dụ: "爱 (ài) - yêu, tình yêu"
      const format1Regex = /^([\u4e00-\u9fa5\s]+)\s*\(([^)]+)\)\s*-\s*(.+)$/;
      const match1 = example.match(format1Regex);
      if (match1) {
        return {
          character: match1[1].trim(),
          pinyin: match1[2].trim(),
          meaning: match1[3].trim(),
        };
      }
      
      // Format 2: "pinyin | chữ Hán | nghĩa"
      const parts = example.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        return {
          pinyin: parts[0],
          character: parts[1],
          meaning: parts[2],
        };
      }
      
      // Format 3: "chữ Hán | nghĩa"
      if (parts.length === 2) {
        const hasChineseChar = /[\u4e00-\u9fa5]/.test(parts[0]);
        if (hasChineseChar) {
          return {
            pinyin: word.pinyin,
            character: parts[0],
            meaning: parts[1],
          };
        } else {
          return {
            pinyin: parts[0],
            character: parts[1],
            meaning: word.meaning,
          };
        }
      }
      
      // Format 4: Chỉ có chữ Hán hoặc câu hoàn chỉnh
      const text = parts[0];
      const hasChineseChar = /[\u4e00-\u9fa5]/.test(text);
      
      if (hasChineseChar) {
        // Nếu có chữ Hán, kiểm tra xem có pinyin trong ngoặc không
        const pinyinMatch = text.match(/\(([^)]+)\)/);
        if (pinyinMatch) {
          const character = text.replace(/\s*\([^)]+\)\s*/, '').trim();
          return {
            pinyin: pinyinMatch[1].trim(),
            character: character,
            meaning: word.meaning,
          };
        }
        return {
          pinyin: word.pinyin,
          character: text,
          meaning: word.meaning,
        };
      }
      
      // Nếu không có chữ Hán, có thể là pinyin
      return {
        pinyin: text,
        character: word.character,
        meaning: word.meaning,
      };
    });

    // Nếu không parse được ví dụ nào, trả về ví dụ mặc định
    if (examples.length === 0) {
      return [{
        pinyin: word.pinyin,
        character: word.character,
        meaning: word.meaning,
      }];
    }

    return examples;
  };

  // Ưu tiên sử dụng word.examples nếu có (từ API)
  const getExamplesFromWord = () => {
    if (word.examples && word.examples.length > 0) {
      return word.examples.map(ex => ({
        character: ex.character,
        pinyin: ex.pinyin,
        meaning: ex.meaning,
      }));
    }
    return getExamples();
  };

  const examples = getExamplesFromWord();

  const handleNavigateToWriting = () => {
    if (!word?.id) {
      console.warn("Thiếu ID từ vựng, không thể mở trang luyện viết");
      return;
    }

    router.push(`/vocabulary/write/${word.id}`);
  };

  // Highlight từ khóa trong text (case-insensitive và highlight toàn bộ từ)
  const highlightKeyword = (text: string, keyword: string) => {
    if (!text || !keyword) return <span>{text}</span>;
    
    // Tạo regex để tìm keyword (case-insensitive)
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === keyword.toLowerCase()) {
            return (
              <span key={index} className="text-red-500 font-semibold">
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
      {/* Left Panel - Word Detail */}
      <div className="bg-white rounded-lg shadow-sm p-8 relative min-h-0 flex flex-col">
        {/* Favorite Icon - Top Right */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <svg
            className={`w-6 h-6 ${isFavorite ? "text-red-500 fill-current" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Character - Large */}
        <h2 className="text-8xl font-bold text-gray-900 mb-6">{word.character}</h2>

        {/* Pinyin with Audio Icon */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => playAudio()}
            disabled={isPlaying}
            className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {isPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </button>
          <span className="text-gray-700 text-xl font-medium">{word.pinyin}</span>
        </div>

        {/* Meaning - Multiple meanings separated by commas */}
        <div className="mb-8">
          <p className="text-gray-800 text-lg leading-relaxed">
            {word.meaning.split(',').map((meaning, idx, arr) => (
              <span key={idx}>
                {meaning.trim()}
                {idx < arr.length - 1 && <span className="text-gray-400">, </span>}
              </span>
            ))}
          </p>
        </div>

        {/* Action Buttons - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            onClick={() => playAudio()}
            className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span>Nghe</span>
          </button>

          <button
            onClick={handleNavigateToWriting}
            className="px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Luyện viết</span>
          </button>

          <button className="px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Chi tiết</span>
          </button>

          {getStatusButton()}
        </div>
      </div>

      {/* Right Panel - Examples */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-sm p-6 text-white flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">
            {examples.length} VÍ DỤ
          </h3>
          <button
            onClick={() => setIsExamplesCollapsed(!isExamplesCollapsed)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 text-sm"
          >
            <span>Thu gọn</span>
            <svg
              className={`w-4 h-4 transition-transform ${isExamplesCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>

        {/* Examples List */}
        {!isExamplesCollapsed && (
          <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {examples.length > 0 ? (
              examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-5 hover:bg-white/10 transition-colors"
                >
                  {/* Audio Icon - Top Right of each example */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {/* Chinese Characters with highlight - Larger, on top */}
                      <div className="text-white text-xl mb-2 font-medium leading-relaxed">
                        {highlightKeyword(example.character, word.character)}
                      </div>
                    </div>
                    <button
                      onClick={() => playAudio(example.character)}
                      disabled={isPlaying}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 ml-3 flex-shrink-0"
                      title="Nghe phát âm cả câu"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* Pinyin with highlight */}
                  <div className="text-slate-300 text-sm mb-2">
                    {highlightKeyword(example.pinyin, word.pinyin)}
                  </div>

                  {/* Vietnamese Translation */}
                  <div className="text-slate-200 text-sm leading-relaxed">
                    {example.meaning}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>Chưa có ví dụ cho từ này</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

