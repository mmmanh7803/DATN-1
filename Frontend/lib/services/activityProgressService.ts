import { ActivityProgress } from "@/components/vocabulary/ActivityProgressChart";
import { WordWithProgressDto } from "@/types";
import { getCompletedActivities, getTopicProgress } from "./activityService";
import { getActivities } from "./activityService";

export interface ActivityProgressData {
  activityId: string;
  activityName: string;
  wordId: number;
  status: "completed" | "in_progress" | "not_started";
  score?: number;
  lastAttempt?: Date;
}

// Calculate progress for vocabulary activity
export function calculateVocabularyProgress(words: WordWithProgressDto[]): ActivityProgress {
  const completed = words.filter(w => w.progress?.status === "Mastered").length;
  const inProgress = words.filter(w => w.progress?.status === "Learning").length;
  const notStarted = words.filter(w => !w.progress || w.progress.status === "New").length;

  return {
    activityId: "vocabulary",
    activityName: "Từ vựng",
    completed,
    inProgress,
    notStarted,
    total: words.length,
  };
}

// Calculate progress for pronunciation activity
export function calculatePronunciationProgress(
  words: WordWithProgressDto[],
  pronunciationScores: Map<number, number>
): ActivityProgress {
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;

  words.forEach(word => {
    const score = pronunciationScores.get(word.id);
    if (score === undefined) {
      notStarted++;
    } else if (score >= 80) {
      completed++;
    } else {
      inProgress++;
    }
  });

  return {
    activityId: "pronunciation",
    activityName: "Luyện phát âm",
    completed,
    inProgress,
    notStarted,
    total: words.length,
  };
}

// Calculate progress for quick memorize activity
// words: danh sách từ vựng thuộc chủ đề (topic)
// completedWords: set các word IDs đã hoàn thành
export function calculateQuickMemorizeProgress(
  words: WordWithProgressDto[],
  completedWords: Set<number>
): ActivityProgress {
  // Chỉ tính các từ thuộc chủ đề (words đã được filter từ backend)
  // Đảm bảo words không null/undefined
  const wordsInTopic = words || [];
  
  // Filter completedWords để chỉ lấy các từ có trong danh sách words (thuộc chủ đề)
  const topicWordIds = new Set(wordsInTopic.map(w => w.id));
  const completedInTopic = wordsInTopic.filter(w => 
    completedWords.has(w.id) && topicWordIds.has(w.id)
  ).length;
  const notStarted = wordsInTopic.length - completedInTopic;

  return {
    activityId: "quick-memorize",
    activityName: "Nhớ nhanh từ",
    completed: completedInTopic,
    inProgress: 0,
    notStarted,
    total: wordsInTopic.length, // Tổng số từ vựng thuộc chủ đề (chỉ tính các từ trong danh sách)
  };
}

// Calculate progress for flashcard activity
export function calculateFlashcardProgress(
  words: WordWithProgressDto[],
  reviewedWords: Set<number>
): ActivityProgress {
  const completed = words.filter(w => {
    if (!w.progress) return false;
    // Hoàn thành nếu đã review và status là Mastered hoặc Reviewing với nhiều lần review
    return reviewedWords.has(w.id) && (
      w.progress.status === "Mastered" || 
      (w.progress.status === "Reviewing" && w.progress.reviewCount >= 3)
    );
  }).length;
  
  const inProgress = words.filter(w => {
    if (!w.progress) return false;
    // Đang học nếu đã review nhưng chưa master
    return reviewedWords.has(w.id) && (
      w.progress.status === "Learning" || 
      (w.progress.status === "Reviewing" && w.progress.reviewCount < 3)
    );
  }).length;

  const notStarted = words.length - completed - inProgress;

  return {
    activityId: "flashcard",
    activityName: "Flash card từ vựng",
    completed,
    inProgress,
    notStarted,
    total: words.length,
  };
}

// Calculate all activities progress
export function calculateAllActivitiesProgress(
  words: WordWithProgressDto[],
  options?: {
    pronunciationScores?: Map<number, number>;
    completedQuickMemorize?: Set<number>;
    reviewedFlashcards?: Set<number>;
  }
): ActivityProgress[] {
  const activities: ActivityProgress[] = [];

  // Vocabulary progress
  activities.push(calculateVocabularyProgress(words));

  // Quick memorize progress
  if (options?.completedQuickMemorize) {
    activities.push(calculateQuickMemorizeProgress(words, options.completedQuickMemorize));
  }

  // Pronunciation progress
  if (options?.pronunciationScores) {
    activities.push(calculatePronunciationProgress(words, options.pronunciationScores));
  }

  // Flashcard progress
  if (options?.reviewedFlashcards) {
    activities.push(calculateFlashcardProgress(words, options.reviewedFlashcards));
  }

  return activities;
}

