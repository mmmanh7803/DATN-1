using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropEmptyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Xóa các bảng trống (chỉ xóa nếu bảng tồn tại và không có dữ liệu)
            // Sử dụng dynamic SQL để kiểm tra và xóa an toàn

            // Danh sách các bảng có thể trống (không bao gồm các bảng quan trọng như Words, LessonTopics, etc.)
            var tablesToCheck = new[]
            {
                "UserLessonProgresses",
                "UserAnswers",
                "UserWordProgresses",
                "UserLessonStatuses",
                "UserCourseStatuses",
                "UserDialogueProgresses",
                "UserReadingProgresses",
                "UserReadingWordMarks",
                "UserRadicalProgresses",
                "UserWritingProgresses",
                "UserWritingAttempts",
                "UserPronunciationAttempts",
                "FavoriteWords",
                "FavoriteSentencePatterns",
                "ExamResultAnalyses",
                "Leaderboards",
                "UserDailyStats",
                "TranslationHistories",
                "WritingExercises",
                "WordExamples",
                "WordMeasureWords",
                "MeasureWordExamples",
                "MeasureWords",
                "SentencePatternExamples",
                "SentencePatterns",
                "ExamPaperQuestions",
                "ExamPapers",
                "ReadingPassageWords",
                "ReadingPassages",
                "DialogueSentences",
                "Dialogues",
                "WordRadicals",
                "Radicals",
                "WordVocabularyTopics",
                "LessonExercises",
                "Lessons",
            };

            // Tạo SQL script để xóa các bảng trống
            foreach (var tableName in tablesToCheck)
            {
                migrationBuilder.Sql($@"
                    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{tableName}')
                    BEGIN
                        DECLARE @RowCount INT;
                        SELECT @RowCount = COUNT(*) FROM [{tableName}];
                        
                        IF @RowCount = 0
                        BEGIN
                            -- Xóa foreign keys trước
                            DECLARE @sql NVARCHAR(MAX) = '';
                            SELECT @sql = @sql + 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];' + CHAR(13)
                            FROM sys.foreign_keys
                            WHERE referenced_object_id = OBJECT_ID('{tableName}');
                            IF @sql <> ''
                                EXEC sp_executesql @sql;
                            
                            -- Xóa bảng
                            DROP TABLE [{tableName}];
                        END
                    END
                ");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback: Không thể tự động tạo lại các bảng vì không biết cấu trúc
            // Người dùng cần chạy lại migrations từ đầu nếu cần rollback
        }
    }
}
