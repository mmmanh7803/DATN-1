"use client";

import { useMemo } from "react";

export interface ActivityProgress {
  activityId: string;
  activityName: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

interface ActivityProgressChartProps {
  progress: ActivityProgress;
  showDetails?: boolean;
}

export default function ActivityProgressChart({
  progress,
  showDetails = true,
}: ActivityProgressChartProps) {
  // Validate và normalize progress data để tránh lỗi
  const safeProgress = useMemo(() => {
    if (!progress) {
      return {
        activityId: "",
        activityName: "Từ vựng",
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        total: 0,
      };
    }
    
    return {
      activityId: progress.activityId || "",
      activityName: progress.activityName || "Từ vựng",
      completed: Number(progress.completed) || 0,
      inProgress: Number(progress.inProgress) || 0,
      notStarted: Number(progress.notStarted) || 0,
      total: Number(progress.total) || 0,
    };
  }, [progress]);

  const completionPercentage = useMemo(() => {
    if (safeProgress.total === 0) return 0;
    const percentage = (safeProgress.completed / safeProgress.total) * 100;
    return Math.round(Math.max(0, Math.min(100, percentage)));
  }, [safeProgress.completed, safeProgress.total]);

  const inProgressPercentage = useMemo(() => {
    if (safeProgress.total === 0) return 0;
    const percentage = (safeProgress.inProgress / safeProgress.total) * 100;
    return Math.round(Math.max(0, Math.min(100, percentage)));
  }, [safeProgress.inProgress, safeProgress.total]);

  const notStartedPercentage = useMemo(() => {
    if (safeProgress.total === 0) return 0;
    const percentage = (safeProgress.notStarted / safeProgress.total) * 100;
    return Math.round(Math.max(0, Math.min(100, percentage)));
  }, [safeProgress.notStarted, safeProgress.total]);

  // Calculate stroke dasharray for the circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const completedOffset = circumference - (completionPercentage / 100) * circumference;
  const inProgressOffset = completedOffset - (inProgressPercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {safeProgress.activityName}
      </h3>
      
      <div className="flex items-center gap-6">
        {/* Circular Progress Chart */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
            />
            
            {/* Not started (gray) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
            
            {/* In progress (yellow/orange) */}
            {inProgressPercentage > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={completedOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
            
            {/* Completed (green) */}
            {completionPercentage > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={completedOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">
              {completionPercentage}%
            </div>
            <div className="text-xs text-gray-500">Hoàn thành</div>
          </div>
        </div>

        {/* Legend and Statistics */}
        {showDetails && (
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Đã làm</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {safeProgress.completed} ({completionPercentage}%)
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Đang làm</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {safeProgress.inProgress} ({inProgressPercentage}%)
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-700">Chưa làm</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {safeProgress.notStarted} ({notStartedPercentage}%)
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Tổng số</span>
                <span className="text-xs font-semibold text-gray-900">{safeProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full flex">
                  {completionPercentage > 0 && (
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  )}
                  {inProgressPercentage > 0 && (
                    <div
                      className="bg-yellow-500 transition-all duration-500"
                      style={{ width: `${inProgressPercentage}%` }}
                    />
                  )}
                  {notStartedPercentage > 0 && (
                    <div
                      className="bg-gray-400 transition-all duration-500"
                      style={{ width: `${notStartedPercentage}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for multiple activities
interface AllActivitiesProgressProps {
  activities: ActivityProgress[];
}

export function AllActivitiesProgress({ activities }: AllActivitiesProgressProps) {
  const totalStats = useMemo(() => {
    const total = activities.reduce((sum, act) => sum + act.total, 0);
    const completed = activities.reduce((sum, act) => sum + act.completed, 0);
    const inProgress = activities.reduce((sum, act) => sum + act.inProgress, 0);
    const notStarted = activities.reduce((sum, act) => sum + act.notStarted, 0);
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-primary-light to-primary rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Tổng quan tiến độ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalStats.completionPercentage}%</div>
            <div className="text-sm opacity-90">Hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalStats.completed}</div>
            <div className="text-sm opacity-90">Đã làm</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalStats.inProgress}</div>
            <div className="text-sm opacity-90">Đang làm</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalStats.notStarted}</div>
            <div className="text-sm opacity-90">Chưa làm</div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div className="h-full flex">
              {totalStats.completionPercentage > 0 && (
                <div
                  className="bg-green-400 transition-all duration-500"
                  style={{ width: `${Math.round((totalStats.completed / totalStats.total) * 100)}%` }}
                />
              )}
              {totalStats.inProgress > 0 && (
                <div
                  className="bg-yellow-400 transition-all duration-500"
                  style={{ width: `${Math.round((totalStats.inProgress / totalStats.total) * 100)}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map((activity) => (
          <ActivityProgressChart
            key={activity.activityId}
            progress={activity}
            showDetails={true}
          />
        ))}
      </div>
    </div>
  );
}

