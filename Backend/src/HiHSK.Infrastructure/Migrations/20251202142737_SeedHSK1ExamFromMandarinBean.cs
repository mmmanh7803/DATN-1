using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedHSK1ExamFromMandarinBean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tạo đề thi HSK 1 - H10901 (MandarinBean)
            migrationBuilder.Sql(@"
                INSERT INTO ExamPapers (Title, ExamType, Level, Description, DurationMinutes, TotalQuestions, TotalPoints, PassingScore, CreatedAt, IsActive)
                VALUES (N'Đề thi HSK 1 - H10901', 'HSK', 1, N'Đề thi HSK 1 mẫu từ MandarinBean - 40 câu (Nghe + Đọc)', 35, 40, 200, 120, GETDATE(), 1);
                
                DECLARE @ExamId INT = SCOPE_IDENTITY();
                DECLARE @QuestionId INT;

                -- ==================== PHẦN NGHE - PHẦN 1 (Câu 1-5): TRUE/FALSE ====================
                
                -- Câu 1
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 1', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_1.png', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 1);

                -- Câu 2
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 2', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_2.png', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 2);

                -- Câu 3
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 3', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_3.png', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 3);

                -- Câu 4
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 4', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_4.png', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 4);

                -- Câu 5
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 5', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_5.png', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 5);

                -- ==================== PHẦN NGHE - PHẦN 2 (Câu 6-10): SELECT_IMAGE ====================
                
                -- Câu 6
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 6', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/H1_6.png', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/H1_7-1.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/H1_8.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 6);

                -- Câu 7
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 7', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/H1_6.png', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/H1_7-1.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/H1_9.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 7);

                -- Câu 8
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 8', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/H1_8.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/H1_9.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/H1_10.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 8);

                -- Câu 9
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 9', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/H1_6.png', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/H1_9.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/H1_10.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 9);

                -- Câu 10
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 10', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/H1_7-1.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/H1_8.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/H1_10.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 10);

                -- ==================== PHẦN NGHE - PHẦN 3 (Câu 11-15): MULTIPLE_CHOICE ====================
                
                -- Câu 11-15: Matching with image (simplified to MULTIPLE_CHOICE)
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 11', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và ghép với hình ảnh tương ứng.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_part3.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 11);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 12', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và ghép với hình ảnh tương ứng.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_part3.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 12);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 13', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và ghép với hình ảnh tương ứng.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_part3.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 13);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 14', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và ghép với hình ảnh tương ứng.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_part3.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 14);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 15', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và ghép với hình ảnh tương ứng.', '/audio/hsk1/h10901.mp3', '/images/hsk1/H1_part3.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 15);

                -- ==================== PHẦN NGHE - PHẦN 4 (Câu 16-20): MULTIPLE_CHOICE ====================
                
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是谁的书？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'他的 (tā de)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'我的 (wǒ de)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'同学的 (tóngxué de)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 16);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他们什么时候见面？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'星期三 (xīngqīsān)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'星期五 (xīngqīwǔ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'星期六 (xīngqīliù)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 17);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他买了多少个苹果？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'5', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'15', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'50', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 18);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她想喝什么？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'茶 (chá)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'苹果 (píngguǒ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'杯子 (bēizi)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 19);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她女儿怎么样？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/h10901.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'爱学习 (ài xuéxí)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'很漂亮 (hěn piàoliang)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'想回家 (xiǎng huí jiā)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 20);

                -- ==================== PHẦN ĐỌC - PHẦN 1 (Câu 21-25): TRUE_FALSE ====================
                
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 21', 'TRUE_FALSE', 'READING', 1, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/H1_21.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 21);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 22', 'TRUE_FALSE', 'READING', 1, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/H1_22.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 22);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 23', 'TRUE_FALSE', 'READING', 1, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/H1_23.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 23);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 24', 'TRUE_FALSE', 'READING', 1, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/H1_24.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 24);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 25', 'TRUE_FALSE', 'READING', 1, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/H1_25.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'TRUE', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'FALSE', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 25);

                -- ==================== PHẦN ĐỌC - PHẦN 2 (Câu 26-30): MATCHING ====================
                
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'你好，我能吃一块儿吗？(Nǐ hǎo, wǒ néng chī yí kuàir ma?)', 'MULTIPLE_CHOICE', 'READING', 2, N'Đọc câu văn và ghép với hình ảnh phù hợp (A-F).', '/images/hsk1/H1_part6.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 26);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他们在买衣服呢。(Tāmen zài mǎi yīfu ne.)', 'MULTIPLE_CHOICE', 'READING', 2, N'Đọc câu văn và ghép với hình ảnh phù hợp (A-F).', '/images/hsk1/H1_part6.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 27);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'天气太热了，多吃些水果。(Tiānqì tài rè le, duō chī xiē shuǐguǒ.)', 'MULTIPLE_CHOICE', 'READING', 2, N'Đọc câu văn và ghép với hình ảnh phù hợp (A-F).', '/images/hsk1/H1_part6.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 28);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'来，我们看里面是什么东西。(Lái, wǒmen kànkan lǐmiàn shì shénme dōngxi.)', 'MULTIPLE_CHOICE', 'READING', 2, N'Đọc câu văn và ghép với hình ảnh phù hợp (A-F).', '/images/hsk1/H1_part6.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 29);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'喂，你睡觉了吗？(Wéi, nǐ shuìjiào le ma?)', 'MULTIPLE_CHOICE', 'READING', 2, N'Đọc câu văn và ghép với hình ảnh phù hợp (A-F).', '/images/hsk1/H1_part6.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'Hình A', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'Hình B', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'Hình C', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'Hình D', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'Hình E', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'Hình F', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 30);

                -- ==================== PHẦN ĐỌC - PHẦN 3 (Câu 31-35): MATCHING Q&A ====================
                
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'那个人是谁？(Nàge rén shì shéi?)', 'MULTIPLE_CHOICE', 'READING', 3, N'Đọc câu hỏi và chọn câu trả lời phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'医院 (Yīyuàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'下雨了 (Xià yǔ le)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'我不认识她 (Wǒ bú rènshi tā)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'7岁 (7 suì)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'下个月 (Xià ge yuè)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'好的，谢谢 (Hǎo de, xièxie)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 31);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他女儿多大了？(Tā nǚ''ér duō dà le?)', 'MULTIPLE_CHOICE', 'READING', 3, N'Đọc câu hỏi và chọn câu trả lời phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'医院 (Yīyuàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'下雨了 (Xià yǔ le)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'我不认识她 (Wǒ bú rènshi tā)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'7岁 (7 suì)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'下个月 (Xià ge yuè)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'好的，谢谢 (Hǎo de, xièxie)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 32);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'你的同学在哪儿工作？(Nǐ de tóngxué zài nǎr gōngzuò?)', 'MULTIPLE_CHOICE', 'READING', 3, N'Đọc câu hỏi và chọn câu trả lời phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'医院 (Yīyuàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'下雨了 (Xià yǔ le)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'我不认识她 (Wǒ bú rènshi tā)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'7岁 (7 suì)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'下个月 (Xià ge yuè)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'好的，谢谢 (Hǎo de, xièxie)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 33);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'昨天上午天气怎么样？(Zuótiān shàngwǔ tiānqì zěnmeyàng?)', 'MULTIPLE_CHOICE', 'READING', 3, N'Đọc câu hỏi và chọn câu trả lời phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'医院 (Yīyuàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'下雨了 (Xià yǔ le)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'我不认识她 (Wǒ bú rènshi tā)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'7岁 (7 suì)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'下个月 (Xià ge yuè)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'好的，谢谢 (Hǎo de, xièxie)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 34);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'爸爸什么时候来北京呢？(Bàba shénme shíhou lái Běijīng ne?)', 'MULTIPLE_CHOICE', 'READING', 3, N'Đọc câu hỏi và chọn câu trả lời phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'医院 (Yīyuàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'下雨了 (Xià yǔ le)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'我不认识她 (Wǒ bú rènshi tā)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'7岁 (7 suì)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'下个月 (Xià ge yuè)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'好的，谢谢 (Hǎo de, xièxie)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 35);

                -- ==================== PHẦN ĐỌC - PHẦN 4 (Câu 36-40): FILL_BLANK ====================
                
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ vào chỗ trống', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'昨天是 8____19日', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'坐 (zuò)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'前面 (qiánmiàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'没关系 (méi guānxi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'名字 (míngzi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'汉语 (Hànyǔ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'月 (yuè)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 36);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ vào chỗ trống', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'那个饭馆儿在火车站____', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'坐 (zuò)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'前面 (qiánmiàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'没关系 (méi guānxi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'名字 (míngzi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'汉语 (Hànyǔ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'月 (yuè)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 37);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ vào chỗ trống', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'____，我不小心把你的杯子摔了。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'坐 (zuò)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'前面 (qiánmiàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'没关系 (méi guānxi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'名字 (míngzi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'汉语 (Hànyǔ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'月 (yuè)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 38);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ vào chỗ trống', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'你____在这儿，我去给你买杯茶。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'坐 (zuò)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'前面 (qiánmiàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'没关系 (méi guānxi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'名字 (míngzi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'汉语 (Hànyǔ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'月 (yuè)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 39);

                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ vào chỗ trống', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'我的老师是中国人，她教我们____。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'坐 (zuò)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'前面 (qiánmiàn)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'没关系 (méi guānxi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'D', N'名字 (míngzi)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'E', N'汉语 (Hànyǔ)', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'F', N'月 (yuè)', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 40);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Xóa exam paper với title cụ thể
                DECLARE @ExamId INT = (SELECT TOP 1 Id FROM ExamPapers WHERE Title = N'Đề thi HSK 1 - H10901');
                
                IF @ExamId IS NOT NULL
                BEGIN
                    -- Xóa liên kết câu hỏi - đề thi
                    DELETE FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId;
                    
                    -- Lấy danh sách QuestionId
                    DECLARE @QuestionIds TABLE (Id INT);
                    INSERT INTO @QuestionIds SELECT QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId;
                    
                    -- Xóa đáp án
                    DELETE FROM QuestionOptions WHERE QuestionId IN (SELECT Id FROM @QuestionIds);
                    
                    -- Xóa câu hỏi
                    DELETE FROM Questions WHERE Id IN (SELECT Id FROM @QuestionIds);
                    
                    -- Xóa đề thi
                    DELETE FROM ExamPapers WHERE Id = @ExamId;
                END
            ");
        }
    }
}
