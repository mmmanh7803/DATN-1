/**
 * Types cho chức năng làm bài thi HSK
 */

export interface ExamInfo {
  id: number;
  title: string;
  examType: string;
  level: number;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
}

export interface QuestionOption {
  id?: number;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  questionOrder: number;
  questionType: 'LISTENING' | 'READING';
  questionText: string;
  points: number;
  difficultyLevel: number;
  audioUrl?: string;
  audioScript?: string;
  imageUrl?: string;
  translation?: string;
  options: QuestionOption[];
}

export interface ExamSection {
  sectionName: string;
  skillType: 'Listening' | 'Reading';
  parts: ExamPart[];
}

export interface ExamPart {
  partNumber: number;
  partName: string;
  questionCount: number;
  questions: Question[];
}

export interface ExamData {
  exam: ExamInfo;
  sections: ExamSection[];
}

export interface UserAnswer {
  questionId: number;
  selectedOption: string;
  isCorrect?: boolean;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  listeningScore: number;
  readingScore: number;
  passed: boolean;
  timeSpent: number;
  answers: UserAnswer[];
}

