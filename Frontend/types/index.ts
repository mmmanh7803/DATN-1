// User types
export interface User {
  id: string;
  email: string;
  userName?: string;
  roles?: string[];
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  user: User;
}

// Course types
export interface Course {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  level?: string;
  lessons?: Lesson[];
}

export interface CourseListDto {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  hskLevel?: number;
  totalLessons: number;
  progressPercentage: number;
}

export interface CourseDto {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  level?: string;
  hskLevel?: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isEnrolled: boolean;
}

// Lesson types
export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  lessonIndex: number;
  words?: Word[];
  questions?: Question[];
}

export interface LessonListDto {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  lessonIndex: number;
  isLocked: boolean;
  isCompleted: boolean;
  prerequisiteLessonId?: number;
  totalWords: number;
  totalQuestions: number;
}

export interface LessonDto {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description?: string;
  lessonIndex: number;
  content?: string;
  isLocked: boolean;
  isCompleted: boolean;
  prerequisiteLessonId?: number;
  words: WordDto[];
  sentencePatterns: SentencePatternDto[]; // Grammar
  readingPassages: ReadingPassageDto[];
  dialogues: DialogueDto[];
  questions: QuestionDto[]; // Quiz
}

export interface SentencePatternDto {
  id: number;
  lessonId?: number;
  patternText: string;
  pinyin?: string;
  meaning: string;
  usage?: string;
  exampleSentences?: string;
  category?: string;
  difficultyLevel: number;
}

export interface ReadingPassageDto {
  id: number;
  lessonId?: number;
  title: string;
  passageText: string;
  pinyin?: string;
  translation?: string;
  difficultyLevel: number;
  wordCount?: number;
  category?: string;
  imageUrl?: string;
  questions: QuestionDto[];
}

export interface DialogueDto {
  id: number;
  lessonId?: number;
  title: string;
  dialogueText: string;
  pinyin?: string;
  translation?: string;
  audioUrl?: string;
  difficultyLevel: number;
  category?: string;
  questions: QuestionDto[];
}

// Word types
export interface Word {
  id: number;
  lessonId: number;
  character: string;
  pinyin: string;
  meaning: string;
  audioUrl?: string;
  exampleSentence?: string;
}

export interface WordExampleDto {
  id: number;
  character: string;
  pinyin: string;
  meaning: string;
  audioUrl?: string;
  sortOrder: number;
}

export interface WordDto {
  id: number;
  character: string;
  pinyin: string;
  meaning: string;
  audioUrl?: string;
  imageUrl?: string;
  exampleSentence?: string;
  hskLevel?: number;
  strokeCount?: number;
  partOfSpeech?: string;
  partOfSpeechVi?: string;
  partOfSpeechEn?: string;
  grammarNote?: string;
  structure?: string;
  examples?: WordExampleDto[];
}

// Question types
export interface Question {
  id: number;
  lessonId: number;
  questionText: string;
  questionType: "READING" | "LISTEN" | "CHOOSE_MEANING";
  audioUrl?: string;
  questionOptions?: QuestionOption[];
}

export interface QuestionDto {
  id: number;
  questionText: string;
  questionType: string;
  audioUrl?: string;
  imageUrl?: string;
  blankSentence?: string;
  points: number;
  explanation?: string;
  options: QuestionOptionDto[];
  correctWordId?: number;
}

export interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionOptionDto {
  id: number;
  optionText: string;
  optionLabel: string;
  isCorrect: boolean;
}

export interface QuizSubmissionDto {
  lessonId: number;
  answers: AnswerSubmissionDto[];
}

export interface AnswerSubmissionDto {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

export interface QuizResultDto {
  score: number;
  totalPoints: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  lessonCompleted: boolean;
  nextLessonUnlocked: boolean;
  nextLessonId?: number;
  questionResults: QuestionResultDto[];
}

export interface QuestionResultDto {
  questionId: number;
  isCorrect: boolean;
  pointsEarned: number;
  selectedOptionId?: number;
  explanation?: string;
}

// Progress types
export interface UserLessonProgress {
  id: number;
  userId: string;
  lessonId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface UserWordProgress {
  id: number;
  userId: string;
  wordId: number;
  status: "New" | "Learning" | "Mastered" | "Reviewing";
  nextReviewDate: string;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt?: string;
}

// Vocabulary Topic types
export interface VocabularyTopicDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  wordCount: number;
}

export interface VocabularyTopicDetailDto extends VocabularyTopicDto {
  words: WordWithProgressDto[];
}

export interface WordWithProgressDto extends WordDto {
  progress?: UserWordProgress;
}

// Flashcard Review types
export interface FlashcardReviewDto {
  wordId: number;
  character: string;
  pinyin: string;
  meaning: string;
  audioUrl?: string;
  exampleSentence?: string;
  progress?: UserWordProgress;
}

export interface UpdateReviewStatusRequest {
  wordId: number;
  rating: "Easy" | "Hard" | "Forgot";
}

export interface ReviewStatsDto {
  totalWords: number;
  newWords: number;
  learningWords: number;
  masteredWords: number;
  wordsDueToday: number;
}

// Part Progress types
export interface ActivityProgressDto {
  activityId: string;
  activityName: string;
  isCompleted: boolean;
  score?: number;
  completedAt?: string;
}

export interface PartProgressDto {
  hskLevel: number;
  partNumber: number;
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  completedActivities: number;
  totalActivities: number;
  progressPercentage: number;
  activities: ActivityProgressDto[];
}

// Lesson Topic types
export interface LessonTopicDto {
  id: number;
  courseId?: number;
  hskLevel?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  topicIndex: number;
  isLocked: boolean;
  prerequisiteTopicId?: number;
  totalExercises: number;
  totalWords: number;
  progressPercentage: number;
  words?: WordWithProgressDto[];
}

export interface LessonTopicListDto {
  id: number;
  courseId?: number;
  hskLevel?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  topicIndex: number;
  isLocked: boolean;
  prerequisiteTopicId?: number;
  totalExercises: number;
  totalWords: number;
  progressPercentage: number;
}

// Lesson Exercise types
export interface LessonExerciseDto {
  id: number;
  topicId: number;
  exerciseType: string;
  title: string;
  description?: string;
  exerciseIndex: number;
  isLocked: boolean;
  prerequisiteExerciseId?: number;
  questions?: QuestionDto[];
  dialogues?: DialogueDto[];
  readingPassages?: ReadingPassageDto[];
  sentencePatterns?: SentencePatternDto[];
  words?: WordDto[];
}

export interface LessonExerciseListDto {
  id: number;
  topicId: number;
  exerciseType: string;
  title: string;
  description?: string;
  exerciseIndex: number;
  isLocked: boolean;
  isCompleted: boolean;
  exerciseTypeName: string;
}

