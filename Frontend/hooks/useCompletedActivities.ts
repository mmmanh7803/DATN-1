import { useState, useEffect, useCallback } from "react";
import { getCompletedActivities, completeActivity } from "@/lib/services/activityService";

interface UseCompletedActivitiesOptions {
  hskLevel?: number;
  partNumber?: number;
  topicId?: number;
  autoRefresh?: boolean; // Tự động refresh khi có thay đổi
}

export function useCompletedActivities(options: UseCompletedActivitiesOptions = {}) {
  const { hskLevel, partNumber, topicId, autoRefresh = true } = options;
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  // Initial load
  useEffect(() => {
    loadCompletedActivities();
  }, [loadCompletedActivities]);

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
  };
}

