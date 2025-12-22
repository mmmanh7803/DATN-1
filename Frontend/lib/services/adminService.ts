import apiClient from "../api";
import { API_ENDPOINTS } from "../api-endpoints";
import { WordDto, CourseListDto, LessonListDto, QuestionDto, User } from "@/types";

export interface AdminStats {
  courseCategories: number;
  courses: number;
  lessons: number;
  words: number;
  questions: number;
  questionOptions: number;
  vocabularyTopics: number;
}

export interface SeedDataResponse {
  message: string;
  stats?: AdminStats;
}

// Admin Word DTO
export interface AdminWordDto extends WordDto {
  id: number;
  hskLevel?: number;
  createdAt: string;
  lessonId?: number;
  topicId?: number;
}

// Admin Course DTO
export interface AdminCourseDto extends CourseListDto {
  title: string;
  description?: string;
  imageUrl?: string;
  hskLevel?: number;
  level?: string;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  lessonCount?: number;
  wordCount?: number;
}

// Admin Lesson DTO
export interface AdminLessonDto extends LessonListDto {
  content?: string;
  prerequisiteLessonId?: number;
  isActive: boolean;
  createdAt: string;
  wordCount?: number;
  questionCount?: number;
}

// Admin Question DTO
export interface AdminQuestionDto extends QuestionDto {
  id: number;
  lessonId?: number;
  exerciseId?: number;
  readingPassageId?: number;
  dialogueId?: number;
  sentencePatternId?: number;
  questionType: string;
  points: number;
  difficultyLevel: number;
  explanation?: string;
  createdAt: string;
  optionCount?: number;
}

// Admin User DTO
export interface AdminUserDto extends User {
  email: string;
  userName?: string;
  roles?: string[];
  emailConfirmed?: boolean;
  lockoutEnd?: string | null;
  lockoutEnabled?: boolean;
  accessFailedCount?: number;
  createdAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
}

// Create/Update DTOs
export interface CreateWordDto {
  character: string;
  pinyin: string;
  meaning: string;
  hskLevel?: number;
  lessonId?: number;
  topicId?: number;
  audioUrl?: string;
  exampleSentence?: string;
  frequency?: number;
  strokeCount?: number;
}

export interface UpdateWordDto extends Partial<CreateWordDto> {}

