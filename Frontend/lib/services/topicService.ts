import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { LessonTopicListDto, LessonTopicDto } from "@/types";

export interface TopicUnlockStatus {
  topicId: number;
  isLocked: boolean;
  canAccess?: boolean;
  reason?: string;
  prerequisiteTopicId?: number;
  prerequisiteProgress?: {
    completedCount: number;
    totalRequired: number;
    percentage: number;
  };
}

export interface TopicCompletedStatus {
  topicId: number;
  isCompleted: boolean;
  completedActivities: string[];
  requiredActivities: string[];
  completedCount: number;
  totalRequired: number;
}

export interface UnlockNextTopicResult {
  unlocked: boolean;
  message: string;
  nextTopicId?: number;
  nextTopicTitle?: string;
  isLevelCompleted?: boolean;
  completedActivities?: string[];
  requiredActivities?: string[];
  completedCount?: number;
  totalRequired?: number;
}

export interface RequiredActivitiesInfo {
  requiredActivities: string[];
  count: number;
  description: string;
}

export const topicService = {
  // Lấy danh sách chủ đề theo cấp độ HSK
  getTopicsByHSKLevel: async (hskLevel: number): Promise<LessonTopicListDto[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_TOPICS.BY_HSK_LEVEL(hskLevel));
    return response.data;
  },

  // Lấy chi tiết chủ đề
  getTopicById: async (id: number): Promise<LessonTopicDto> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_TOPICS.BY_ID(id));
    return response.data;
  },

  // Kiểm tra trạng thái mở khóa
  getUnlockStatus: async (id: number): Promise<TopicUnlockStatus> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_TOPICS.UNLOCK_STATUS(id));
    return response.data;
  },
  
  // Kiểm tra xem user có thể truy cập topic không
  canAccessTopic: async (topicId: number): Promise<{
    topicId: number;
    canAccess: boolean;
    reason: string;
    requiredActivities: string[];
    totalRequiredActivities: number;
  }> => {
    const response = await apiClient.get(API_ENDPOINTS.ACTIVITY_PROGRESS.CAN_ACCESS_TOPIC(topicId));
    return response.data;
  },
  
  // Kiểm tra xem topic đã hoàn thành chưa
  isTopicCompleted: async (topicId: number): Promise<TopicCompletedStatus> => {
    const response = await apiClient.get(API_ENDPOINTS.ACTIVITY_PROGRESS.TOPIC_COMPLETED(topicId));
    return response.data;
  },
  
  // Kiểm tra và mở khóa topic tiếp theo
  checkAndUnlockNextTopic: async (completedTopicId: number): Promise<UnlockNextTopicResult> => {
    const response = await apiClient.post(API_ENDPOINTS.ACTIVITY_PROGRESS.CHECK_AND_UNLOCK_NEXT_TOPIC, {
      completedTopicId
    });
    return response.data;
  },
  
  // Lấy danh sách required activities
  getRequiredActivities: async (): Promise<RequiredActivitiesInfo> => {
    const response = await apiClient.get(API_ENDPOINTS.ACTIVITY_PROGRESS.REQUIRED_ACTIVITIES);
    return response.data;
  },
};

