import apiClient from '../api';
import { API_ENDPOINTS } from '../api-endpoints';
import Cookies from 'js-cookie';

export interface ActivityDto {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  category?: string;
  requiresScore: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface ActivitiesResponse {
  activities: ActivityDto[];
  count: number;
}

export interface CompleteActivityRequest {
  hskLevel?: number;
  partNumber?: number;
  topicId?: number;
  activityId: string;
  score?: number;
}

export interface CheckVocabularyRequest {
  hskLevel?: number;
  partNumber?: number;
  topicId?: number;
}

export interface ActivityProgressResponse {
  activityId: string;
  isCompleted: boolean;
  score?: number;
  completedAt?: string;
}

export interface CanAccessPartResponse {
  canAccess: boolean;
  reason: string;
  previousPart?: number;
  completedActivities?: number;
  totalActivities?: number;
}

export interface TopicProgressResponse {
  topicId: number;
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
}

/**
 * Đánh dấu một activity đã hoàn thành
 */
export const completeActivity = async (request: CompleteActivityRequest): Promise<any> => {
  console.log("[ActivityService] Marking activity as completed:", request);
  
  // Validate request
  if (!request.activityId) {
    throw new Error("ActivityId is required");
  }
  
  if (!request.topicId && (!request.hskLevel || !request.partNumber)) {
    throw new Error("Either topicId or (hskLevel + partNumber) is required");
  }
  
  // Kiểm tra authentication token
  if (typeof window !== "undefined") {
    const token = Cookies.get("authToken");
    if (!token) {
      const error = new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập để lưu tiến độ.");
      console.error("[ActivityService] No auth token found");
      throw error;
    }
    console.log("[ActivityService] Auth token found:", token.substring(0, 20) + "...");
  }
  
  try {
    const endpoint = API_ENDPOINTS.ACTIVITY_PROGRESS.COMPLETE;
    console.log("[ActivityService] Calling API:", endpoint);
    console.log("[ActivityService] Request payload:", JSON.stringify(request, null, 2));
    
    const response = await apiClient.post(endpoint, request);
    
    console.log("[ActivityService] Activity marked as completed successfully:", response.data);
    console.log("[ActivityService] Response status:", response.status);
    
    return response.data;
  } catch (error: any) {
    console.error("[ActivityService] Error marking activity as completed:", error);
    console.error("[ActivityService] Request was:", JSON.stringify(request, null, 2));
    console.error("[ActivityService] Error status:", error.response?.status);
    console.error("[ActivityService] Error response:", error.response?.data);
    console.error("[ActivityService] Error message:", error.message);
    
    // Throw error với thông tin chi tiết hơn
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || error.response.data?.error || "Lỗi server";
      throw new Error(`${errorMessage} (Status: ${error.response.status})`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    } else {
      // Something else happened
      throw new Error(error.message || "Lỗi không xác định");
    }
  }
};

/**
 * Kiểm tra xem activity đã hoàn thành chưa
 */
export const checkActivityCompleted = async (
  activityId: string,
  hskLevel?: number,
  partNumber?: number,
  topicId?: number
): Promise<{ activityId: string; isCompleted: boolean }> => {
  const params = new URLSearchParams();
  params.append('activityId', activityId);
  if (hskLevel) params.append('hskLevel', hskLevel.toString());
  if (partNumber) params.append('partNumber', partNumber.toString());
  if (topicId) params.append('topicId', topicId.toString());

  const response = await apiClient.get<{ activityId: string; isCompleted: boolean }>(
    `${API_ENDPOINTS.ACTIVITY_PROGRESS.CHECK_COMPLETED}?${params.toString()}`
  );
  return response.data;
};

/**
 * Lấy danh sách activities đã hoàn thành
 */
export const getCompletedActivities = async (
  hskLevel?: number,
  partNumber?: number,
  topicId?: number
): Promise<ActivityProgressResponse[]> => {
  const params = new URLSearchParams();
  if (hskLevel) params.append('hskLevel', hskLevel.toString());
  if (partNumber) params.append('partNumber', partNumber.toString());
  if (topicId) params.append('topicId', topicId.toString());

  const endpoint = API_ENDPOINTS.ACTIVITY_PROGRESS.COMPLETED_LIST;
  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
  
  console.log("[ActivityService] Getting completed activities:", { hskLevel, partNumber, topicId });
  console.log("[ActivityService] Calling API:", url);
  
  try {
    const response = await apiClient.get<ActivityProgressResponse[]>(url);
    console.log("[ActivityService] Received completed activities:", response.data);
    console.log("[ActivityService] Response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("[ActivityService] Error getting completed activities:", error);
    console.error("[ActivityService] Error status:", error.response?.status);
    console.error("[ActivityService] Error response:", error.response?.data);
    console.error("[ActivityService] Error message:", error.message);
    throw error;
  }
};

/**
 * Kiểm tra và tự động đánh dấu activity "vocabulary" nếu tất cả từ đã học
 * Frontend gọi API này sau khi user đánh dấu từ cuối cùng là "đã học"
 */
export const checkAndMarkVocabulary = async (
  request: CheckVocabularyRequest
): Promise<{ marked: boolean; message: string }> => {
  console.log("[ActivityService] Checking and marking vocabulary activity:", request);
  
  try {
    const endpoint = API_ENDPOINTS.ACTIVITY_PROGRESS.CHECK_AND_MARK_VOCABULARY;
    console.log("[ActivityService] Calling API:", endpoint);
    console.log("[ActivityService] Request payload:", JSON.stringify(request, null, 2));
    
    const response = await apiClient.post<{ marked: boolean; message: string }>(
      endpoint,
      request
    );
    
    console.log("[ActivityService] checkAndMarkVocabulary response:", response.data);
    console.log("[ActivityService] Response status:", response.status);
    
    return response.data;
  } catch (error: any) {
    console.error("[ActivityService] Error checking and marking vocabulary:", error);
    console.error("[ActivityService] Error status:", error.response?.status);
    console.error("[ActivityService] Error response:", error.response?.data);
    console.error("[ActivityService] Error message:", error.message);
    throw error;
  }
};

/**
 * Kiểm tra xem user có thể truy cập part này không (prerequisite check)
 * Part N unlock khi part N-1 đã hoàn thành 100% activities
 */
export const canAccessPart = async (
  hskLevel: number,
  partNumber: number
): Promise<CanAccessPartResponse> => {
  const response = await apiClient.get<CanAccessPartResponse>(
    `/api/activities/can-access-part?hskLevel=${hskLevel}&partNumber=${partNumber}`
  );
  return response.data;
};

/**
 * Lấy danh sách tất cả activities từ database
 */
export const getActivities = async (isActive?: boolean): Promise<ActivityDto[]> => {
  const response = await apiClient.get<ActivitiesResponse>(
    API_ENDPOINTS.ACTIVITIES.LIST(isActive)
  );
  return response.data.activities;
};

/**
 * Lấy thông tin một activity theo ID
 */
export const getActivityById = async (id: string): Promise<ActivityDto> => {
  const response = await apiClient.get<ActivityDto>(
    API_ENDPOINTS.ACTIVITIES.BY_ID(id)
  );
  return response.data;
};

/**
 * Lấy progress của tất cả activities trong topic
 */
export const getTopicProgress = async (topicId: number): Promise<TopicProgressResponse> => {
  const response = await apiClient.get<TopicProgressResponse>(
    API_ENDPOINTS.ACTIVITY_PROGRESS.TOPIC_PROGRESS(topicId)
  );
  return response.data;
};