export interface CreateCourseDto {
  categoryId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  level?: string;
  hskLevel?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface CreateLessonDto {
  courseId: number;
  title: string;
  description?: string;
  lessonIndex: number;
  content?: string;
  isLocked?: boolean;
  prerequisiteLessonId?: number;
  isActive?: boolean;
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {}

export interface CreateQuestionDto {
  lessonId?: number;
  exerciseId?: number;
  readingPassageId?: number;
  dialogueId?: number;
  sentencePatternId?: number;
  questionText: string;
  questionType: string;
  audioUrl?: string;
  points?: number;
  difficultyLevel?: number;
  explanation?: string;
  options?: CreateQuestionOptionDto[];
}

export interface CreateQuestionOptionDto {
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {}

export const adminService = {
  /**
   * Lấy thống kê dữ liệu hiện tại
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
    return response.data;
  },

  /**
   * Seed dữ liệu từ file JSON
   */
  async seedData(
    fileName: string = "seed-data-hsk1.json",
    clearExisting: boolean = false
  ): Promise<SeedDataResponse> {
    const response = await apiClient.post<SeedDataResponse>(
      API_ENDPOINTS.ADMIN.SEED(fileName, clearExisting)
    );
    return response.data;
  },

  /**
   * Xóa tất cả dữ liệu seed
   */
  async clearData(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.ADMIN.CLEAR_DATA
    );
    return response.data;
  },

  /**
   * Seed Vocabulary Topic cho HSK1
   */
  async seedVocabularyTopicHsk1(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.ADMIN.SEED_VOCABULARY_TOPIC_HSK1
    );
    return response.data;
  },

  // ============ WORDS MANAGEMENT ============

  /**
   * Lấy danh sách từ vựng (Admin)
   */
  async getWords(hskLevel?: number, search?: string): Promise<AdminWordDto[]> {
    try {
      const response = await apiClient.get<AdminWordDto[]>(
        API_ENDPOINTS.ADMIN.WORDS.LIST(hskLevel, search)
      );
      return response.data;
    } catch (error: any) {
      // Nếu API chưa tồn tại, trả về empty array
      if (error.response?.status === 404 || error.response?.status === 501) {
        console.warn("Admin words API chưa được implement, trả về empty array");
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy chi tiết từ vựng (Admin)
   */
  async getWordById(id: number): Promise<AdminWordDto> {
    const response = await apiClient.get<AdminWordDto>(
      API_ENDPOINTS.ADMIN.WORDS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Tạo từ vựng mới
   */
  async createWord(data: CreateWordDto): Promise<AdminWordDto> {
    const response = await apiClient.post<AdminWordDto>(
      API_ENDPOINTS.ADMIN.WORDS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Cập nhật từ vựng
   */
  async updateWord(id: number, data: UpdateWordDto): Promise<AdminWordDto> {
    const response = await apiClient.put<AdminWordDto>(
      API_ENDPOINTS.ADMIN.WORDS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Xóa từ vựng
   */
  async deleteWord(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.WORDS.DELETE(id));
  },

  // ============ COURSES MANAGEMENT ============

  /**
   * Lấy danh sách khóa học (Admin)
   */
  async getCourses(): Promise<AdminCourseDto[]> {
    try {
      const response = await apiClient.get<AdminCourseDto[]>(
        API_ENDPOINTS.ADMIN.COURSES.LIST
      );
      return response.data;
    } catch (error: any) {
      // Fallback to regular courses API
      if (error.response?.status === 404 || error.response?.status === 501) {
        const response = await apiClient.get<CourseListDto[]>(
          API_ENDPOINTS.COURSES.BASE
        );
        return response.data.map((course) => ({
          ...course,
          categoryId: 0,
          isActive: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        }));
      }
      throw error;
    }
  },

  /**
   * Lấy chi tiết khóa học (Admin)
   */
  async getCourseById(id: number): Promise<AdminCourseDto> {
    try {
      const response = await apiClient.get<AdminCourseDto>(
        API_ENDPOINTS.ADMIN.COURSES.BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      // Fallback to regular course API
      if (error.response?.status === 404 || error.response?.status === 501) {
        const response = await apiClient.get<CourseListDto>(
          API_ENDPOINTS.COURSES.BY_ID(id)
        );
        return {
          ...response.data,
          categoryId: 0,
          isActive: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  /**
   * Tạo khóa học mới
   */
  async createCourse(data: CreateCourseDto): Promise<AdminCourseDto> {
    const response = await apiClient.post<AdminCourseDto>(
      API_ENDPOINTS.ADMIN.COURSES.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Cập nhật khóa học
   */
  async updateCourse(id: number, data: UpdateCourseDto): Promise<AdminCourseDto> {
    const response = await apiClient.put<AdminCourseDto>(
      API_ENDPOINTS.ADMIN.COURSES.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Xóa khóa học
   */
  async deleteCourse(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.COURSES.DELETE(id));
  },

  // ============ LESSONS MANAGEMENT ============

  /**
   * Lấy danh sách bài học (Admin)
   */
  async getLessons(courseId?: number): Promise<AdminLessonDto[]> {
    try {
      const response = await apiClient.get<AdminLessonDto[]>(
        API_ENDPOINTS.ADMIN.LESSONS.LIST(courseId)
      );
      return response.data;
    } catch (error: any) {
      // Fallback to regular lessons API
      if (error.response?.status === 404 || error.response?.status === 501) {
        if (courseId) {
          const response = await apiClient.get<LessonListDto[]>(
            API_ENDPOINTS.LESSONS.BY_COURSE(courseId)
          );
          return response.data.map((lesson) => ({
            ...lesson,
            isActive: true,
            createdAt: new Date().toISOString(),
          }));
        }
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy chi tiết bài học (Admin)
   */
  async getLessonById(id: number): Promise<AdminLessonDto> {
    try {
      const response = await apiClient.get<AdminLessonDto>(
        API_ENDPOINTS.ADMIN.LESSONS.BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      // Fallback to regular lesson API
      if (error.response?.status === 404 || error.response?.status === 501) {
        const response = await apiClient.get<LessonListDto>(
          API_ENDPOINTS.LESSONS.BY_ID(id)
        );
        return {
          ...response.data,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  /**
   * Tạo bài học mới
   */
  async createLesson(data: CreateLessonDto): Promise<AdminLessonDto> {
    const response = await apiClient.post<AdminLessonDto>(
      API_ENDPOINTS.ADMIN.LESSONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Cập nhật bài học
   */
  async updateLesson(id: number, data: UpdateLessonDto): Promise<AdminLessonDto> {
    const response = await apiClient.put<AdminLessonDto>(
      API_ENDPOINTS.ADMIN.LESSONS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Xóa bài học
   */
  async deleteLesson(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.LESSONS.DELETE(id));
  },

  // ============ QUESTIONS MANAGEMENT ============

  /**
   * Lấy danh sách câu hỏi (Admin)
   */
  async getQuestions(lessonId?: number, type?: string): Promise<AdminQuestionDto[]> {
    try {
      const response = await apiClient.get<AdminQuestionDto[]>(
        API_ENDPOINTS.ADMIN.QUESTIONS.LIST(lessonId, undefined, type)
      );
      return response.data;
    } catch (error: any) {
      // Fallback to regular questions API
      if (error.response?.status === 404 || error.response?.status === 501) {
        if (lessonId) {
          const response = await apiClient.get<QuestionDto[]>(
            API_ENDPOINTS.QUESTIONS.BY_LESSON(lessonId)
          );
          return response.data.map((question) => ({
            ...question,
            id: question.id || 0,
            questionType: question.questionType || "CHOOSE_MEANING",
            points: question.points || 1,
            difficultyLevel: 1,
            createdAt: new Date().toISOString(),
          }));
        }
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy chi tiết câu hỏi (Admin)
   */
  async getQuestionById(id: number): Promise<AdminQuestionDto> {
    const response = await apiClient.get<AdminQuestionDto>(
      API_ENDPOINTS.ADMIN.QUESTIONS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Tạo câu hỏi mới
   */
  async createQuestion(data: CreateQuestionDto): Promise<AdminQuestionDto> {
    const response = await apiClient.post<AdminQuestionDto>(
      API_ENDPOINTS.ADMIN.QUESTIONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Cập nhật câu hỏi
   */
  async updateQuestion(id: number, data: UpdateQuestionDto): Promise<AdminQuestionDto> {
    const response = await apiClient.put<AdminQuestionDto>(
      API_ENDPOINTS.ADMIN.QUESTIONS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Xóa câu hỏi
   */
  async deleteQuestion(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.QUESTIONS.DELETE(id));
  },

  // ============ USERS MANAGEMENT ============

  /**
   * Lấy danh sách người dùng (Admin)
   */
  async getUsers(search?: string): Promise<AdminUserDto[]> {
    try {
      const response = await apiClient.get<AdminUserDto[]>(
        API_ENDPOINTS.ADMIN.USERS.LIST(search)
      );
      return response.data;
    } catch (error: any) {
      // Nếu 401/403 thì không phải lỗi API chưa implement
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error("Bạn không có quyền truy cập chức năng này");
      }
      // API chưa tồn tại
      if (error.response?.status === 404 || error.response?.status === 501) {
        console.warn("Admin users API chưa được implement, trả về empty array");
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy chi tiết người dùng (Admin)
   */
  async getUserById(id: string): Promise<AdminUserDto> {
    const response = await apiClient.get<AdminUserDto>(
      API_ENDPOINTS.ADMIN.USERS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Cập nhật người dùng
   */
  async updateUser(id: string, data: Partial<AdminUserDto>): Promise<AdminUserDto> {
    const response = await apiClient.put<AdminUserDto>(
      API_ENDPOINTS.ADMIN.USERS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Cập nhật roles cho người dùng
   */
  async updateUserRoles(id: string, roles: string[]): Promise<{ message: string; userId: string; roles: string[] }> {
    const response = await apiClient.put<{ message: string; userId: string; roles: string[] }>(
      API_ENDPOINTS.ADMIN.USERS.UPDATE_ROLES(id),
      { roles }
    );
    return response.data;
  },

  /**
   * Gán role Admin cho user
   */
  async makeAdmin(id: string): Promise<{ message: string; userId: string; roles: string[] }> {
    const response = await apiClient.post<{ message: string; userId: string; roles: string[] }>(
      API_ENDPOINTS.ADMIN.USERS.MAKE_ADMIN(id)
    );
    return response.data;
  },

  /**
   * Gỡ role Admin khỏi user
   */
  async removeAdmin(id: string): Promise<{ message: string; userId: string; roles: string[] }> {
    const response = await apiClient.post<{ message: string; userId: string; roles: string[] }>(
      API_ENDPOINTS.ADMIN.USERS.REMOVE_ADMIN(id)
    );
    return response.data;
  },

  /**
   * Xóa người dùng
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(id));
  },

  /**
   * Lấy danh sách roles
   */
  async getRoles(): Promise<string[]> {
    const response = await apiClient.get<{ roles: string[] }>(
      API_ENDPOINTS.ADMIN.ROLES.LIST
    );
    return response.data.roles;
  },

  // ============ WORD CLASSIFICATION ============

  /**
   * Phân loại từ vựng theo chủ đề
   */
  async classifyWordsByTopic(wordIds: number[], hskLevel: number = 1): Promise<{
    message: string;
    classification: Record<number, number[]>;
    totalWords: number;
    classifiedWords: number;
  }> {
    const response = await apiClient.post<{
      message: string;
      classification: Record<number, number[]>;
      totalWords: number;
      classifiedWords: number;
    }>(API_ENDPOINTS.ADMIN.WORD_CLASSIFICATION.CLASSIFY_BY_TOPIC, {
      wordIds,
      hskLevel,
    });
    return response.data;
  },

  /**
   * Tự động tổ chức từ vựng HSK1 thành các LessonTopics
   */
  async autoOrganizeHSK1(
    strategy: string = "thematic",
    wordsPerTopic?: number
  ): Promise<{
    topics: Array<{
      topicId: number;
      title: string;
      wordCount: number;
      wordIds: number[];
    }>;
    totalWords: number;
    classifiedWords: number;
    unclassifiedWords: number;
    message: string;
  }> {
    const response = await apiClient.post<{
      topics: Array<{
        topicId: number;
        title: string;
        wordCount: number;
        wordIds: number[];
      }>;
      totalWords: number;
      classifiedWords: number;
      unclassifiedWords: number;
      message: string;
    }>(API_ENDPOINTS.ADMIN.WORD_CLASSIFICATION.AUTO_ORGANIZE_HSK1(strategy, wordsPerTopic));
    return response.data;
  },

  /**
   * Gán từ vựng vào topic cụ thể
   */
  async assignWordsToTopic(wordIds: number[], topicId: number): Promise<{
    message: string;
    wordCount: number;
    topicId: number;
  }> {
    const response = await apiClient.post<{
      message: string;
      wordCount: number;
      topicId: number;
    }>(API_ENDPOINTS.ADMIN.WORD_CLASSIFICATION.ASSIGN_TO_TOPIC, {
      wordIds,
      topicId,
    });
    return response.data;
  },

  /**
   * Gợi ý topic phù hợp cho từ vựng
   */
  async suggestTopicForWord(wordId: number, hskLevel: number = 1): Promise<{
    wordId: number;
    suggestedTopicId: number;
    suggestedTopicTitle: string;
  }> {
    const response = await apiClient.get<{
      wordId: number;
      suggestedTopicId: number;
      suggestedTopicTitle: string;
    }>(API_ENDPOINTS.ADMIN.WORD_CLASSIFICATION.SUGGEST_TOPIC(wordId, hskLevel));
    return response.data;
  },

  // ============ EXPORT/BACKUP ============

  /**
   * Export dữ liệu ra JSON để backup
   * @param hskLevel - Chỉ export từ vựng của HSK level cụ thể (1-6)
   * @param includeTopics - Bao gồm LessonTopics (default: true)
   * @param includeLessons - Bao gồm Lessons (default: true)
   * @param includeQuestions - Bao gồm Questions (default: false)
   * @returns Blob data để download file
   */
  async exportWords(
    hskLevel?: number,
    includeTopics: boolean = true,
    includeLessons: boolean = true,
    includeQuestions: boolean = false
  ): Promise<Blob> {
    const url = API_ENDPOINTS.ADMIN.EXPORT.WORDS(
      hskLevel,
      includeTopics,
      includeLessons,
      includeQuestions
    );
    
    const response = await apiClient.get(url, {
      responseType: "blob", // Quan trọng: phải dùng blob để download file
    });
    
    return response.data;
  },

  /**
   * Download file export và lưu vào máy
   */
  async downloadExport(
    hskLevel?: number,
    includeTopics: boolean = true,
    includeLessons: boolean = true,
    includeQuestions: boolean = false
  ): Promise<void> {
    try {
      const blob = await this.exportWords(
        hskLevel,
        includeTopics,
        includeLessons,
        includeQuestions
      );

      // Tạo tên file
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      const fileName = hskLevel
        ? `export-hsk${hskLevel}-${timestamp}.json`
        : `export-all-${timestamp}.json`;

      // Tạo link download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Lỗi khi download export:", error);
      throw error;
    }
  },
};
