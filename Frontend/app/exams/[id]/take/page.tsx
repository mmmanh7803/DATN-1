'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { examService, ExamDetail } from '@/lib/services/examService';

// Icon Components
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Question Types
type QuestionType = 
  | 'TRUE_FALSE'           // Đúng/Sai (Nghe P1, Đọc P2)
  | 'SELECT_IMAGE'         // Chọn hình ảnh phù hợp (Nghe P2, Đọc P1, Đọc P3)
  | 'MULTIPLE_CHOICE'      // Chọn đáp án từ 3 lựa chọn (Nghe P3, P4)
  | 'FILL_BLANK';          // Điền từ vào chỗ trống (Đọc P4)

type SkillType = 'LISTENING' | 'READING';

interface Answer {
  questionId: number;
  selectedOption: string;
}

interface QuestionOption {
  id: number;
  label: string;
  text?: string;
  imageUrl?: string;
}

interface ExamQuestion {
  id: number;
  order: number;
  skillType: SkillType;
  partNumber: number;
  partName: string;
  questionType: QuestionType;
  questionText: string;
  instruction: string;
  audioUrl?: string;
  imageUrl?: string;
  images?: string[];  // For SELECT_IMAGE type with multiple images
  options: QuestionOption[];
  blankSentence?: string; // For FILL_BLANK type
}

interface ExamPart {
  partNumber: number;
  partName: string;
  skillType: SkillType;
  questionCount: number;
  startIndex: number;
}

// Demo images (using placeholder)
const demoImages = {
  apple: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj33?w=200&h=200&fit=crop',
  book: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
  dog: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
  water: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
  house: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=200&fit=crop',
  car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
  computer: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
  teacher: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=200&h=200&fit=crop',
  student: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=200&h=200&fit=crop',
};

