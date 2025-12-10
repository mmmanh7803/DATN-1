"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles = {
    success: {
      container: "bg-gradient-to-r from-emerald-500 to-green-600",
      icon: "text-emerald-100",
      progress: "bg-emerald-200/50",
    },
    error: {
      container: "bg-gradient-to-r from-red-500 to-rose-600",
      icon: "text-red-100",
      progress: "bg-red-200/50",
    },
    warning: {
      container: "bg-gradient-to-r from-amber-500 to-orange-500",
      icon: "text-amber-100",
      progress: "bg-amber-200/50",
    },
    info: {
      container: "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: "text-blue-100",
      progress: "bg-blue-200/50",
    },
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl shadow-2xl transform transition-all duration-300 ease-out
        ${styles[type].container}
        ${isExiting 
          ? "translate-x-full opacity-0 scale-95" 
          : "translate-x-0 opacity-100 scale-100"
        }
        animate-slideIn
      `}
      style={{
        minWidth: "320px",
        maxWidth: "420px",
      }}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles[type].icon} mt-0.5`}>
          {icons[type]}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed break-words">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-black/10">
        <div
          className={`h-full ${styles[type].progress} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

