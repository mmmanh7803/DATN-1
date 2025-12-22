"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import HanziWriter from "hanzi-writer";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { WordWithProgressDto } from "@/types";

export default function VocabularyWritingPage() {
  const params = useParams();
  const router = useRouter();
  const wordId = Number(params.id);

  const [word, setWord] = useState<WordWithProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showHintAfterMistake, setShowHintAfterMistake] = useState(1);
  const [repeatMode, setRepeatMode] = useState(false);
  const [hideStroke, setHideStroke] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [isWriterReady, setIsWriterReady] = useState(false);

  const writerRef = useRef<HanziWriter | null>(null);
  const practiceContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewWriterRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (!wordId || Number.isNaN(wordId)) {
      setError("Không tìm thấy từ vựng để luyện viết");
      setLoading(false);
      return;
    }

    const loadWord = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vocabularyService.getWordById(wordId);
        setWord(data);
        setCorrectCount(0);
        setWrongCount(0);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không tải được từ vựng");
      } finally {
        setLoading(false);
      }
    };

    loadWord();
  }, [wordId]);

  useEffect(() => {
    setIsWriterReady(false);

    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
      } catch {
        // ignore
      }
      writerRef.current = null;
    }

    if (previewWriterRef.current) {
      previewWriterRef.current = null;
    }

    if (word?.character && word.character.length === 1 && practiceContainerRef.current) {
      writerRef.current = HanziWriter.create(practiceContainerRef.current, word.character, {
        width: 256,
        height: 256,
        padding: 10,
        strokeColor: "#000000",
        drawingColor: "#000000",
        drawingWidth: 4,
        strokeWidth: 2,
        showOutline: true,
        showCharacter: true,
      });

      setTimeout(() => {
        setIsWriterReady(true);
      }, 800);
    }

    if (word?.character && word.character.length === 1 && previewContainerRef.current) {
      previewWriterRef.current = HanziWriter.create(previewContainerRef.current, word.character, {
        width: 64,
        height: 64,
        padding: 5,
        strokeColor: "#000000",
        strokeWidth: 1,
        showOutline: true,
        showCharacter: true,
      });
    }

    return () => {
      setIsWriterReady(false);
      setIsQuizMode(false);
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {
          // ignore
        }
        writerRef.current = null;
      }
      if (previewWriterRef.current) {
        previewWriterRef.current = null;
      }
    };
  }, [word?.character]);

  useEffect(() => {
    if (!isWriterReady || !word || word.character.length !== 1 || !writerRef.current || isQuizMode) {
      return;
    }

    if (hideStroke) {
      writerRef.current.hideCharacter();
      writerRef.current.hideOutline();
    } else {
      writerRef.current.showCharacter();
      writerRef.current.showOutline();
    }
  }, [hideStroke, isWriterReady, isQuizMode, word?.character]);

  const animateCharacter = () => {
    writerRef.current?.animateCharacter();
  };

  const startPractice = () => {
    if (!writerRef.current || !word || word.character.length !== 1) return;

    writerRef.current.hideCharacter();

    setTimeout(() => {
      if (!writerRef.current) return;

      writerRef.current.quiz({
        onComplete: () => {
          setCorrectCount((prev) => prev + 1);
          setIsQuizMode(false);

          if (repeatMode) {
            setTimeout(() => {
              if (!writerRef.current) return;
              writerRef.current.hideCharacter();
              setTimeout(() => {
                if (!writerRef.current) return;
                writerRef.current.quiz({
                  onComplete: () => {
                    setCorrectCount((prev) => prev + 1);
                    setIsQuizMode(false);
                  },
                  onMistake: () => setWrongCount((prev) => prev + 1),
                  showHintAfterMisses: showHintAfterMistake,
                  highlightOnComplete: true,
                });
                setIsQuizMode(true);
              }, 200);
            }, 800);
          }
        },
        onMistake: () => setWrongCount((prev) => prev + 1),
        showHintAfterMisses: showHintAfterMistake,
        highlightOnComplete: true,
      });

      setIsQuizMode(true);
    }, 200);
  };

  const resetPractice = () => {
    if (!writerRef.current) return;

    if (isQuizMode) {
      writerRef.current.cancelQuiz();
      setIsQuizMode(false);
    }
    writerRef.current.hideCharacter();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-gray-600">Đang tải dữ liệu...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-gray-700">{error || "Không tìm thấy từ vựng"}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Luyện viết</p>
              <h1 className="text-3xl font-bold text-gray-900">{word.character}</h1>
              <p className="text-gray-700">{word.pinyin}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Quay lại
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin từ</h3>
              <p className="text-5xl font-bold text-gray-900 mb-3">{word.character}</p>
              <p className="text-lg text-blue-600 font-medium mb-2">{word.pinyin}</p>
              <p className="text-gray-800 mb-3">{word.meaning}</p>
              {word.strokeCount && (
                <p className="text-sm text-gray-500">Số nét: {word.strokeCount}</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Hiện gợi ý sau số lần sai</p>
                  <select
                    value={showHintAfterMistake}
                    onChange={(e) => setShowHintAfterMistake(Number(e.target.value))}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
                <div className="flex items-center justify-between md:justify-start md:gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Lặp lại sau khi đúng</p>
                    <p className="text-xs text-gray-500">Tự động bắt đầu lượt mới</p>
                  </div>
                  <button
                    onClick={() => setRepeatMode(!repeatMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      repeatMode ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        repeatMode ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between md:justify-start md:gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Ẩn nét gợi ý</p>
                    <p className="text-xs text-gray-500">Chỉ hiển thị lưới</p>
                  </div>
                  <button
                    onClick={() => setHideStroke(!hideStroke)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      hideStroke ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        hideStroke ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {word.character.length === 1 ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div
                      ref={previewContainerRef}
                      className="w-16 h-16 border-2 border-green-500 rounded"
                    ></div>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div
                      ref={practiceContainerRef}
                      className="w-64 h-64 border-2 border-gray-300 rounded bg-white relative"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(0deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px),
                          repeating-linear-gradient(90deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)
                        `,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-6">
                    <button
                      onClick={animateCharacter}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      disabled={!isWriterReady}
                    >
                      Xem mẫu
                    </button>
                    <button
                      onClick={isQuizMode ? resetPractice : startPractice}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                      disabled={!isWriterReady}
                    >
                      {isQuizMode ? "Dừng" : "Bắt đầu viết"}
                    </button>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="grid grid-cols-3 text-center gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Đúng</p>
                        <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Sai</p>
                        <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tổng</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {correctCount + wrongCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-600">
                  Hiện chỉ hỗ trợ luyện viết cho một ký tự.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
