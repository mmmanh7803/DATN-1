using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHSK1AudioTimeMarkers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Cập nhật time markers cho đề thi HSK 1 - H10901
            // Thời gian tính bằng giây (seconds)
            // LƯU Ý: Các giá trị này là ước tính, cần điều chỉnh theo audio thực tế
            
            migrationBuilder.Sql(@"
                DECLARE @ExamId INT = (SELECT TOP 1 Id FROM ExamPapers WHERE Title = N'Đề thi HSK 1 - H10901');
                
                IF @ExamId IS NOT NULL
                BEGIN
                    -- Part 1 (Questions 1-5): True/False
                    -- Mỗi câu khoảng 8-10 giây
                    UPDATE q SET 
                        q.AudioStartTime = CASE epq.QuestionOrder
                            WHEN 1 THEN 25
                            WHEN 2 THEN 35
                            WHEN 3 THEN 45
                            WHEN 4 THEN 55
                            WHEN 5 THEN 65
                            ELSE q.AudioStartTime
                        END,
                        q.AudioEndTime = CASE epq.QuestionOrder
                            WHEN 1 THEN 35
                            WHEN 2 THEN 45
                            WHEN 3 THEN 55
                            WHEN 4 THEN 65
                            WHEN 5 THEN 75
                            ELSE q.AudioEndTime
                        END
                    FROM Questions q
                    INNER JOIN ExamPaperQuestions epq ON q.Id = epq.QuestionId
                    WHERE epq.ExamPaperId = @ExamId 
                      AND epq.QuestionOrder BETWEEN 1 AND 5;

                    -- Part 2 (Questions 6-10): Select Image
                    -- Mỗi câu khoảng 12-15 giây
                    UPDATE q SET 
                        q.AudioStartTime = CASE epq.QuestionOrder
                            WHEN 6 THEN 90
                            WHEN 7 THEN 105
                            WHEN 8 THEN 120
                            WHEN 9 THEN 135
                            WHEN 10 THEN 150
                            ELSE q.AudioStartTime
                        END,
                        q.AudioEndTime = CASE epq.QuestionOrder
                            WHEN 6 THEN 105
                            WHEN 7 THEN 120
                            WHEN 8 THEN 135
                            WHEN 9 THEN 150
                            WHEN 10 THEN 165
                            ELSE q.AudioEndTime
                        END
                    FROM Questions q
                    INNER JOIN ExamPaperQuestions epq ON q.Id = epq.QuestionId
                    WHERE epq.ExamPaperId = @ExamId 
                      AND epq.QuestionOrder BETWEEN 6 AND 10;

                    -- Part 3 (Questions 11-15): Matching
                    -- Mỗi câu khoảng 12-15 giây
                    UPDATE q SET 
                        q.AudioStartTime = CASE epq.QuestionOrder
                            WHEN 11 THEN 180
                            WHEN 12 THEN 195
                            WHEN 13 THEN 210
                            WHEN 14 THEN 225
                            WHEN 15 THEN 240
                            ELSE q.AudioStartTime
                        END,
                        q.AudioEndTime = CASE epq.QuestionOrder
                            WHEN 11 THEN 195
                            WHEN 12 THEN 210
                            WHEN 13 THEN 225
                            WHEN 14 THEN 240
                            WHEN 15 THEN 255
                            ELSE q.AudioEndTime
                        END
                    FROM Questions q
                    INNER JOIN ExamPaperQuestions epq ON q.Id = epq.QuestionId
                    WHERE epq.ExamPaperId = @ExamId 
                      AND epq.QuestionOrder BETWEEN 11 AND 15;

                    -- Part 4 (Questions 16-20): Multiple Choice
                    -- Mỗi câu khoảng 20-25 giây
                    UPDATE q SET 
                        q.AudioStartTime = CASE epq.QuestionOrder
                            WHEN 16 THEN 270
                            WHEN 17 THEN 295
                            WHEN 18 THEN 320
                            WHEN 19 THEN 345
                            WHEN 20 THEN 370
                            ELSE q.AudioStartTime
                        END,
                        q.AudioEndTime = CASE epq.QuestionOrder
                            WHEN 16 THEN 295
                            WHEN 17 THEN 320
                            WHEN 18 THEN 345
                            WHEN 19 THEN 370
                            WHEN 20 THEN 395
                            ELSE q.AudioEndTime
                        END
                    FROM Questions q
                    INNER JOIN ExamPaperQuestions epq ON q.Id = epq.QuestionId
                    WHERE epq.ExamPaperId = @ExamId 
                      AND epq.QuestionOrder BETWEEN 16 AND 20;

                    PRINT N'Đã cập nhật time markers cho đề thi HSK 1 - H10901';
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @ExamId INT = (SELECT TOP 1 Id FROM ExamPapers WHERE Title = N'Đề thi HSK 1 - H10901');
                
                IF @ExamId IS NOT NULL
                BEGIN
                    UPDATE q SET 
                        q.AudioStartTime = NULL,
                        q.AudioEndTime = NULL
                    FROM Questions q
                    INNER JOIN ExamPaperQuestions epq ON q.Id = epq.QuestionId
                    WHERE epq.ExamPaperId = @ExamId;
                END
            ");
        }
    }
}