// Generate demo questions following HSK 1 structure
const generateHSK1Questions = (): ExamQuestion[] => {
  const questions: ExamQuestion[] = [];
  let order = 1;

  // ==================== PHẦN NGHE (20 câu) ====================
  
  // Nghe Phần 1: Đúng/Sai (5 câu) - Nghe và xác định câu miêu tả có khớp với bức tranh
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'LISTENING',
      partNumber: 1,
      partName: 'Phần 1',
      questionType: 'TRUE_FALSE',
      instruction: 'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.',
      questionText: `Câu ${order}`,
      audioUrl: `https://example.com/audio/listening1_${i + 1}.mp3`,
      imageUrl: Object.values(demoImages)[i],
      options: [
        { id: order * 10 + 1, label: '✓', text: 'Đúng' },
        { id: order * 10 + 2, label: '✗', text: 'Sai' },
      ],
    });
    order++;
  }

  // Nghe Phần 2: Chọn hình ảnh (5 câu) - Nghe hội thoại và chọn bức tranh phù hợp
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'LISTENING',
      partNumber: 2,
      partName: 'Phần 2',
      questionType: 'SELECT_IMAGE',
      instruction: 'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.',
      questionText: `Câu ${order}`,
      audioUrl: `https://example.com/audio/listening2_${i + 1}.mp3`,
      images: [
        Object.values(demoImages)[i * 2],
        Object.values(demoImages)[i * 2 + 1],
        Object.values(demoImages)[(i * 2 + 2) % 12],
      ],
      options: [
        { id: order * 10 + 1, label: 'A', imageUrl: Object.values(demoImages)[i * 2] },
        { id: order * 10 + 2, label: 'B', imageUrl: Object.values(demoImages)[i * 2 + 1] },
        { id: order * 10 + 3, label: 'C', imageUrl: Object.values(demoImages)[(i * 2 + 2) % 12] },
      ],
    });
    order++;
  }

  // Nghe Phần 3: Chọn đáp án (5 câu) - Nghe hội thoại và chọn câu trả lời đúng
  const listeningPart3Questions = [
    { question: '男的喜欢什么？', options: ['苹果', '香蕉', '橙子'] },
    { question: '女的去哪儿？', options: ['学校', '医院', '商店'] },
    { question: '他们什么时候见面？', options: ['今天', '明天', '后天'] },
    { question: '这个多少钱？', options: ['十块', '二十块', '三十块'] },
    { question: '她是谁？', options: ['老师', '学生', '医生'] },
  ];
  
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'LISTENING',
      partNumber: 3,
      partName: 'Phần 3',
      questionType: 'MULTIPLE_CHOICE',
      instruction: 'Nghe đoạn hội thoại và chọn câu trả lời đúng.',
      questionText: listeningPart3Questions[i].question,
      audioUrl: `https://example.com/audio/listening3_${i + 1}.mp3`,
      options: listeningPart3Questions[i].options.map((opt, idx) => ({
        id: order * 10 + idx + 1,
        label: String.fromCharCode(65 + idx),
        text: opt,
      })),
    });
    order++;
  }

  // Nghe Phần 4: Chọn đáp án (5 câu) - Nghe hội thoại và chọn câu trả lời đúng
  const listeningPart4Questions = [
    { question: '他们在说什么？', options: ['天气', '工作', '吃饭'] },
    { question: '女的想做什么？', options: ['看电影', '去购物', '在家休息'] },
    { question: '男的家在哪儿？', options: ['北京', '上海', '广州'] },
    { question: '今天星期几？', options: ['星期一', '星期三', '星期五'] },
    { question: '他有几个孩子？', options: ['一个', '两个', '三个'] },
  ];
  
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'LISTENING',
      partNumber: 4,
      partName: 'Phần 4',
      questionType: 'MULTIPLE_CHOICE',
      instruction: 'Nghe đoạn hội thoại và chọn câu trả lời đúng.',
      questionText: listeningPart4Questions[i].question,
      audioUrl: `https://example.com/audio/listening4_${i + 1}.mp3`,
      options: listeningPart4Questions[i].options.map((opt, idx) => ({
        id: order * 10 + idx + 1,
        label: String.fromCharCode(65 + idx),
        text: opt,
      })),
    });
    order++;
  }

  // ==================== PHẦN ĐỌC (20 câu) ====================

  // Đọc Phần 1: Chọn hình ảnh (5 câu) - Đọc câu miêu tả và chọn bức tranh phù hợp
  const readingPart1Sentences = [
    '这是一只猫。',
    '我喜欢喝咖啡。',
    '他在用电脑工作。',
    '这是我的房子。',
    '她是一位老师。',
  ];
  
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'READING',
      partNumber: 1,
      partName: 'Phần 1',
      questionType: 'SELECT_IMAGE',
      instruction: 'Đọc câu miêu tả và chọn bức tranh phù hợp.',
      questionText: readingPart1Sentences[i],
      options: [
        { id: order * 10 + 1, label: 'A', imageUrl: Object.values(demoImages)[i * 2] },
        { id: order * 10 + 2, label: 'B', imageUrl: Object.values(demoImages)[i * 2 + 1] },
        { id: order * 10 + 3, label: 'C', imageUrl: Object.values(demoImages)[(i * 2 + 2) % 12] },
      ],
    });
    order++;
  }

  // Đọc Phần 2: Đúng/Sai (5 câu) - Xác định câu miêu tả có đúng với hình ảnh
  const readingPart2Data = [
    { sentence: '这是一本书。', imageKey: 'book' },
    { sentence: '这是一辆汽车。', imageKey: 'car' },
    { sentence: '她在打电话。', imageKey: 'phone' },
    { sentence: '这是水。', imageKey: 'water' },
    { sentence: '这是一只狗。', imageKey: 'dog' },
  ];
  
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'READING',
      partNumber: 2,
      partName: 'Phần 2',
      questionType: 'TRUE_FALSE',
      instruction: 'Xem hình ảnh và xác định xem câu miêu tả có đúng không.',
      questionText: readingPart2Data[i].sentence,
      imageUrl: demoImages[readingPart2Data[i].imageKey as keyof typeof demoImages],
      options: [
        { id: order * 10 + 1, label: '✓', text: 'Đúng' },
        { id: order * 10 + 2, label: '✗', text: 'Sai' },
      ],
    });
    order++;
  }

  // Đọc Phần 3: Chọn 1 trong 3 hình ảnh (5 câu)
  const readingPart3Sentences = [
    '我想喝一杯水。',
    '他有一只可爱的猫。',
    '这是我的电脑。',
    '老师在教室里。',
    '学生们在学习。',
  ];
  
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'READING',
      partNumber: 3,
      partName: 'Phần 3',
      questionType: 'SELECT_IMAGE',
      instruction: 'Đọc câu miêu tả và chọn hình ảnh phù hợp nhất.',
      questionText: readingPart3Sentences[i],
      options: [
        { id: order * 10 + 1, label: 'A', imageUrl: Object.values(demoImages)[(i * 3) % 12] },
        { id: order * 10 + 2, label: 'B', imageUrl: Object.values(demoImages)[(i * 3 + 1) % 12] },
        { id: order * 10 + 3, label: 'C', imageUrl: Object.values(demoImages)[(i * 3 + 2) % 12] },
      ],
    });
    order++;
  }

  // Đọc Phần 4: Điền từ vào chỗ trống (5 câu)
  const readingPart4Data = [
    { sentence: '我____喝茶。', options: ['喜欢', '是', '有'] },
    { sentence: '她是我的____。', options: ['朋友', '书', '水'] },
    { sentence: '今天天气很____。', options: ['好', '喝', '看'] },
    { sentence: '我____中国人。', options: ['是', '有', '去'] },
    { sentence: '他____三个苹果。', options: ['有', '是', '喜欢'] },
  ];
  
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: order,
      order,
      skillType: 'READING',
      partNumber: 4,
      partName: 'Phần 4',
      questionType: 'FILL_BLANK',
      instruction: 'Chọn từ đúng để điền vào chỗ trống.',
      questionText: 'Điền từ thích hợp:',
      blankSentence: readingPart4Data[i].sentence,
      options: readingPart4Data[i].options.map((opt, idx) => ({
        id: order * 10 + idx + 1,
        label: String.fromCharCode(65 + idx),
        text: opt,
      })),
    });
    order++;
  }

  return questions;
};