// Get progress summary
export function getProgressSummary(activities: ActivityProgress[]) {
  const totalWords = activities[0]?.total || 0;
  const totalTasks = activities.reduce((sum, act) => sum + act.total, 0);
  const completedTasks = activities.reduce((sum, act) => sum + act.completed, 0);
  const inProgressTasks = activities.reduce((sum, act) => sum + act.inProgress, 0);
  
  return {
    totalWords,
    totalActivities: activities.length,
    totalTasks,
    completedTasks,
    inProgressTasks,
    completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  };
}

// Store pronunciation scores in localStorage
export function storePronunciationScore(topicId: number, wordId: number, score: number) {
  const key = `pronunciation_scores_topic_${topicId}`;
  const stored = localStorage.getItem(key);
  const scores = stored ? JSON.parse(stored) : {};
  scores[wordId] = score;
  localStorage.setItem(key, JSON.stringify(scores));
}

// Get pronunciation scores from localStorage
export function getPronunciationScores(topicId: number): Map<number, number> {
  const key = `pronunciation_scores_topic_${topicId}`;
  const stored = localStorage.getItem(key);
  const scores = stored ? JSON.parse(stored) : {};
  return new Map(Object.entries(scores).map(([k, v]) => [parseInt(k), v as number]));
}

// Store quick memorize completion
export function storeQuickMemorizeCompletion(topicId: number, wordIds: number[]) {
  const key = `quick_memorize_topic_${topicId}`;
  localStorage.setItem(key, JSON.stringify(wordIds));
}

// Get quick memorize completion
export function getQuickMemorizeCompletion(topicId: number): Set<number> {
  const key = `quick_memorize_topic_${topicId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    return new Set<number>();
  }
  
  try {
    const wordIds = JSON.parse(stored);
    // Đảm bảo wordIds là array và chỉ chứa numbers
    if (Array.isArray(wordIds)) {
      return new Set(wordIds.filter(id => typeof id === 'number'));
    }
    return new Set<number>();
  } catch (error) {
    console.error(`Lỗi khi parse quick memorize completion cho topic ${topicId}:`, error);
    return new Set<number>();
  }
}

// Store flashcard review
export function storeFlashcardReview(topicId: number, wordIds: number[]) {
  const key = `flashcard_review_topic_${topicId}`;
  localStorage.setItem(key, JSON.stringify(wordIds));
}

// Get flashcard review
export function getFlashcardReview(topicId: number): Set<number> {
  const key = `flashcard_review_topic_${topicId}`;
  const stored = localStorage.getItem(key);
  const wordIds = stored ? JSON.parse(stored) : [];
  return new Set(wordIds);
}

/**
 * Lấy progress của từng activity từ backend (không dựa trên vocabulary)
 * Mỗi activity có progress riêng được lưu trong UserActivityProgress
 */
export async function getActivitiesProgressFromBackend(
  topicId: number
): Promise<ActivityProgress[]> {
  try {
    // Lấy danh sách tất cả activities
    const allActivities = await getActivities(true);
    
    // Lấy danh sách activities đã hoàn thành từ backend cho topic này
    const completedActivities = await getCompletedActivities(undefined, undefined, topicId);
    const completedActivityIds = new Set(completedActivities.map(a => a.activityId));
    
    // Tạo progress cho từng activity
    // Mỗi activity được coi là một task riêng, không phụ thuộc vào vocabulary
    const activitiesProgress: ActivityProgress[] = [];
    
    for (const activity of allActivities) {
      const isCompleted = completedActivityIds.has(activity.id);
      
      // Mỗi activity được coi là một task riêng
      // completed = 1 nếu đã hoàn thành, 0 nếu chưa
      // Không tính dựa trên số từ vựng, mà chỉ dựa trên trạng thái IsCompleted trong UserActivityProgress
      activitiesProgress.push({
        activityId: activity.id,
        activityName: activity.displayName,
        completed: isCompleted ? 1 : 0,
        inProgress: 0, // Không có trạng thái "đang làm" cho activity, chỉ có completed hoặc not started
        notStarted: isCompleted ? 0 : 1,
        total: 1, // Mỗi activity là 1 task riêng biệt
      });
    }
    
    return activitiesProgress;
  } catch (error) {
    console.error("Error fetching activities progress from backend:", error);
    return [];
  }
}

/**
 * Lấy progress tổng thể của topic dựa trên activities (không dựa trên vocabulary)
 */
export async function getTopicProgressFromBackend(topicId: number): Promise<{
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
}> {
  try {
    const progress = await getTopicProgress(topicId);
    return {
      totalActivities: progress.totalActivities,
      completedActivities: progress.completedActivities,
      progressPercentage: progress.progressPercentage,
    };
  } catch (error) {
    console.error("Error fetching topic progress from backend:", error);
    return {
      totalActivities: 0,
      completedActivities: 0,
      progressPercentage: 0,
    };
  }
}

