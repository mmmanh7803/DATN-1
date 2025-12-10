using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHSK1H10901Answers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Cập nhật đáp án cho đề thi HSK 1 - H10901
            // Đáp án chính thức từ tiengtrungvuive.edu.vn
            
            migrationBuilder.Sql(@"
                -- Lấy ExamPaperId của đề thi H10901
                DECLARE @ExamId INT = (SELECT TOP 1 Id FROM ExamPapers WHERE Title = N'Đề thi HSK 1 - H10901');
                
                IF @ExamId IS NOT NULL
                BEGIN
                    -- Lấy danh sách QuestionId theo thứ tự
                    DECLARE @Q1 INT, @Q2 INT, @Q3 INT, @Q4 INT, @Q5 INT;
                    DECLARE @Q6 INT, @Q7 INT, @Q8 INT, @Q9 INT, @Q10 INT;
                    DECLARE @Q11 INT, @Q12 INT, @Q13 INT, @Q14 INT, @Q15 INT;
                    DECLARE @Q16 INT, @Q17 INT, @Q18 INT, @Q19 INT, @Q20 INT;
                    DECLARE @Q21 INT, @Q22 INT, @Q23 INT, @Q24 INT, @Q25 INT;
                    DECLARE @Q26 INT, @Q27 INT, @Q28 INT, @Q29 INT, @Q30 INT;
                    DECLARE @Q31 INT, @Q32 INT, @Q33 INT, @Q34 INT, @Q35 INT;
                    DECLARE @Q36 INT, @Q37 INT, @Q38 INT, @Q39 INT, @Q40 INT;

                    SELECT @Q1 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 1;
                    SELECT @Q2 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 2;
                    SELECT @Q3 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 3;
                    SELECT @Q4 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 4;
                    SELECT @Q5 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 5;
                    SELECT @Q6 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 6;
                    SELECT @Q7 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 7;
                    SELECT @Q8 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 8;
                    SELECT @Q9 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 9;
                    SELECT @Q10 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 10;
                    SELECT @Q11 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 11;
                    SELECT @Q12 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 12;
                    SELECT @Q13 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 13;
                    SELECT @Q14 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 14;
                    SELECT @Q15 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 15;
                    SELECT @Q16 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 16;
                    SELECT @Q17 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 17;
                    SELECT @Q18 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 18;
                    SELECT @Q19 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 19;
                    SELECT @Q20 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 20;
                    SELECT @Q21 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 21;
                    SELECT @Q22 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 22;
                    SELECT @Q23 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 23;
                    SELECT @Q24 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 24;
                    SELECT @Q25 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 25;
                    SELECT @Q26 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 26;
                    SELECT @Q27 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 27;
                    SELECT @Q28 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 28;
                    SELECT @Q29 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 29;
                    SELECT @Q30 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 30;
                    SELECT @Q31 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 31;
                    SELECT @Q32 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 32;
                    SELECT @Q33 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 33;
                    SELECT @Q34 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 34;
                    SELECT @Q35 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 35;
                    SELECT @Q36 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 36;
                    SELECT @Q37 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 37;
                    SELECT @Q38 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 38;
                    SELECT @Q39 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 39;
                    SELECT @Q40 = QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId AND QuestionOrder = 40;

                    -- ==================== PHẦN NGHE ====================
                    
                    -- Phần 1 (1-5): TRUE, FALSE, FALSE, FALSE, TRUE
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q1 AND OptionLabel = N'TRUE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q2 AND OptionLabel = N'FALSE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q3 AND OptionLabel = N'FALSE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q4 AND OptionLabel = N'FALSE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q5 AND OptionLabel = N'TRUE';

                    -- Phần 2 (6-10): A, A, C, A, C
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q6 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q7 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q8 AND OptionLabel = 'C';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q9 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q10 AND OptionLabel = 'C';

                    -- Phần 3 (11-15): D, B, A, E, F
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q11 AND OptionLabel = 'D';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q12 AND OptionLabel = 'B';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q13 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q14 AND OptionLabel = 'E';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q15 AND OptionLabel = 'F';

                    -- Phần 4 (16-20): B, B, C, C, B
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q16 AND OptionLabel = 'B';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q17 AND OptionLabel = 'B';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q18 AND OptionLabel = 'C';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q19 AND OptionLabel = 'C';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q20 AND OptionLabel = 'B';

                    -- ==================== PHẦN ĐỌC ====================
                    
                    -- Phần 1 (21-25): TRUE, TRUE, FALSE, FALSE, TRUE
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q21 AND OptionLabel = N'TRUE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q22 AND OptionLabel = N'TRUE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q23 AND OptionLabel = N'FALSE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q24 AND OptionLabel = N'FALSE';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q25 AND OptionLabel = N'TRUE';

                    -- Phần 2 (26-30): D, F, C, A, B
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q26 AND OptionLabel = 'D';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q27 AND OptionLabel = 'F';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q28 AND OptionLabel = 'C';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q29 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q30 AND OptionLabel = 'B';

                    -- Phần 3 (31-35): C, D, A, B, E
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q31 AND OptionLabel = 'C';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q32 AND OptionLabel = 'D';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q33 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q34 AND OptionLabel = 'B';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q35 AND OptionLabel = 'E';

                    -- Phần 4 (36-40): F, B, E, A, C
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q36 AND OptionLabel = 'F';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q37 AND OptionLabel = 'B';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q38 AND OptionLabel = 'E';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q39 AND OptionLabel = 'A';
                    UPDATE QuestionOptions SET IsCorrect = 1 WHERE QuestionId = @Q40 AND OptionLabel = 'C';

                    PRINT N'Đã cập nhật đáp án cho đề thi HSK 1 - H10901';
                END
                ELSE
                BEGIN
                    PRINT N'Không tìm thấy đề thi HSK 1 - H10901';
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reset tất cả đáp án về FALSE
            migrationBuilder.Sql(@"
                DECLARE @ExamId INT = (SELECT TOP 1 Id FROM ExamPapers WHERE Title = N'Đề thi HSK 1 - H10901');
                
                IF @ExamId IS NOT NULL
                BEGIN
                    UPDATE qo SET qo.IsCorrect = 0
                    FROM QuestionOptions qo
                    INNER JOIN ExamPaperQuestions epq ON qo.QuestionId = epq.QuestionId
                    WHERE epq.ExamPaperId = @ExamId;
                END
            ");
        }
    }
}
