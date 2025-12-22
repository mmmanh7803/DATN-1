"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { topicService } from "@/lib/services/topicService";
import { useCompletedActivities } from "@/hooks/useCompletedActivities";
import { useToast } from "@/contexts/ToastContext";
import { LessonTopicDto, WordWithProgressDto } from "@/types";
import LearningActivities from "@/components/vocabulary/LearningActivities";
import { useActivities } from "@/hooks/useActivities";
import FillInBlankActivity from "@/components/vocabulary/FillInBlankActivity";
import ActivityPageLayout from "@/components/activities/ActivityPageLayout";

export default function FillInBlankPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);
  const toast = useToast();

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordWithProgressDto[]>([]);

  // Sử dụng hook để quản lý completed activities
  const { completedActivityIds, markActivityCompleted } = useCompletedActivities({ topicId });

  useEffect(() => {
    if (topicId) {
      loadData();
    }
  }, [topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);

      if (topicData.words && topicData.words.length > 0) {
        setWords(topicData.words);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Chủ đề từ vựng không tồn tại.");
        router.push("/vocabulary");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (result: { correct: number; total: number; score: number }) => {
    await markActivityCompleted("fill-blank", result.score);
  };

  // Load activities from database
  const { activities } = useActivities({
    topicId,
      activeId: "fill-blank",
      completedIds: completedActivityIds,
    });

  // Tính progress dựa trên activities (hoạt động học) của lesson topic
  // Dùng useMemo để đảm bảo tính lại khi activities thay đổi
  const totalActivities = useMemo(() => activities.length, [activities]);
  const completedActivities = useMemo(() => activities.filter(a => a.isCompleted).length, [activities]);

  const errorMessage = !topic || words.length === 0 
    ? "Không có từ vựng nào trong chủ đề này." 
    : null;

  return (
    <ActivityPageLayout
      activityId="fill-blank"
      topicId={topicId}
      topicTitle={topic?.title || `Chủ đề ${topicId}`}
      loading={loading}
      error={errorMessage}
      sidebar={
                <LearningActivities
                  activities={activities}
                  title={topic?.title || "Hán Ngữ"}
                  completedCount={completedActivities}
                  totalCount={totalActivities}
                  maxHeight="calc(100vh - 200px)"
                />
      }
    >
      {topic && words.length > 0 && (
        <FillInBlankActivity
          words={words}
          onComplete={handleComplete}
        />
      )}
    </ActivityPageLayout>
  );
}

