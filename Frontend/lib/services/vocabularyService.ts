import apiClient from "../api";
import { API_ENDPOINTS } from "../api-endpoints";
import {
  VocabularyTopicDto,
  VocabularyTopicDetailDto,
  FlashcardReviewDto,
  ReviewStatsDto,
  UpdateReviewStatusRequest,
  UserWordProgress,
  WordWithProgressDto,
  PartProgressDto,
  QuestionDto,
} from "../../types";

export const vocabularyService = {
  /**
   * Lấy danh sách tất cả chủ đề từ vựng
   */
  async getAllTopics(): Promise<VocabularyTopicDto[]> {
    const response = await apiClient.get<VocabularyTopicDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.BASE
    );
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết chủ đề từ vựng
   */
  async getTopicById(id: number): Promise<VocabularyTopicDetailDto> {
    const response = await apiClient.get<VocabularyTopicDetailDto>(
      API_ENDPOINTS.VOCABULARY_TOPICS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Lấy danh sách từ vựng để ôn tập (flashcard)
   */
  async getReviewWords(
    topicId: number,
    onlyDue: boolean = true,
    limit?: number
  ): Promise<FlashcardReviewDto[]> {
    const response = await apiClient.get<FlashcardReviewDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.REVIEW_WORDS(topicId, onlyDue, limit)
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái ôn tập từ vựng (SRS)
   */
  async updateReviewStatus(
    request: UpdateReviewStatusRequest
  ): Promise<UserWordProgress> {
    const response = await apiClient.post<UserWordProgress>(
      API_ENDPOINTS.VOCABULARY_TOPICS.UPDATE_REVIEW,
      request
    );
    return response.data;
  },

  /**
   * Lấy thống kê học tập của chủ đề
   */
  async getTopicStats(topicId: number): Promise<ReviewStatsDto> {
    const response = await apiClient.get<ReviewStatsDto>(
      API_ENDPOINTS.VOCABULARY_TOPICS.STATS(topicId)
    );
    return response.data;
  },

  /**
   * Lấy thống kê tổng quan học tập
   */
  async getOverallStats(): Promise<ReviewStatsDto> {
    const response = await apiClient.get<ReviewStatsDto>(
      API_ENDPOINTS.VOCABULARY_TOPICS.OVERALL_STATS
    );
    return response.data;
  },

  /**
   * Lấy danh sách từ cần ôn tập hôm nay
   */
  async getWordsDueForReview(
    topicId?: number,
    limit?: number
  ): Promise<FlashcardReviewDto[]> {
    const response = await apiClient.get<FlashcardReviewDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.REVIEW_DUE(topicId, limit)
    );
    return response.data;
  },

  /**
   * Lấy từ vựng theo HSK level và phần
   */
  async getWordsByHSKLevelAndPart(
    hskLevel: number,
    partNumber: number
  ): Promise<WordWithProgressDto[]> {
    const response = await apiClient.get<WordWithProgressDto[]>(
      API_ENDPOINTS.COURSES.WORDS_BY_HSK_AND_PART(hskLevel, partNumber)
    );
    return response.data;
  },

  /**
   * Lấy từ vựng theo ID
   */
  async getWordById(id: number): Promise<WordWithProgressDto> {
    const response = await apiClient.get<WordWithProgressDto>(
      `/api/vocabularytopics/words/${id}`
    );
    return response.data;
  },

  /**
   * Lấy hoặc tạo từ vựng theo ký tự (với retry logic)
   */
  async getOrCreateWordByCharacter(character: string, maxRetries = 3): Promise<WordWithProgressDto> {
    let lastError: any = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[VocabularyService] Attempt ${attempt + 1}/${maxRetries} for "${character}"`);
        
        const response = await apiClient.post<WordWithProgressDto>(
          `/api/vocabularytopics/words/get-or-create`,
          { character }
        );
        
        console.log(`[VocabularyService] ✅ Success on attempt ${attempt + 1}`);
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.error(`[VocabularyService] ❌ Attempt ${attempt + 1} failed:`, error.message);
        
        // Nếu là lỗi client (4xx), không retry
        if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
          console.error(`[VocabularyService] Client error (${error.response.status}), not retrying`);
          throw error;
        }
        
        // Nếu còn lần retry, đợi exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
          console.log(`[VocabularyService] ⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Hết retry, throw error cuối cùng
    console.error(`[VocabularyService] ❌ All ${maxRetries} attempts failed for "${character}"`);
    throw lastError || new Error(`Failed to get/create word after ${maxRetries} attempts`);
  },

  /**
   * Lấy hoặc tạo nhiều từ vựng theo danh sách ký tự
   */
  async getOrCreateWordsBatch(characters: string[]): Promise<Record<string, WordWithProgressDto>> {
    const response = await apiClient.post<Record<string, WordWithProgressDto>>(
      `/api/vocabularytopics/words/get-or-create-batch`,
      { characters }
    );
    return response.data;
  },

  /**
   * Đánh dấu từ vựng là đã học
   */
  async markAsLearned(wordId: number): Promise<UserWordProgress> {
    const response = await apiClient.post<UserWordProgress>(
      API_ENDPOINTS.VOCABULARY_TOPICS.UPDATE_REVIEW,
      {
        WordId: wordId,
        Rating: "Mastered",
      }
    );
    return response.data;
  },

  /**
   * Lấy danh sách câu hỏi kiểm tra từ vựng bằng hình ảnh
   */
  async getImageQuizQuestions(topicId: number, count?: number): Promise<QuestionDto[]> {
    const response = await apiClient.get<QuestionDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.IMAGE_QUIZ(topicId, count)
    );
    return response.data;
  },
};

