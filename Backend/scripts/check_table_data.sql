-- Script kiểm tra số lượng dữ liệu trong các bảng
-- Database: HIHSK

USE HIHSK;
GO

-- Tạo bảng tạm để lưu kết quả
CREATE TABLE #TableRowCounts (
    TableName NVARCHAR(255),
    RowCount BIGINT,
    HasData BIT
);

-- Kiểm tra các bảng từ DbContext
INSERT INTO #TableRowCounts (TableName, RowCount, HasData)
SELECT 
    'CourseCategories' AS TableName,
    (SELECT COUNT(*) FROM CourseCategories) AS RowCount,
    CASE WHEN (SELECT COUNT(*) FROM CourseCategories) > 0 THEN 1 ELSE 0 END AS HasData

UNION ALL SELECT 'Courses', (SELECT COUNT(*) FROM Courses), CASE WHEN (SELECT COUNT(*) FROM Courses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Lessons', (SELECT COUNT(*) FROM Lessons), CASE WHEN (SELECT COUNT(*) FROM Lessons) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'LessonTopics', (SELECT COUNT(*) FROM LessonTopics), CASE WHEN (SELECT COUNT(*) FROM LessonTopics) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'LessonExercises', (SELECT COUNT(*) FROM LessonExercises), CASE WHEN (SELECT COUNT(*) FROM LessonExercises) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Words', (SELECT COUNT(*) FROM Words), CASE WHEN (SELECT COUNT(*) FROM Words) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'VocabularyTopics', (SELECT COUNT(*) FROM VocabularyTopics), CASE WHEN (SELECT COUNT(*) FROM VocabularyTopics) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'WordVocabularyTopics', (SELECT COUNT(*) FROM WordVocabularyTopics), CASE WHEN (SELECT COUNT(*) FROM WordVocabularyTopics) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Radicals', (SELECT COUNT(*) FROM Radicals), CASE WHEN (SELECT COUNT(*) FROM Radicals) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'WordRadicals', (SELECT COUNT(*) FROM WordRadicals), CASE WHEN (SELECT COUNT(*) FROM WordRadicals) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Dialogues', (SELECT COUNT(*) FROM Dialogues), CASE WHEN (SELECT COUNT(*) FROM Dialogues) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'DialogueSentences', (SELECT COUNT(*) FROM DialogueSentences), CASE WHEN (SELECT COUNT(*) FROM DialogueSentences) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'ReadingPassages', (SELECT COUNT(*) FROM ReadingPassages), CASE WHEN (SELECT COUNT(*) FROM ReadingPassages) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'ReadingPassageWords', (SELECT COUNT(*) FROM ReadingPassageWords), CASE WHEN (SELECT COUNT(*) FROM ReadingPassageWords) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Questions', (SELECT COUNT(*) FROM Questions), CASE WHEN (SELECT COUNT(*) FROM Questions) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'QuestionOptions', (SELECT COUNT(*) FROM QuestionOptions), CASE WHEN (SELECT COUNT(*) FROM QuestionOptions) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'ExamPapers', (SELECT COUNT(*) FROM ExamPapers), CASE WHEN (SELECT COUNT(*) FROM ExamPapers) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'ExamPaperQuestions', (SELECT COUNT(*) FROM ExamPaperQuestions), CASE WHEN (SELECT COUNT(*) FROM ExamPaperQuestions) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'SentencePatterns', (SELECT COUNT(*) FROM SentencePatterns), CASE WHEN (SELECT COUNT(*) FROM SentencePatterns) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'SentencePatternExamples', (SELECT COUNT(*) FROM SentencePatternExamples), CASE WHEN (SELECT COUNT(*) FROM SentencePatternExamples) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'MeasureWords', (SELECT COUNT(*) FROM MeasureWords), CASE WHEN (SELECT COUNT(*) FROM MeasureWords) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'MeasureWordExamples', (SELECT COUNT(*) FROM MeasureWordExamples), CASE WHEN (SELECT COUNT(*) FROM MeasureWordExamples) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'WordMeasureWords', (SELECT COUNT(*) FROM WordMeasureWords), CASE WHEN (SELECT COUNT(*) FROM WordMeasureWords) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'WordExamples', (SELECT COUNT(*) FROM WordExamples), CASE WHEN (SELECT COUNT(*) FROM WordExamples) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Activities', (SELECT COUNT(*) FROM Activities), CASE WHEN (SELECT COUNT(*) FROM Activities) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'WritingExercises', (SELECT COUNT(*) FROM WritingExercises), CASE WHEN (SELECT COUNT(*) FROM WritingExercises) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'TranslationHistories', (SELECT COUNT(*) FROM TranslationHistories), CASE WHEN (SELECT COUNT(*) FROM TranslationHistories) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserLessonProgresses', (SELECT COUNT(*) FROM UserLessonProgresses), CASE WHEN (SELECT COUNT(*) FROM UserLessonProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserAnswers', (SELECT COUNT(*) FROM UserAnswers), CASE WHEN (SELECT COUNT(*) FROM UserAnswers) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserWordProgresses', (SELECT COUNT(*) FROM UserWordProgresses), CASE WHEN (SELECT COUNT(*) FROM UserWordProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserLessonStatuses', (SELECT COUNT(*) FROM UserLessonStatuses), CASE WHEN (SELECT COUNT(*) FROM UserLessonStatuses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserCourseStatuses', (SELECT COUNT(*) FROM UserCourseStatuses), CASE WHEN (SELECT COUNT(*) FROM UserCourseStatuses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserDialogueProgresses', (SELECT COUNT(*) FROM UserDialogueProgresses), CASE WHEN (SELECT COUNT(*) FROM UserDialogueProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserActivityProgresses', (SELECT COUNT(*) FROM UserActivityProgresses), CASE WHEN (SELECT COUNT(*) FROM UserActivityProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserReadingProgresses', (SELECT COUNT(*) FROM UserReadingProgresses), CASE WHEN (SELECT COUNT(*) FROM UserReadingProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserReadingWordMarks', (SELECT COUNT(*) FROM UserReadingWordMarks), CASE WHEN (SELECT COUNT(*) FROM UserReadingWordMarks) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserRadicalProgresses', (SELECT COUNT(*) FROM UserRadicalProgresses), CASE WHEN (SELECT COUNT(*) FROM UserRadicalProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserWritingProgresses', (SELECT COUNT(*) FROM UserWritingProgresses), CASE WHEN (SELECT COUNT(*) FROM UserWritingProgresses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserWritingAttempts', (SELECT COUNT(*) FROM UserWritingAttempts), CASE WHEN (SELECT COUNT(*) FROM UserWritingAttempts) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserPronunciationAttempts', (SELECT COUNT(*) FROM UserPronunciationAttempts), CASE WHEN (SELECT COUNT(*) FROM UserPronunciationAttempts) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'FavoriteWords', (SELECT COUNT(*) FROM FavoriteWords), CASE WHEN (SELECT COUNT(*) FROM FavoriteWords) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'FavoriteSentencePatterns', (SELECT COUNT(*) FROM FavoriteSentencePatterns), CASE WHEN (SELECT COUNT(*) FROM FavoriteSentencePatterns) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'ExamResultAnalyses', (SELECT COUNT(*) FROM ExamResultAnalyses), CASE WHEN (SELECT COUNT(*) FROM ExamResultAnalyses) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'Leaderboards', (SELECT COUNT(*) FROM Leaderboards), CASE WHEN (SELECT COUNT(*) FROM Leaderboards) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'UserDailyStats', (SELECT COUNT(*) FROM UserDailyStats), CASE WHEN (SELECT COUNT(*) FROM UserDailyStats) > 0 THEN 1 ELSE 0 END
-- Identity tables
UNION ALL SELECT 'AspNetUsers', (SELECT COUNT(*) FROM AspNetUsers), CASE WHEN (SELECT COUNT(*) FROM AspNetUsers) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'AspNetRoles', (SELECT COUNT(*) FROM AspNetRoles), CASE WHEN (SELECT COUNT(*) FROM AspNetRoles) > 0 THEN 1 ELSE 0 END
UNION ALL SELECT 'AspNetUserRoles', (SELECT COUNT(*) FROM AspNetUserRoles), CASE WHEN (SELECT COUNT(*) FROM AspNetUserRoles) > 0 THEN 1 ELSE 0 END;

-- Hiển thị kết quả, sắp xếp theo số lượng rows giảm dần
SELECT 
    TableName AS 'Tên Bảng',
    RowCount AS 'Số Lượng Dòng',
    CASE WHEN HasData = 1 THEN '✅ Có dữ liệu' ELSE '❌ Không có dữ liệu' END AS 'Trạng Thái'
FROM #TableRowCounts
ORDER BY RowCount DESC, TableName;

-- Tổng kết
SELECT 
    COUNT(*) AS 'Tổng Số Bảng',
    SUM(CASE WHEN HasData = 1 THEN 1 ELSE 0 END) AS 'Bảng Có Dữ Liệu',
    SUM(CASE WHEN HasData = 0 THEN 1 ELSE 0 END) AS 'Bảng Không Có Dữ Liệu',
    SUM(RowCount) AS 'Tổng Số Dòng'
FROM #TableRowCounts;

-- Xóa bảng tạm
DROP TABLE #TableRowCounts;
GO
