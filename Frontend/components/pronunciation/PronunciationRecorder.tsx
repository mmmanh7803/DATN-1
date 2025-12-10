"use client";

import { useState, useRef, useEffect } from "react";
import AudioButton from "@/components/words/AudioButton";
import { useToast } from "@/contexts/ToastContext";

interface PronunciationRecorderProps {
  word: {
    id: number;
    character: string;
    pinyin: string;
    meaning: string;
  };
  onComplete: (score: number) => void;
  onSkip: () => void;
}

export default function PronunciationRecorder({
  word,
  onComplete,
  onSkip,
}: PronunciationRecorderProps) {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzePronunciation = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    // Simulate pronunciation analysis (in real app, this would call an API)
    // For now, we'll generate a random score for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100
    setScore(mockScore);
    
    let mockFeedback = "";
    if (mockScore >= 90) {
      mockFeedback = "Xuất sắc! Phát âm của bạn rất chuẩn.";
    } else if (mockScore >= 80) {
      mockFeedback = "Tốt! Phát âm khá chính xác, tiếp tục cố gắng.";
    } else if (mockScore >= 70) {
      mockFeedback = "Khá ổn! Hãy chú ý đến thanh điệu nhiều hơn.";
    } else {
      mockFeedback = "Cần cải thiện! Hãy nghe và thực hành thêm.";
    }
    
    setFeedback(mockFeedback);
    setIsAnalyzing(false);
    setShowResult(true);
  };

  const handleRetry = () => {
    // Reset states
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setScore(null);
    setFeedback("");
    setShowResult(false);
  };

  const handleNext = () => {
    if (score !== null) {
      onComplete(score);
    }
    handleRetry();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      {/* Word Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-gray-900 mb-4">
          {word.character}
        </div>
        <div className="text-2xl text-primary mb-2">{word.pinyin}</div>
        <div className="text-lg text-gray-600">{word.meaning}</div>
        
        {/* Listen to correct pronunciation */}
        <div className="mt-6">
          <AudioButton 
            text={word.character} 
            lang="zh-CN"
            className="mx-auto px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors flex items-center gap-2"
          />
        </div>
      </div>

      {/* Recording Controls */}
      {!showResult && (
        <div className="space-y-6">
          {!audioBlob ? (
            <div className="text-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-primary hover:bg-primary-dark"
                }`}
              >
                {isRecording ? (
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </button>
              <p className="mt-4 text-gray-600">
                {isRecording ? "Đang ghi âm... Nhấn để dừng" : "Nhấn để bắt đầu ghi âm"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Audio Playback */}
              {audioUrl && (
                <div className="flex items-center justify-center gap-4">
                  <audio controls src={audioUrl} className="w-full max-w-md" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  disabled={isAnalyzing}
                >
                  Ghi lại
                </button>
                <button
                  onClick={analyzePronunciation}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Đang phân tích...
                    </span>
                  ) : (
                    "Kiểm tra phát âm"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Display */}
      {showResult && score !== null && (
        <div className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-4 ${
              score >= 90 ? "text-green-500" :
              score >= 80 ? "text-blue-500" :
              score >= 70 ? "text-yellow-500" :
              "text-orange-500"
            }`}>
              {score}
            </div>
            <div className="text-xl text-gray-700 mb-2">Điểm của bạn</div>
            <div className="text-gray-600">{feedback}</div>
          </div>

          {/* Score Visualization */}
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-1000 ${
                score >= 90 ? "bg-green-500" :
                score >= 80 ? "bg-blue-500" :
                score >= 70 ? "bg-yellow-500" :
                "bg-orange-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Từ tiếp theo
            </button>
          </div>
        </div>
      )}

      {/* Skip Button */}
      <div className="text-center mt-8">
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 underline"
          disabled={isAnalyzing}
        >
          Bỏ qua
        </button>
      </div>
    </div>
  );
}

