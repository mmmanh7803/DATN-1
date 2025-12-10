import { useState, useEffect, useCallback } from "react";
import { getCompletedActivities, completeActivity } from "@/lib/services/activityService";
import { topicService, TopicCompletedStatus, UnlockNextTopicResult } from "@/lib/services/topicService";

interface UseCompletedActivitiesOptions {
  hskLevel?: number;
  partNumber?: number;
  topicId?: number;
  autoRefresh?: boolean; // Tự động refresh khi có thay đổi
  autoCheckUnlock?: boolean; // Tự động kiểm tra mở khóa topic tiếp theo
}

export function useCompletedActivities(options: UseCompletedActivitiesOptions = {}) {
  const { hskLevel, partNumber, topicId, autoRefresh = true, autoCheckUnlock = true } = options;
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [topicCompletedStatus, setTopicCompletedStatus] = useState<TopicCompletedStatus | null>(null);
  const [unlockResult, setUnlockResult] = useState<UnlockNextTopicResult | null>(null);

  // Load completed activities
  const loadCompletedActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const completedActivities = await getCompletedActivities(hskLevel, partNumber, topicId);
      const completedIds = completedActivities.map(a => a.activityId);
      setCompletedActivityIds(completedIds);
      return completedIds;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load completed activities");
      setError(error);
      console.error("Error loading completed activities:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [hskLevel, partNumber, topicId]);

  // Mark activity as completed
  const markActivityCompleted = useCallback(async (
    activityId: string,
    score?: number
  ) => {
    try {
      await completeActivity({
        hskLevel,
        partNumber,
        topicId,
        activityId,
        score,
      });
      
      // Cập nhật local state ngay lập tức
      setCompletedActivityIds(prev => {
        if (!prev.includes(activityId)) {
          return [...prev, activityId];
        }
        return prev;
      });

      // Dispatch custom event để các component khác biết có thay đổi
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("activity-completed", {
          detail: { activityId, topicId, hskLevel, partNumber }
        }));
      }

      // Reload từ server để đảm bảo đồng bộ
      if (autoRefresh) {
        await loadCompletedActivities();
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to mark activity as completed");
      setError(error);
      console.error("Error marking activity as completed:", error);
      return false;
    }
  }, [hskLevel, partNumber, topicId, autoRefresh, loadCompletedActivities]);

  // Check if activity is completed
  const isActivityCompleted = useCallback((activityId: string) => {
    return completedActivityIds.includes(activityId);
  }, [completedActivityIds]);
  
  // Kiểm tra xem topic đã hoàn thành chưa
  const checkTopicCompleted = useCallback(async () => {
    if (!topicId) return null;
    
    try {
      const status = await topicService.isTopicCompleted(topicId);
      setTopicCompletedStatus(status);
      return status;
    } catch (err) {
      console.error("Error checking topic completed:", err);
      return null;
    }
  }, [topicId]);
  
  // Kiểm tra và mở khóa topic tiếp theo
  const checkAndUnlockNextTopic = useCallback(async () => {
    if (!topicId) return null;
    
    try {
      const result = await topicService.checkAndUnlockNextTopic(topicId);
      setUnlockResult(result);
      
      // Dispatch event để thông báo unlock
      if (result.unlocked && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("topic-unlocked", {
          detail: { 
            unlockedTopicId: result.nextTopicId,
            unlockedTopicTitle: result.nextTopicTitle,
            completedTopicId: topicId
          }
        }));
      }
      
      return result;
    } catch (err) {
      console.error("Error checking and unlocking next topic:", err);
      return null;
    }
  }, [topicId]);

  // Initial load
  useEffect(() => {
    loadCompletedActivities();
  }, [loadCompletedActivities]);
  
  // Auto check topic completed và unlock khi completedActivityIds thay đổi
  useEffect(() => {
    if (!topicId || !autoCheckUnlock) return;
    
    // Kiểm tra xem đã hoàn thành đủ activities chưa
    const checkAndUnlock = async () => {
      const status = await checkTopicCompleted();
      
      if (status?.isCompleted) {
        // Tự động kiểm tra và mở khóa topic tiếp theo
        await checkAndUnlockNextTopic();
      }
    };
    
    // Chỉ check khi có activities đã hoàn thành
    if (completedActivityIds.length > 0) {
      checkAndUnlock();
    }
  }, [topicId, completedActivityIds, autoCheckUnlock, checkTopicCompleted, checkAndUnlockNextTopic]);

  // Listen for storage events để đồng bộ giữa các tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      // Nếu có thay đổi về completed activities, reload
      if (e.key?.includes("activity") || e.key?.includes("completed")) {
        loadCompletedActivities();
      }
    };

    // Listen for custom events để đồng bộ trong cùng tab
    // Chỉ reload nếu event liên quan đến cùng topicId, hskLevel, partNumber
    const handleActivityCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventDetail = customEvent.detail;
      
      if (!eventDetail) return;
      
      // Kiểm tra xem event có liên quan đến context hiện tại không
      let shouldReload = false;
      
      // Nếu hook này được dùng với topicId
      if (topicId) {
        shouldReload = eventDetail.topicId === topicId;
      }
      // Nếu hook này được dùng với hskLevel + partNumber
      else if (hskLevel && partNumber) {
        shouldReload = eventDetail.hskLevel === hskLevel && eventDetail.partNumber === partNumber;
      }
      // Nếu không có filter nào, reload tất cả (trường hợp hiếm)
      else {
        shouldReload = true;
      }
      
      if (shouldReload) {
        // Cập nhật local state ngay lập tức nếu activityId chưa có
        if (eventDetail.activityId) {
          setCompletedActivityIds(prev => {
            if (!prev.includes(eventDetail.activityId)) {
              return [...prev, eventDetail.activityId];
            }
            return prev;
          });
        }
        
        // Reload từ server để đảm bảo đồng bộ
        loadCompletedActivities();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("activity-completed", handleActivityCompleted);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("activity-completed", handleActivityCompleted);
    };
  }, [loadCompletedActivities, topicId, hskLevel, partNumber]);

  return {
    completedActivityIds,
    loading,
    error,
    loadCompletedActivities,
    markActivityCompleted,
    isActivityCompleted,
    // Topic completion tracking
    topicCompletedStatus,
    checkTopicCompleted,
    checkAndUnlockNextTopic,
    unlockResult,
  };
}

