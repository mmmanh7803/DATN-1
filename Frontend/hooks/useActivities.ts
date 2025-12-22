import { useState, useEffect, useMemo, useCallback } from 'react';
import { ActivityItem } from '@/components/vocabulary/LearningActivities';
import { getActivities, ActivityDto } from '@/lib/services/activityService';
import { createDefaultActivities } from '@/components/vocabulary/LearningActivities';

interface UseActivitiesOptions {
  topicId: number;
  activeId?: string;
  completedIds?: string[];
  activityProgressMap?: Map<string, number>;
  customLinks?: Record<string, string>;
  fallbackToDefault?: boolean;
}

export function useActivities({
  topicId,
  activeId,
  completedIds = [],
  activityProgressMap,
  customLinks = {},
  fallbackToDefault = true,
}: UseActivitiesOptions) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Tạo một key từ completedIds để trigger reload khi thay đổi
  // Sử dụng sort() trên một copy để tránh mutation
  const completedIdsKey = useMemo(() => [...completedIds].sort().join(','), [completedIds]);

  // Helper function để map activities (tách ra để reuse)
  const mapActivities = useCallback(async (completedIdsToUse: string[]) => {
    // Fetch activities from database
    const dbActivities = await getActivities(true);

    // Import icons
    const { createActivityIcons } = await import('@/components/vocabulary/LearningActivities');
    const icons = createActivityIcons();

    // Map activity ID to icon
    const getIconForActivity = (activityId: string): React.ReactNode => {
      const iconMap: Record<string, React.ReactNode> = {
        "vocabulary": icons.vocabulary,
        "quick-memorize": icons.quickMemorize,
        "image-quiz": icons.imageQuiz,
        "pronunciation": icons.pronunciation,
        "grammar": icons.grammar,
        "flashcard": icons.flashcard,
        "fill-blank": icons.fillBlank,
        "true-false": icons.trueFalse,
        "true-false-sentence": icons.trueFalseSentence,
        "listen-image": icons.listenImage,
        "match-sentence": icons.matchSentence,
        "conversation": icons.conversation,
        "reading": icons.reading,
        "statistics": icons.statistics,
      };
      return iconMap[activityId] || icons.vocabulary;
    };

    // Map activity ID to link
    const getActivityLink = (activityId: string): string | null => {
      if (customLinks && customLinks[activityId]) {
        return customLinks[activityId];
      }
      const linkMap: Record<string, string> = {
        "vocabulary": `/topics/${topicId}`,
        "quick-memorize": `/topics/${topicId}/quick-memorize`,
        "image-quiz": `/topics/${topicId}/image-quiz`,
        "pronunciation": `/topics/${topicId}/pronunciation`,
        "grammar": `/topics/${topicId}/grammar`,
        "progress": `/topics/${topicId}/progress`,
        "flashcard": `/topics/${topicId}/flashcard`,
        "vocabulary-practice": `/topics/${topicId}/vocabulary-practice`,
        "fill-blank": `/topics/${topicId}/fill-blank`,
        "statistics": `/topics/${topicId}/progress`,
      };
      return linkMap[activityId] || null;
    };

    // Helper function to get progress percentage
    const getProgressPercentage = (activityId: string): number | undefined => {
      if (completedIdsToUse.includes(activityId)) {
        return 100;
      }
      if (activityProgressMap?.has(activityId)) {
        return activityProgressMap.get(activityId);
      }
      return undefined;
    };

    // Map database activities to ActivityItem format
    const mappedActivities: ActivityItem[] = dbActivities
      .filter(activity => activity.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(activity => ({
        id: activity.id,
        name: activity.displayName || activity.name,
        icon: getIconForActivity(activity.id),
        link: getActivityLink(activity.id),
        isCompleted: completedIdsToUse.includes(activity.id),
        isActive: activeId === activity.id,
        progressPercentage: getProgressPercentage(activity.id),
      }));

    return mappedActivities;
  }, [topicId, activeId, customLinks, activityProgressMap]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const mappedActivities = await mapActivities(completedIds);
        setActivities(mappedActivities);
      } catch (err) {
        console.error('Error loading activities from database:', err);
        setError(err as Error);
        
        // Fallback to default activities if enabled
        if (fallbackToDefault) {
          const defaultActivities = createDefaultActivities({
            vocabularyLink: customLinks["vocabulary"] || `/topics/${topicId}`,
            quickMemorizeLink: customLinks["quick-memorize"] || `/topics/${topicId}/quick-memorize`,
            imageQuizLink: customLinks["image-quiz"] || `/topics/${topicId}/image-quiz`,
            pronunciationLink: customLinks["pronunciation"] || `/topics/${topicId}/pronunciation`,
            grammarLink: customLinks["grammar"] || `/topics/${topicId}/grammar`,
            progressLink: customLinks["progress"] || `/topics/${topicId}/progress`,
            flashcardLink: customLinks["flashcard"] || `/topics/${topicId}/flashcard`,
            vocabularyPracticeLink: customLinks["vocabulary-practice"] || `/topics/${topicId}/vocabulary-practice`,
            fillBlankLink: customLinks["fill-blank"] || `/topics/${topicId}/fill-blank`,
            activeId,
            completedIds,
            activityProgressMap,
          });
          setActivities(defaultActivities);
        }
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [topicId, activeId, completedIdsKey, fallbackToDefault, customLinks, activityProgressMap, mapActivities]);

  // Listen for activity-completed events để tự động refresh khi có activity hoàn thành (đồng bộ real-time)
  // Update activities ngay lập tức khi có activity hoàn thành
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleActivityCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventDetail = customEvent.detail;
      
      // Chỉ xử lý nếu event liên quan đến cùng topicId
      if (eventDetail && eventDetail.topicId === topicId && eventDetail.activityId) {
        // Optimistic update: Đánh dấu activity là completed ngay lập tức
        setActivities(prev => prev.map(a => {
          if (a.id === eventDetail.activityId) {
            return {
              ...a,
              isCompleted: true,
              progressPercentage: 100,
            };
          }
          return a;
        }));
      }
    };

    window.addEventListener("activity-completed", handleActivityCompleted);
    
    return () => {
      window.removeEventListener("activity-completed", handleActivityCompleted);
    };
  }, [topicId]);

  return { activities, loading, error };
}