// Get exam parts for sidebar
const getExamParts = (): ExamPart[] => [
  { partNumber: 1, partName: 'Phần 1', skillType: 'LISTENING', questionCount: 5, startIndex: 0 },
  { partNumber: 2, partName: 'Phần 2', skillType: 'LISTENING', questionCount: 5, startIndex: 5 },
  { partNumber: 3, partName: 'Phần 3', skillType: 'LISTENING', questionCount: 5, startIndex: 10 },
  { partNumber: 4, partName: 'Phần 4', skillType: 'LISTENING', questionCount: 5, startIndex: 15 },
  { partNumber: 1, partName: 'Phần 1', skillType: 'READING', questionCount: 5, startIndex: 20 },
  { partNumber: 2, partName: 'Phần 2', skillType: 'READING', questionCount: 5, startIndex: 25 },
  { partNumber: 3, partName: 'Phần 3', skillType: 'READING', questionCount: 5, startIndex: 30 },
  { partNumber: 4, partName: 'Phần 4', skillType: 'READING', questionCount: 5, startIndex: 35 },
];

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.id as string);
  
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(35 * 60); // HSK1: 35 phút
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const examParts = getExamParts();

  // Load exam data
  useEffect(() => {
    loadExam();
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      const examData = await examService.getExamById(examId);
      
      if (examData) {
        setExam(examData);
        // Set time from API data
        const durationMinutes = examData.durationMinutes || examData.exam?.durationMinutes || 35;
        setTimeLeft(durationMinutes * 60);
        
        // Convert API questions to display format if available
        if (examData.questions && examData.questions.length > 0) {
          const apiQuestions = convertApiQuestionsToDisplay(examData.questions);
          setQuestions(apiQuestions);
        } else {
          // Fallback to demo questions
          setQuestions(generateHSK1Questions());
        }
      } else {
        // Use HSK1 demo questions if no API data
        setQuestions(generateHSK1Questions());
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      setQuestions(generateHSK1Questions());
    } finally {
      setIsLoading(false);
    }
  };

  // Convert API questions to display format
  const convertApiQuestionsToDisplay = (apiQuestions: any[]): ExamQuestion[] => {
    return apiQuestions.map((q, index) => ({
      id: q.id,
      order: q.questionOrder || index + 1,
      skillType: (q.skillType as SkillType) || 'LISTENING',
      partNumber: q.partNumber || 1,
      partName: `Phần ${q.partNumber || 1}`,
      questionType: (q.questionType as QuestionType) || 'MULTIPLE_CHOICE',
      questionText: q.questionText || '',
      instruction: q.instruction || '',
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl,
      blankSentence: q.blankSentence,
      options: (q.options || []).map((opt: any) => ({
        id: opt.id,
        label: opt.optionLabel,
        text: opt.optionText,
        imageUrl: opt.imageUrl,
      })),
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  const getAnswerForQuestion = (questionId: number): string | undefined => {
    return answers.find(a => a.questionId === questionId)?.selectedOption;
  };

  const handleSelectAnswer = (questionId: number, optionLabel: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, selectedOption: optionLabel }
            : a
        );
      }
      return [...prev, { questionId, selectedOption: optionLabel }];
    });
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      handleGoToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleGoToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePlayAudio = () => {
    if (!currentQuestion?.audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(currentQuestion.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await examService.submitExam(examId, {
        answers: answers.map(a => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
        })),
        timeSpentSeconds: 35 * 60 - timeLeft,
      });
      router.push(`/exams/${examId}/result`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      router.push(`/exams/${examId}/result`);
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Count answered questions
  const listeningAnswered = answers.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q?.skillType === 'LISTENING';
  }).length;
  
  const readingAnswered = answers.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q?.skillType === 'READING';
  }).length;

  const answeredCount = answers.length;
  const totalQuestions = questions.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const selectedAnswer = getAnswerForQuestion(currentQuestion.id);

    switch (currentQuestion.questionType) {
      case 'TRUE_FALSE':
        return (
          <div className="space-y-6">
            {/* Image */}
            {currentQuestion.imageUrl && (
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
            
            {/* True/False Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleSelectAnswer(currentQuestion.id, '✓')}
                className={`flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-3 transition-all ${
                  selectedAnswer === '✓'
                    ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105'
                    : 'bg-white border-gray-200 text-green-600 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                <CheckIcon />
                <span className="mt-2 font-bold text-lg">Đúng</span>
              </button>
              <button
                onClick={() => handleSelectAnswer(currentQuestion.id, '✗')}
                className={`flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-3 transition-all ${
                  selectedAnswer === '✗'
                    ? 'bg-red-500 border-red-600 text-white shadow-lg scale-105'
                    : 'bg-white border-gray-200 text-red-600 hover:border-red-400 hover:bg-red-50'
                }`}
              >
                <XMarkIcon />
                <span className="mt-2 font-bold text-lg">Sai</span>
              </button>
            </div>
          </div>
        );

      case 'SELECT_IMAGE':
        return (
          <div className="space-y-6">
            {/* Question text for reading */}
            {currentQuestion.skillType === 'READING' && (
              <div className="text-center">
                <p className="text-2xl font-medium text-gray-800">{currentQuestion.questionText}</p>
              </div>
            )}
            
            {/* Image Options */}
            <div className="grid grid-cols-3 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.label)}
                  className={`relative group rounded-2xl overflow-hidden border-4 transition-all ${
                    selectedAnswer === option.label
                      ? 'border-indigo-500 ring-4 ring-indigo-200 scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={option.imageUrl || ''}
                      alt={`Option ${option.label}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    selectedAnswer === option.label
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/90 text-gray-700'
                  }`}>
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            {/* Question Text */}
            <div className="text-center mb-6">
              <p className="text-xl font-medium text-gray-800">{currentQuestion.questionText}</p>
            </div>
            
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.label)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === option.label
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    selectedAnswer === option.label
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-xl ${selectedAnswer === option.label ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'FILL_BLANK':
        return (
          <div className="space-y-6">
            {/* Sentence with blank */}
            <div className="text-center bg-gray-50 rounded-2xl p-8">
              <p className="text-3xl font-medium text-gray-800">
                {currentQuestion.blankSentence?.split('____').map((part, idx, arr) => (
                  <span key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span className={`inline-block min-w-[80px] mx-2 px-4 py-1 rounded-lg border-2 border-dashed ${
                        selectedAnswer 
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-700' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedAnswer 
                          ? currentQuestion.options.find(o => o.label === selectedAnswer)?.text 
                          : '______'}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>
            
            {/* Options */}
            <div className="flex justify-center gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.label)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === option.label
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    selectedAnswer === option.label
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.label}
                  </span>
                  <span className={`text-xl ${selectedAnswer === option.label ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <BackIcon />
              <span className="hidden sm:inline">Trở về</span>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors lg:hidden"
            >
              <ListIcon />
            </button>
          </div>

          {/* Center - Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold ${
            timeLeft <= 300 ? 'bg-red-500 animate-pulse' : 'bg-white/20'
          }`}>
            <ClockIcon />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Right */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
          >
            <SendIcon />
            <span className="hidden sm:inline">Nộp bài</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className={`${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 top-[60px] left-0 w-80 h-[calc(100vh-60px)] bg-white shadow-xl z-40 transition-transform duration-300 overflow-hidden flex flex-col`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h2 className="font-bold">Danh sách câu hỏi</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-1 hover:bg-white/20 rounded"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Question Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Listening Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  <HeadphonesIcon />
                  <span>Nghe</span>
                </div>
                <span className="text-sm text-gray-500">
                  {listeningAnswered}/20
                </span>
              </div>
              
              {/* Listening Parts */}
              {examParts.filter(p => p.skillType === 'LISTENING').map((part) => (
                <div key={`listening-${part.partNumber}`} className="mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">{part.partName}</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: part.questionCount }).map((_, idx) => {
                      const questionIndex = part.startIndex + idx;
                      const question = questions[questionIndex];
                      if (!question) return null;
                      const isAnswered = !!getAnswerForQuestion(question.id);
                      const isCurrent = currentQuestionIndex === questionIndex;
                      return (
                        <button
                          key={question.id}
                          onClick={() => handleGoToQuestion(questionIndex)}
                          className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1'
                              : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {question.order}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Reading Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <BookIcon />
                  <span>Đọc</span>
                </div>
                <span className="text-sm text-gray-500">
                  {readingAnswered}/20
                </span>
              </div>
              
              {/* Reading Parts */}
              {examParts.filter(p => p.skillType === 'READING').map((part) => (
                <div key={`reading-${part.partNumber}`} className="mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">{part.partName}</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: part.questionCount }).map((_, idx) => {
                      const questionIndex = part.startIndex + idx;
                      const question = questions[questionIndex];
                      if (!question) return null;
                      const isAnswered = !!getAnswerForQuestion(question.id);
                      const isCurrent = currentQuestionIndex === questionIndex;
                      return (
                        <button
                          key={question.id}
                          onClick={() => handleGoToQuestion(questionIndex)}
                          className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1'
                              : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {question.order}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ</span>
              <span>{answeredCount}/{totalQuestions} câu</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Question Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {currentQuestion && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Question Header */}
                <div className={`px-6 py-4 ${
                  currentQuestion.skillType === 'LISTENING' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        {currentQuestion.order}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm opacity-80">
                            {currentQuestion.skillType === 'LISTENING' ? 'Phần Nghe' : 'Phần Đọc'}
                          </span>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {currentQuestion.partName}
                          </span>
                        </div>
                        <h2 className="font-semibold">Câu {currentQuestion.order}</h2>
                      </div>
                    </div>
                    {currentQuestion.skillType === 'LISTENING' && currentQuestion.audioUrl && (
                      <button
                        onClick={handlePlayAudio}
                        className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Instruction */}
                <div className="px-6 py-3 bg-gray-50 border-b">
                  <p className="text-sm text-gray-600 italic">
                    💡 {currentQuestion.instruction}
                  </p>
                </div>

                {/* Question Content */}
                <div className="p-6">
                  {renderQuestion()}
                </div>

                {/* Navigation Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentQuestionIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeftIcon />
                    Câu trước
                  </button>

                  <span className="text-gray-500">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </span>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentQuestionIndex === questions.length - 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    Câu sau
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Xác nhận nộp bài
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Đã hoàn thành:</span>
                <span className="font-bold text-indigo-600">{answeredCount}/{totalQuestions} câu</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Phần Nghe:</span>
                <span className="font-medium">{listeningAnswered}/20</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Phần Đọc:</span>
                <span className="font-medium">{readingAnswered}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Thời gian còn lại:</span>
                <span className={`font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <p className="text-amber-600 text-sm mb-4 bg-amber-50 p-3 rounded-lg">
                ⚠️ Bạn còn {totalQuestions - answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
