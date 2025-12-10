'use client';

interface ExamHeaderProps {
  examTitle: string;
  timeRemaining: number;
  onBackClick: () => void;
  onToggleSidebar: () => void;
  onSubmit: () => void;
}

export default function ExamHeader({
  examTitle,
  timeRemaining,
  onBackClick,
  onToggleSidebar,
  onSubmit,
}: ExamHeaderProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRunningOut = timeRemaining < 300; // Less than 5 minutes

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back button */}
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Trở về</span>
          </button>

          {/* Center: Title & Timer */}
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-gray-900 hidden md:block">{examTitle}</h1>
            
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                isTimeRunningOut
                  ? 'bg-red-50 text-red-600 animate-pulse'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Right: Menu & Submit buttons */}
          <div className="flex items-center gap-2">
            {/* Sidebar toggle - Mobile only */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="font-medium">Danh sách</span>
            </button>

            {/* Submit button */}
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn nộp bài không?')) {
                  onSubmit();
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <span>Nộp bài</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

