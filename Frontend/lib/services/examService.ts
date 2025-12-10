import apiClient from "../api";
import { API_ENDPOINTS } from "../api-endpoints";

// Types
export interface ExamPaper {
  id: number;
  title: string;
  examType: string;
  level: number | null;
  description: string | null;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  createdAt: string;
  questionCount?: number;
}

export interface ExamQuestion {
  id: number;
  questionOrder: number;
  questionText: string;
  questionType: string;
  skillType?: string;
  partNumber?: number;
  instruction?: string;
  audioUrl?: string;
  imageUrl?: string;
  blankSentence?: string;
  explanation?: string;
  points: number;
  options: ExamQuestionOption[];
}

export interface ExamQuestionOption {
  id: number;
  optionLabel: string;
  optionText: string;
  imageUrl?: string;
  isCorrect?: boolean;
}

export interface ExamSection {
  sectionName: string;
  skillType: string;
  parts: ExamPart[];
}

export interface ExamPart {
  partName: string;
  partNumber: number;
  questions: ExamQuestion[];
}

// API trả về cấu trúc phẳng, không lồng trong { exam: ... }
export interface ExamDetail {
  id: number;
  title: string;
  examType: string;
  level: number | null;
  description: string | null;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  createdAt?: string;
  questions: ExamQuestion[];
  // Backwards compatibility
  exam?: ExamPaper;
  sections?: ExamSection[];
}

export interface ExamStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  examsByLevel: Record<number, number>;
}

export interface ExamSubmitRequest {
  answers: {
    questionId: number;
    selectedOption: string;
  }[];
  timeSpentSeconds: number;
}

export interface ExamResult {
  progressId: number;
  examId: number;
  examTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  isPassed: boolean;
  timeSpent: string;
  timeSpentSeconds: number;
  listeningCorrect: number;
  listeningTotal: number;
  listeningScore: number;
  readingCorrect: number;
  readingTotal: number;
  readingScore: number;
  completedAt: string;
  details: AnswerDetail[];
}

export interface AnswerDetail {
  questionId: number;
  questionOrder: number;
  questionText: string;
  questionType?: string;
  skillType?: string;
  partNumber: number;
  imageUrl?: string;
  audioUrl?: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation?: string;
  options: OptionDetail[];
}

export interface OptionDetail {
  id: number;
  label: string;
  text?: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface ExamHistoryItem {
  progressId: number;
  examId: number;
  examTitle: string;
  examType: string;
  level: number | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  isPassed: boolean;
  passingScore: number;
  timeSpentSeconds: number | null;
  completedAt: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Service
export const examService = {
  /**
   * Lấy tất cả đề thi
   */
  async getAllExams(): Promise<ExamPaper[]> {
    try {
      const response = await apiClient.get<ApiResponse<ExamPaper[]>>(
        API_ENDPOINTS.EXAM_PAPERS.BASE
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all exams:", error);
      return [];
    }
  },

  /**
   * Lấy đề thi theo loại (HSK hoặc THPT)
   */
  async getExamsByType(examType: string): Promise<ExamPaper[]> {
    try {
      const response = await apiClient.get<ApiResponse<ExamPaper[]>>(
        API_ENDPOINTS.EXAM_PAPERS.BY_TYPE(examType)
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching exams by type ${examType}:`, error);
      return [];
    }
  },

  /**
   * Lấy đề thi HSK theo cấp độ
   */
  async getHSKExamsByLevel(level: number): Promise<ExamPaper[]> {
    try {
      const response = await apiClient.get<ApiResponse<ExamPaper[]>>(
        API_ENDPOINTS.EXAM_PAPERS.HSK_BY_LEVEL(level)
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching HSK level ${level} exams:`, error);
      return [];
    }
  },

  /**
   * Lấy đề thi theo cấp độ (alias cho getHSKExamsByLevel)
   */
  async getExamsByLevel(level: number): Promise<ExamPaper[]> {
    return this.getHSKExamsByLevel(level);
  },

  /**
   * Lấy chi tiết đề thi (bao gồm câu hỏi)
   */
  async getExamById(id: number): Promise<ExamDetail | null> {
    try {
      const response = await apiClient.get<ApiResponse<ExamDetail>>(
        API_ENDPOINTS.EXAM_PAPERS.BY_ID(id)
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching exam ${id}:`, error);
      return null;
    }
  },

  /**
   * Nộp bài thi
   */
  async submitExam(examId: number, data: ExamSubmitRequest): Promise<ExamResult | null> {
    try {
      const response = await apiClient.post<ApiResponse<ExamResult>>(
        API_ENDPOINTS.EXAM_PAPERS.SUBMIT(examId),
        data
      );
      
      // Lưu progressId vào localStorage để có thể lấy lại kết quả
      if (response.data.data?.progressId) {
        localStorage.setItem(`exam_${examId}_progressId`, response.data.data.progressId.toString());
      }
      
      return response.data.data || null;
    } catch (error) {
      console.error(`Error submitting exam ${examId}:`, error);
      return null;
    }
  },

  /**
   * Lấy kết quả thi theo progressId
   */
  async getExamResult(progressId: number): Promise<ExamResult | null> {
    try {
      const response = await apiClient.get<ApiResponse<ExamResult>>(
        API_ENDPOINTS.EXAM_PAPERS.RESULT(progressId)
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching exam result ${progressId}:`, error);
      return null;
    }
  },

  /**
   * Lấy kết quả thi mới nhất theo examId
   */
  async getLatestExamResult(examId: number): Promise<ExamResult | null> {
    try {
      const response = await apiClient.get<ApiResponse<ExamResult>>(
        API_ENDPOINTS.EXAM_PAPERS.LATEST_RESULT(examId)
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching latest exam result ${examId}:`, error);
      return null;
    }
  },

  /**
   * Lấy lịch sử thi
   */
  async getExamHistory(examId?: number, limit?: number): Promise<ExamHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ExamHistoryItem[]>>(
        API_ENDPOINTS.EXAM_PAPERS.HISTORY(examId, limit)
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching exam history:", error);
      return [];
    }
  },

  /**
   * Lấy thống kê đề thi của user
   */
  async getExamStats(): Promise<ExamStats> {
    // TODO: Implement when backend has this endpoint
    return {
      totalExams: 0,
      completedExams: 0,
      averageScore: 0,
      examsByLevel: {},
    };
  },

  /**
   * Nhóm đề thi theo cấp độ HSK
   */
  groupExamsByLevel(exams: ExamPaper[]): Record<number, ExamPaper[]> {
    return exams.reduce((acc, exam) => {
      const level = exam.level || 0;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(exam);
      return acc;
    }, {} as Record<number, ExamPaper[]>);
  },

  /**
   * Đếm số đề thi theo cấp độ
   */
  countExamsByLevel(exams: ExamPaper[]): Record<number, number> {
    return exams.reduce((acc, exam) => {
      const level = exam.level || 0;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  },
};

export default examService;

