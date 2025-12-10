using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedHSK1ExamData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tạo đề thi HSK 1 - Mẫu 01
            migrationBuilder.Sql(@"
                INSERT INTO ExamPapers (Title, ExamType, Level, Description, DurationMinutes, TotalQuestions, TotalPoints, PassingScore, CreatedAt, IsActive)
                VALUES (N'Đề thi HSK 1 - Mẫu 01', 'HSK', 1, N'Đề thi thử HSK cấp 1 theo chuẩn quốc tế - 40 câu hỏi', 35, 40, 200, 120, GETDATE(), 1);
                
                DECLARE @ExamId INT = SCOPE_IDENTITY();
                DECLARE @QuestionId INT;

                -- ==================== PHẦN NGHE - PHẦN 1 (Câu 1-5): TRUE/FALSE ====================
                
                -- Câu 1
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 1', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/l1_q1.mp3', '/images/hsk1/l1_q1.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 1);

                -- Câu 2
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 2', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/l1_q2.mp3', '/images/hsk1/l1_q2.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 2);

                -- Câu 3
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 3', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/l1_q3.mp3', '/images/hsk1/l1_q3.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 3);

                -- Câu 4
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 4', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/l1_q4.mp3', '/images/hsk1/l1_q4.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 4);

                -- Câu 5
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 5', 'TRUE_FALSE', 'LISTENING', 1, N'Nghe câu miêu tả và xác định xem nó có đúng với bức tranh không.', '/audio/hsk1/l1_q5.mp3', '/images/hsk1/l1_q5.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 5);

                -- ==================== PHẦN NGHE - PHẦN 2 (Câu 6-10): SELECT_IMAGE ====================
                
                -- Câu 6
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 6', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/l2_q6.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/l2_q6_a.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/l2_q6_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/l2_q6_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 6);

                -- Câu 7
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 7', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/l2_q7.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/l2_q7_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/l2_q7_b.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/l2_q7_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 7);

                -- Câu 8
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 8', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/l2_q8.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/l2_q8_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/l2_q8_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/l2_q8_c.jpg', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 8);

                -- Câu 9
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 9', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/l2_q9.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/l2_q9_a.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/l2_q9_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/l2_q9_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 9);

                -- Câu 10
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Câu 10', 'SELECT_IMAGE', 'LISTENING', 2, N'Nghe đoạn hội thoại và chọn bức tranh phù hợp với nội dung.', '/audio/hsk1/l2_q10.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/l2_q10_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/l2_q10_b.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/l2_q10_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 10);

                -- ==================== PHẦN NGHE - PHẦN 3 (Câu 11-15): MULTIPLE_CHOICE ====================
                
                -- Câu 11
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'男的喜欢什么？', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l3_q11.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'苹果', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'香蕉', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'橙子', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 11);

                -- Câu 12
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'女的去哪儿？', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l3_q12.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'学校', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'医院', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'商店', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 12);

                -- Câu 13
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他们什么时候见面？', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l3_q13.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'今天', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'明天', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'后天', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 13);

                -- Câu 14
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这个多少钱？', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l3_q14.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'十块', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'二十块', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'三十块', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 14);

                -- Câu 15
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她是谁？', 'MULTIPLE_CHOICE', 'LISTENING', 3, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l3_q15.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'老师', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'学生', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'医生', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 15);

                -- ==================== PHẦN NGHE - PHẦN 4 (Câu 16-20): MULTIPLE_CHOICE ====================
                
                -- Câu 16
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是谁的书？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l4_q16.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'他的', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'我的', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'同学的', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 16);

                -- Câu 17
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他们什么时候去北京？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l4_q17.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'星期三', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'星期五', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'星期六', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 17);

                -- Câu 18
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他买了多少个苹果？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l4_q18.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'5个', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'15个', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'50个', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 18);

                -- Câu 19
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她想喝什么？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l4_q19.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'茶', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'咖啡', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'水', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 19);

                -- Câu 20
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, AudioUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她的女儿怎么样？', 'MULTIPLE_CHOICE', 'LISTENING', 4, N'Nghe đoạn hội thoại và chọn câu trả lời đúng.', '/audio/hsk1/l4_q20.mp3', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'爱学习', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'很漂亮', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'想回家', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 20);

                -- ==================== PHẦN ĐỌC - PHẦN 1 (Câu 21-25): SELECT_IMAGE ====================
                
                -- Câu 21
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是一只猫。', 'SELECT_IMAGE', 'READING', 1, N'Đọc câu miêu tả và chọn bức tranh phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r1_q21_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r1_q21_b.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r1_q21_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 21);

                -- Câu 22
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'我喜欢喝咖啡。', 'SELECT_IMAGE', 'READING', 1, N'Đọc câu miêu tả và chọn bức tranh phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r1_q22_a.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r1_q22_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r1_q22_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 22);

                -- Câu 23
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他在用电脑工作。', 'SELECT_IMAGE', 'READING', 1, N'Đọc câu miêu tả và chọn bức tranh phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r1_q23_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r1_q23_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r1_q23_c.jpg', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 23);

                -- Câu 24
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是我的房子。', 'SELECT_IMAGE', 'READING', 1, N'Đọc câu miêu tả và chọn bức tranh phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r1_q24_a.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r1_q24_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r1_q24_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 24);

                -- Câu 25
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她是一位老师。', 'SELECT_IMAGE', 'READING', 1, N'Đọc câu miêu tả và chọn bức tranh phù hợp.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r1_q25_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r1_q25_b.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r1_q25_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 25);

                -- ==================== PHẦN ĐỌC - PHẦN 2 (Câu 26-30): TRUE_FALSE ====================
                
                -- Câu 26
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是一本书。', 'TRUE_FALSE', 'READING', 2, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/r2_q26.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 26);

                -- Câu 27
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是一辆汽车。', 'TRUE_FALSE', 'READING', 2, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/r2_q27.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 27);

                -- Câu 28
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'她在打电话。', 'TRUE_FALSE', 'READING', 2, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/r2_q28.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 28);

                -- Câu 29
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是水。', 'TRUE_FALSE', 'READING', 2, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/r2_q29.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 29);

                -- Câu 30
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, ImageUrl, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是一只狗。', 'TRUE_FALSE', 'READING', 2, N'Xem hình ảnh và xác định xem câu miêu tả có đúng không.', '/images/hsk1/r2_q30.jpg', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✓', N'Đúng', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, N'✗', N'Sai', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 30);

                -- ==================== PHẦN ĐỌC - PHẦN 3 (Câu 31-35): SELECT_IMAGE ====================
                
                -- Câu 31
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'我想喝一杯水。', 'SELECT_IMAGE', 'READING', 3, N'Đọc câu miêu tả và chọn hình ảnh phù hợp nhất.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r3_q31_a.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r3_q31_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r3_q31_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 31);

                -- Câu 32
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'他有一只可爱的猫。', 'SELECT_IMAGE', 'READING', 3, N'Đọc câu miêu tả và chọn hình ảnh phù hợp nhất.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r3_q32_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r3_q32_b.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r3_q32_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 32);

                -- Câu 33
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'这是我的电脑。', 'SELECT_IMAGE', 'READING', 3, N'Đọc câu miêu tả và chọn hình ảnh phù hợp nhất.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r3_q33_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r3_q33_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r3_q33_c.jpg', 1);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 33);

                -- Câu 34
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'老师在教室里。', 'SELECT_IMAGE', 'READING', 3, N'Đọc câu miêu tả và chọn hình ảnh phù hợp nhất.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r3_q34_a.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r3_q34_b.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r3_q34_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 34);

                -- Câu 35
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, Points, DifficultyLevel, CreatedAt)
                VALUES (N'学生们在学习。', 'SELECT_IMAGE', 'READING', 3, N'Đọc câu miêu tả và chọn hình ảnh phù hợp nhất.', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'A', '', '/images/hsk1/r3_q35_a.jpg', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'B', '', '/images/hsk1/r3_q35_b.jpg', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, ImageUrl, IsCorrect) VALUES (@QuestionId, 'C', '', '/images/hsk1/r3_q35_c.jpg', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 35);

                -- ==================== PHẦN ĐỌC - PHẦN 4 (Câu 36-40): FILL_BLANK ====================
                
                -- Câu 36
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ thích hợp:', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'我____喝茶。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'喜欢', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'是', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'有', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 36);

                -- Câu 37
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ thích hợp:', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'她是我的____。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'朋友', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'书', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'水', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 37);

                -- Câu 38
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ thích hợp:', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'今天天气很____。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'好', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'喝', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'看', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 38);

                -- Câu 39
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ thích hợp:', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'我____中国人。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'是', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'有', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'去', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 39);

                -- Câu 40
                INSERT INTO Questions (QuestionText, QuestionType, SkillType, PartNumber, Instruction, BlankSentence, Points, DifficultyLevel, CreatedAt)
                VALUES (N'Điền từ thích hợp:', 'FILL_BLANK', 'READING', 4, N'Chọn từ đúng để điền vào chỗ trống.', N'他____三个苹果。', 5, 1, GETDATE());
                SET @QuestionId = SCOPE_IDENTITY();
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'A', N'有', 1);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'B', N'是', 0);
                INSERT INTO QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES (@QuestionId, 'C', N'喜欢', 0);
                INSERT INTO ExamPaperQuestions (ExamPaperId, QuestionId, QuestionOrder) VALUES (@ExamId, @QuestionId, 40);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa dữ liệu đề thi HSK 1
            migrationBuilder.Sql(@"
                DECLARE @ExamId INT = (SELECT TOP 1 Id FROM ExamPapers WHERE Title = N'Đề thi HSK 1 - Mẫu 01' ORDER BY Id DESC);
                
                IF @ExamId IS NOT NULL
                BEGIN
                    -- Xóa ExamPaperQuestions
                    DELETE FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId;
                    
                    -- Xóa QuestionOptions và Questions
                    DELETE FROM QuestionOptions WHERE QuestionId IN (
                        SELECT q.Id FROM Questions q
                        INNER JOIN ExamPaperQuestions epq ON q.Id = epq.QuestionId
                        WHERE epq.ExamPaperId = @ExamId
                    );
                    
                    DELETE FROM Questions WHERE Id IN (
                        SELECT QuestionId FROM ExamPaperQuestions WHERE ExamPaperId = @ExamId
                    );
                    
                    -- Xóa ExamPaper
                    DELETE FROM ExamPapers WHERE Id = @ExamId;
                END
            ");
        }
    }
}
