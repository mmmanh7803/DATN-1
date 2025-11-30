// API endpoints constants
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
  },
  
  // Courses
  COURSES: {
    BASE: "/api/courses",
    BY_ID: (id: number) => `/api/courses/${id}`,
    WORDS_BY_HSK_AND_PART: (hskLevel: number, partNumber: number) => 
      `/api/courses/hsk/${hskLevel}/part/${partNumber}`,
  },
  
  // Lessons
  LESSONS: {
    BASE: "/api/lessons",
    BY_ID: (id: number) => `/api/lessons/${id}`,
    BY_COURSE: (courseId: number) => `/api/lessons/course/${courseId}`,
  },
  
  // Lesson Topics
  LESSON_TOPICS: {
    BASE: "/api/lessontopics",
    BY_ID: (id: number) => `/api/lessontopics/${id}`,
    BY_HSK_LEVEL: (hskLevel: number) => `/api/lessontopics/hsk/${hskLevel}`,
    UNLOCK_STATUS: (id: number) => `/api/lessontopics/${id}/unlock-status`,
  },
  
  // Lesson Exercises
  LESSON_EXERCISES: {
    BASE: "/api/lessonexercises",
    BY_ID: (id: number) => `/api/lessonexercises/${id}`,
    BY_TOPIC: (topicId: number) => `/api/lessonexercises/topic/${topicId}`,
    UNLOCK_STATUS: (id: number) => `/api/lessonexercises/${id}/unlock-status`,
  },
  
  // Words
  WORDS: {
    BASE: "/api/words",
    BY_ID: (id: number) => `/api/words/${id}`,
    BY_SLUG: (slug: string) => `/api/words/${encodeURIComponent(slug)}`,
    BY_LESSON: (lessonId: number) => `/api/lessons/${lessonId}/words`,
  },
  
  // Questions
  QUESTIONS: {
    BASE: "/api/questions",
    BY_ID: (id: number) => `/api/questions/${id}`,
    BY_LESSON: (lessonId: number) => `/api/lessons/${lessonId}/questions`,
  },
  
  // Progress
  PROGRESS: {
    LESSON: {
      BASE: "/api/progress/lessons",
      BY_LESSON: (lessonId: number) => `/api/progress/lessons/${lessonId}`,
    },
    WORD: {
      BASE: "/api/progress/words",
      BY_WORD: (wordId: number) => `/api/progress/words/${wordId}`,
    },
  },
  
  // Vocabulary Topics
  VOCABULARY_TOPICS: {
    BASE: "/api/vocabularytopics",
    BY_ID: (id: number) => `/api/vocabularytopics/${id}`,
    REVIEW_WORDS: (id: number, onlyDue?: boolean, limit?: number) => {
      const params = new URLSearchParams();
      if (onlyDue !== undefined) params.append("onlyDue", onlyDue.toString());
      if (limit !== undefined) params.append("limit", limit.toString());
      return `/api/vocabularytopics/${id}/review-words?${params.toString()}`;
    },
    STATS: (id: number) => `/api/vocabularytopics/${id}/stats`,
    OVERALL_STATS: "/api/vocabularytopics/stats/overall",
    REVIEW_DUE: (topicId?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (topicId !== undefined) params.append("topicId", topicId.toString());
      if (limit !== undefined) params.append("limit", limit.toString());
      return `/api/vocabularytopics/review/due?${params.toString()}`;
    },
    UPDATE_REVIEW: "/api/vocabularytopics/review",
    IMAGE_QUIZ: (topicId: number, count?: number) => {
      const params = new URLSearchParams();
      if (count !== undefined) params.append("count", count.toString());
      return `/api/vocabularytopics/${topicId}/image-quiz?${params.toString()}`;
    },
  },

  // AI
  AI: {
    GENERATE_EXAMPLE: "/api/ai/generate-example",
    GENERATE_CONVERSATION: "/api/ai/generate-conversation",
  },

  // Admin
  ADMIN: {
    STATS: "/api/admin/stats",
    SEED: (fileName?: string, clearExisting?: boolean) => {
      const params = new URLSearchParams();
      if (fileName) params.append("fileName", fileName);
      if (clearExisting !== undefined) params.append("clearExisting", clearExisting.toString());
      return `/api/admin/seed?${params.toString()}`;
    },
    CLEAR_DATA: "/api/admin/clear-data",
    SEED_VOCABULARY_TOPIC_HSK1: "/api/admin/seed-vocabulary-topic-hsk1",
    // Words Management
    WORDS: {
      LIST: (hskLevel?: number, search?: string) => {
        const params = new URLSearchParams();
        if (hskLevel) params.append("hskLevel", hskLevel.toString());
        if (search) params.append("search", search);
        return `/api/admin/words?${params.toString()}`;
      },
      CREATE: "/api/admin/words",
      UPDATE: (id: number) => `/api/admin/words/${id}`,
      DELETE: (id: number) => `/api/admin/words/${id}`,
      BY_ID: (id: number) => `/api/admin/words/${id}`,
    },
    // Courses Management
    COURSES: {
      LIST: "/api/admin/courses",
      CREATE: "/api/admin/courses",
      UPDATE: (id: number) => `/api/admin/courses/${id}`,
      DELETE: (id: number) => `/api/admin/courses/${id}`,
      BY_ID: (id: number) => `/api/admin/courses/${id}`,
    },
    // Lessons Management
    LESSONS: {
      LIST: (courseId?: number) => {
        const params = new URLSearchParams();
        if (courseId) params.append("courseId", courseId.toString());
        return `/api/admin/lessons?${params.toString()}`;
      },
      CREATE: "/api/admin/lessons",
      UPDATE: (id: number) => `/api/admin/lessons/${id}`,
      DELETE: (id: number) => `/api/admin/lessons/${id}`,
      BY_ID: (id: number) => `/api/admin/lessons/${id}`,
    },
    // Lesson Exercises Management (Admin)
    LESSON_EXERCISES: {
      LIST: (topicId?: number) => {
        const params = new URLSearchParams();
        if (topicId) params.append("topicId", topicId.toString());
        return `/api/admin/lessonexercises?${params.toString()}`;
      },
      CREATE: "/api/admin/lessonexercises",
      UPDATE: (id: number) => `/api/admin/lessonexercises/${id}`,
      DELETE: (id: number) => `/api/admin/lessonexercises/${id}`,
      BY_ID: (id: number) => `/api/admin/lessonexercises/${id}`,
      TOGGLE_ACTIVE: (id: number) => `/api/admin/lessonexercises/${id}/toggle-active`,
      STATS: (id: number) => `/api/admin/lessonexercises/${id}/stats`,
      EXPORT: (topicId?: number) => {
        const params = new URLSearchParams();
        if (topicId) params.append("topicId", topicId.toString());
        return `/api/admin/lessonexercises/export?${params.toString()}`;
      },
      IMPORT: "/api/admin/lessonexercises/import",
    },
    // Questions Management
    QUESTIONS: {
      LIST: (lessonId?: number, exerciseId?: number, type?: string) => {
        const params = new URLSearchParams();
        if (lessonId) params.append("lessonId", lessonId.toString());
        if (exerciseId) params.append("exerciseId", exerciseId.toString());
        if (type) params.append("type", type);
        return `/api/admin/questions?${params.toString()}`;
      },
      CREATE: "/api/admin/questions",
      UPDATE: (id: number) => `/api/admin/questions/${id}`,
      DELETE: (id: number) => `/api/admin/questions/${id}`,
      BY_ID: (id: number) => `/api/admin/questions/${id}`,
      REORDER: "/api/admin/questions/reorder",
    },
    // Users Management
    USERS: {
      LIST: "/api/admin/users",
      BY_ID: (id: string) => `/api/admin/users/${id}`,
      UPDATE: (id: string) => `/api/admin/users/${id}`,
      DELETE: (id: string) => `/api/admin/users/${id}`,
    },
    // Statistics
    STATISTICS: {
      OVERVIEW: "/api/admin/statistics/overview",
      USERS: "/api/admin/statistics/users",
      LEARNING: "/api/admin/statistics/learning",
    },
    // Media Management
    MEDIA: {
      UPLOAD: "/api/admin/media/upload",
      LIST: "/api/admin/media",
      DELETE: (id: number) => `/api/admin/media/${id}`,
    },
    // Quiz Management
    QUIZZES: {
      CREATE: "/api/admin/quizzes",
      BY_ID: (id: number) => `/api/admin/quizzes/${id}`,
      PUBLISH: (id: number) => `/api/admin/quizzes/${id}/publish`,
    },
    // AI Tools
    AI_TOOLS: {
      GENERATE_EXAMPLES: "/api/admin/ai/generate-examples",
      GENERATE_CONVERSATION: "/api/admin/ai/generate-conversation",
      GENERATE_QUESTIONS: "/api/admin/ai/generate-questions",
      CLASSIFY_HSK: "/api/admin/ai/classify-hsk",
      GENERATE_IMAGE: "/api/admin/ai/generate-image",
    },
    // Word Classification
    WORD_CLASSIFICATION: {
      CLASSIFY_BY_TOPIC: "/api/admin/words/classify-by-topic",
      AUTO_ORGANIZE_HSK1: (strategy?: string, wordsPerTopic?: number) => {
        const params = new URLSearchParams();
        if (strategy) params.append("strategy", strategy);
        if (wordsPerTopic) params.append("wordsPerTopic", wordsPerTopic.toString());
        return `/api/admin/lessontopics/auto-organize-hsk1?${params.toString()}`;
      },
      ASSIGN_TO_TOPIC: "/api/admin/words/assign-to-topic",
      SUGGEST_TOPIC: (wordId: number, hskLevel?: number) => {
        const params = new URLSearchParams();
        if (hskLevel) params.append("hskLevel", hskLevel.toString());
        return `/api/admin/words/${wordId}/suggest-topic?${params.toString()}`;
      },
    },
    // Reports
    REPORTS: {
      WORD_POPULARITY: "/api/admin/reports/word-popularity",
      INCORRECT_QUESTIONS: (exerciseId?: number) => {
        const params = new URLSearchParams();
        if (exerciseId) params.append("exerciseId", exerciseId.toString());
        return `/api/admin/reports/incorrect-questions?${params.toString()}`;
      },
    },
    // Export/Import
    EXPORT: {
      WORDS: (hskLevel?: number, includeTopics?: boolean, includeLessons?: boolean, includeQuestions?: boolean) => {
        const params = new URLSearchParams();
        if (hskLevel) params.append("hskLevel", hskLevel.toString());
        if (includeTopics !== undefined) params.append("includeTopics", includeTopics.toString());
        if (includeLessons !== undefined) params.append("includeLessons", includeLessons.toString());
        if (includeQuestions !== undefined) params.append("includeQuestions", includeQuestions.toString());
        return `/api/admin/words/export?${params.toString()}`;
      },
      WORDS_WITHOUT_HSK_LEVEL: "/api/admin/words/without-hsk-level/export",
      WORDS_WITHOUT_HSK_LEVEL_LIST: "/api/admin/words/without-hsk-level",
    },
    // Lesson Topics Management (Admin)
    LESSON_TOPICS: {
      LIST: (lessonId?: number, hskLevel?: number) => {
        const params = new URLSearchParams();
        if (lessonId) params.append("lessonId", lessonId.toString());
        if (hskLevel) params.append("hskLevel", hskLevel.toString());
        return `/api/admin/lessontopics?${params.toString()}`;
      },
      CREATE: "/api/admin/lessontopics",
      UPDATE: (id: number) => `/api/admin/lessontopics/${id}`,
      DELETE: (id: number) => `/api/admin/lessontopics/${id}`,
      BY_ID: (id: number) => `/api/admin/lessontopics/${id}`,
    },
  },
  // TTS
  TTS: {
    PROXY: "/api/tts",
  },
};

