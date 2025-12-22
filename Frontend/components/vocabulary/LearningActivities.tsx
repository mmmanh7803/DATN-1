"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ActivityItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  progressPercentage?: number; // Phần trăm hoàn thành (0-100)
  link?: string | null;
  onClick?: () => void;
}

interface LearningActivitiesProps {
  activities: ActivityItem[];
  title?: string;
  completedCount?: number;
  totalCount?: number;
  className?: string;
  maxHeight?: string;
  defaultExpanded?: boolean;
}

export default function LearningActivities({
  activities,
  title = "Hán Ngữ",
  completedCount,
  totalCount,
  className = "",
  maxHeight = "calc(100vh-400px)",
  defaultExpanded = true,
}: LearningActivitiesProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.onClick) {
      activity.onClick();
    } else if (activity.link) {
      router.push(activity.link);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header với toggle button */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            )}
            {(completedCount !== undefined && totalCount !== undefined && totalCount > 0) && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Hoạt động học: {completedCount}/{totalCount}</span>
                  <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      completedCount >= totalCount ? "bg-green-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, Math.round((completedCount / totalCount) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6">
          {/* Learning Activities List */}
          <div
            className="space-y-2 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar"
            style={{ 
              maxHeight,
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            }}
          >
        {activities.map((activity) => {
          const isClickable = activity.link || activity.onClick;
          const Component = isClickable ? "div" : "div";

          return (
            <Component
              key={activity.id}
              onClick={() => isClickable && handleActivityClick(activity)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                activity.isActive
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : isClickable
                  ? "hover:bg-gray-50 cursor-pointer"
                  : ""
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  activity.isActive ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {activity.icon}
              </div>
              <span
                className={`flex-1 text-sm ${
                  activity.isActive
                    ? "font-medium text-blue-900"
                    : "text-gray-700"
                }`}
              >
                {activity.name}
              </span>
              {/* Hiển thị dấu tích xanh khi đạt 100% hoặc isCompleted = true */}
              {(activity.isCompleted || (activity.progressPercentage !== undefined && activity.progressPercentage >= 100)) && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {activity.link && (
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </Component>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to create default activity icons
export const createActivityIcons = () => ({
  vocabulary: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  quickMemorize: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  trueFalse: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  trueFalseSentence: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  listenImage: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  ),
  matchSentence: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  fillBlank: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
  flashcard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  conversation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  reading: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  grammar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  statistics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  imageQuiz: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  pronunciation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  ),
});

// Helper function to map activity ID to link template
const getActivityLink = (activityId: string, topicId: number): string | null => {
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
  };
  return linkMap[activityId] || null;
};

// Helper function to create activities from database data
export const createActivitiesFromDatabase = async (
  topicId: number,
  options?: {
    activeId?: string;
    completedIds?: string[];
    activityProgressMap?: Map<string, number>;
    customLinks?: Record<string, string>;
  }
): Promise<ActivityItem[]> => {
  const icons = createActivityIcons();
  const {
    activeId,
    completedIds = [],
    activityProgressMap,
    customLinks = {},
  } = options || {};

  try {
    // Import activityService dynamically to avoid circular dependency
    const { getActivities } = await import('@/lib/services/activityService');
    
    // Fetch activities from database (only active ones)
    const dbActivities = await getActivities(true);
    
    // Helper function to get icon from activity ID
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

    // Helper function to get progress percentage
    const getProgressPercentage = (activityId: string): number | undefined => {
      if (completedIds.includes(activityId)) {
        return 100;
      }
      if (activityProgressMap?.has(activityId)) {
        return activityProgressMap.get(activityId);
      }
      return undefined;
    };

    // Map database activities to ActivityItem format
    return dbActivities
      .filter(activity => activity.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(activity => ({
        id: activity.id,
        name: activity.displayName || activity.name,
        icon: getIconForActivity(activity.id),
        link: customLinks[activity.id] || getActivityLink(activity.id, topicId),
        isCompleted: completedIds.includes(activity.id),
        isActive: activeId === activity.id,
        progressPercentage: getProgressPercentage(activity.id),
      }));
  } catch (error) {
    console.error('Error fetching activities from database, falling back to default:', error);
    // Fallback to default activities if API fails
    return createDefaultActivities({
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
  }
};

// Helper function to create default activities list
export const createDefaultActivities = (
  options?: {
    vocabularyLink?: string;
    quickMemorizeLink?: string;
    imageQuizLink?: string;
    pronunciationLink?: string;
    grammarLink?: string;
    progressLink?: string;
    flashcardLink?: string;
    vocabularyPracticeLink?: string;
    fillBlankLink?: string;
    activeId?: string;
    completedIds?: string[];
    activityProgressMap?: Map<string, number>; // Map activityId -> progressPercentage
  }
): ActivityItem[] => {
  const icons = createActivityIcons();
  const {
    vocabularyLink,
    quickMemorizeLink,
    imageQuizLink,
    pronunciationLink,
    grammarLink,
    progressLink,
    flashcardLink,
    vocabularyPracticeLink,
    fillBlankLink,
    activeId,
    completedIds = [],
    activityProgressMap,
  } = options || {};

  // Helper function to get progress percentage
  const getProgressPercentage = (activityId: string): number | undefined => {
    // Nếu có trong completedIds thì 100%
    if (completedIds.includes(activityId)) {
      return 100;
    }
    // Nếu có trong activityProgressMap thì dùng giá trị đó
    if (activityProgressMap?.has(activityId)) {
      return activityProgressMap.get(activityId);
    }
    return undefined;
  };

  return [
    {
      id: "vocabulary",
      name: "Từ vựng",
      icon: icons.vocabulary,
      link: vocabularyLink || null,
      isCompleted: completedIds.includes("vocabulary"),
      isActive: activeId === "vocabulary",
      progressPercentage: getProgressPercentage("vocabulary"),
    },
    {
      id: "quick-memorize",
      name: "Nhớ nhanh từ",
      icon: icons.quickMemorize,
      link: quickMemorizeLink || null,
      isCompleted: completedIds.includes("quick-memorize"),
      isActive: activeId === "quick-memorize",
      progressPercentage: getProgressPercentage("quick-memorize"),
    },
    {
      id: "image-quiz",
      name: "Kiểm tra từ vựng bằng hình ảnh",
      icon: icons.imageQuiz,
      link: imageQuizLink || null,
      isCompleted: completedIds.includes("image-quiz"),
      isActive: activeId === "image-quiz",
      progressPercentage: getProgressPercentage("image-quiz"),
    },
    {
      id: "vocabulary-practice",
      name: "Thực hành từ vựng (Đúng/Sai)",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: vocabularyPracticeLink || null,
      isCompleted: completedIds.includes("vocabulary-practice"),
      isActive: activeId === "vocabulary-practice",
      progressPercentage: getProgressPercentage("vocabulary-practice"),
    },
    {
      id: "fill-blank",
      name: "Điền từ vào chỗ trống",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      link: fillBlankLink || null,
      isCompleted: completedIds.includes("fill-blank"),
      isActive: activeId === "fill-blank",
      progressPercentage: getProgressPercentage("fill-blank"),
    },
    {
      id: "pronunciation",
      name: "Luyện phát âm",
      icon: icons.pronunciation,
      link: pronunciationLink || null,
      isCompleted: completedIds.includes("pronunciation"),
      isActive: activeId === "pronunciation",
      progressPercentage: getProgressPercentage("pronunciation"),
    },
    {
      id: "true-false",
      name: "Chọn đúng sai",
      icon: icons.trueFalse,
      isCompleted: completedIds.includes("true-false"),
      isActive: activeId === "true-false",
      progressPercentage: getProgressPercentage("true-false"),
    },
    {
      id: "true-false-sentence",
      name: "Chọn đúng sai với câu",
      icon: icons.trueFalseSentence,
      isCompleted: completedIds.includes("true-false-sentence"),
      isActive: activeId === "true-false-sentence",
      progressPercentage: getProgressPercentage("true-false-sentence"),
    },
    {
      id: "listen-image",
      name: "Nghe câu chọn hình ảnh",
      icon: icons.listenImage,
      isCompleted: completedIds.includes("listen-image"),
      isActive: activeId === "listen-image",
      progressPercentage: getProgressPercentage("listen-image"),
    },
    {
      id: "match-sentence",
      name: "Ghép câu",
      icon: icons.matchSentence,
      isCompleted: completedIds.includes("match-sentence"),
      isActive: activeId === "match-sentence",
      progressPercentage: getProgressPercentage("match-sentence"),
    },
    {
      id: "flashcard",
      name: "Flash card từ vựng",
      icon: icons.flashcard,
      link: flashcardLink || null,
      isCompleted: completedIds.includes("flashcard"),
      isActive: activeId === "flashcard",
      progressPercentage: getProgressPercentage("flashcard"),
    },
    {
      id: "conversation",
      name: "Hội thoại",
      icon: icons.conversation,
      isCompleted: completedIds.includes("conversation"),
      isActive: activeId === "conversation",
      progressPercentage: getProgressPercentage("conversation"),
    },
    {
      id: "reading",
      name: "Đọc hiểu",
      icon: icons.reading,
      isCompleted: completedIds.includes("reading"),
      isActive: activeId === "reading",
      progressPercentage: getProgressPercentage("reading"),
    },
    {
      id: "grammar",
      name: "Ngữ pháp",
      icon: icons.grammar,
      link: grammarLink || null,
      isCompleted: completedIds.includes("grammar"),
      isActive: activeId === "grammar",
      progressPercentage: getProgressPercentage("grammar"),
    },
    {
      id: "statistics",
      name: "Thống kê tiến độ",
      icon: icons.statistics,
      link: progressLink || null,
      isCompleted: false,
      isActive: activeId === "statistics",
      progressPercentage: undefined, // Statistics không có progress
    },
  ];
};

