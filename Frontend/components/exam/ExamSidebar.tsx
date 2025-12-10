'use client';

import { Question } from '@/types/exam';

interface SectionInfo {
  name: string;
  skillType: string;
  questions: Question[];
  answeredCount: number;
}

interface ExamSidebarProps {
  sections: SectionInfo[];
  currentQuestionOrder: number;
  onQuestionClick: (order: number) => void;
  isOpen: boolean;
  onClose: () => void;
  getQuestionStatus: (order: number) => 'answered' | 'current' | 'unanswered';
}

export default function ExamSidebar({
  sections,
  currentQuestionOrder,
  onQuestionClick,
  isOpen,
  onClose,
  getQuestionStatus,
}: ExamSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-80 bg-white border-r border-gray-200 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col h-full
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Danh sách câu hỏi</h2>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section header */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  {section.skillType === 'Listening' ? (
                    <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  )}
                  <h3 className="font-medium text-gray-700 text-sm">{section.skillType}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {section.answeredCount}/{section.questions.length}
                  </span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        section.skillType === 'Listening' ? 'bg-pink-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${(section.answeredCount / section.questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Question buttons grid */}
              <div className="grid grid-cols-5 gap-2">
                {section.questions.map((question) => {
                  const status = getQuestionStatus(question.questionOrder);
                  
                  return (
                    <button
                      key={question.questionOrder}
                      onClick={() => onQuestionClick(question.questionOrder)}
                      className={`
                        aspect-square rounded-lg font-medium text-sm transition-all
                        ${
                          status === 'current'
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white ring-4 ring-indigo-200 shadow-lg scale-110'
                            : status === 'answered'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {question.questionOrder}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer legend */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-600 to-purple-600"></div>
              <span className="text-gray-600">Hiện tại</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <span className="text-gray-600">Đã trả lời</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <span className="text-gray-600">Chưa trả lời</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

