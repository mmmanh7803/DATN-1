import api from '../api';
import { API_ENDPOINTS } from '../api-endpoints';

export interface UserProfile {
  user: {
    id: string;
    email: string;
    userName: string;
    roles: string[];
  };
  statistics: {
    vocabulary: {
      total: number;
      mastered: number;
      learning: number;
      new: number;
    };
    exams: {
      total: number;
      passed: number;
      failed: number;
      averageScore: number;
    };
    topics: {
      completed: number;
    };
    recentExam: {
      examTitle: string;
      score: number;
      completedAt: string;
    } | null;
  };
}

export interface LearnedWord {
  wordId: number;
  character: string;
  pinyin: string;
  meaning: string;
  hskLevel: number;
  status: string;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string | null;
  nextReviewDate: string;
  isMastered: boolean;
}

export interface LearnedWordsResponse {
  words: LearnedWord[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export const userService = {
  // Lấy thông tin profile và thống kê
  async getProfile(): Promise<UserProfile> {
    const response = await api.get(API_ENDPOINTS.USER.PROFILE);
    return response.data.data;
  },

  // Lấy danh sách từ vựng đã học
  async getLearnedWords(
    hskLevel?: number,
    reviewLevel?: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<LearnedWordsResponse> {
    const response = await api.get(
      API_ENDPOINTS.USER.LEARNED_WORDS(hskLevel, reviewLevel, page, pageSize)
    );
    return response.data.data;
  },
};

