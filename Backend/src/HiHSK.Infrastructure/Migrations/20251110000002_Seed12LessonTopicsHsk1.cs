using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    public partial class Seed12LessonTopicsHsk1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Chỉ xóa dữ liệu cũ nếu bảng LessonTopics đã tồn tại
            // Bỏ qua phần UPDATE Words vì cột TopicId có thể chưa tồn tại
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    DELETE FROM LessonTopics WHERE HSKLevel = 1;
                END
            ");

            var courseId = 1;

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 1)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (1, {courseId}, 1, N'Chào hỏi & Giao tiếp cơ bản', N'Học các từ cơ bản nhất để giao tiếp', NULL, 1, 0, NULL, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 2)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (2, {courseId}, 1, N'Số đếm & Thời gian', N'Học số đếm và cách nói về thời gian', NULL, 2, 1, 1, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 3)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (3, {courseId}, 1, N'Người & Gia đình', N'Từ vựng về người và gia đình', NULL, 3, 1, 2, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 4)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (4, {courseId}, 1, N'Động từ cơ bản', N'Các động từ thường dùng nhất', NULL, 4, 1, 3, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 5)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (5, {courseId}, 1, N'Tính từ & Mô tả', N'Tính từ và từ mô tả cơ bản', NULL, 5, 1, 4, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 6)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (6, {courseId}, 1, N'Địa điểm & Phương hướng', N'Nơi chốn và phương hướng', NULL, 6, 1, 5, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 7)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (7, {courseId}, 1, N'Thức ăn & Đồ uống', N'Đồ ăn và thức uống', NULL, 7, 1, 6, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 8)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (8, {courseId}, 1, N'Màu sắc & Đồ vật', N'Màu sắc và đồ vật thường dùng', NULL, 8, 1, 7, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 9)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (9, {courseId}, 1, N'Thời tiết & Thiên nhiên', N'Thời tiết và thiên nhiên', NULL, 9, 1, 8, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 10)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (10, {courseId}, 1, N'Cơ thể & Sức khỏe', N'Bộ phận cơ thể và sức khỏe', NULL, 10, 1, 9, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 11)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (11, {courseId}, 1, N'Hoạt động hàng ngày', N'Các hoạt động thường ngày', NULL, 11, 1, 10, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");

            migrationBuilder.Sql($@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                BEGIN
                    SET IDENTITY_INSERT LessonTopics ON;
                    IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE HSKLevel = 1 AND TopicIndex = 12)
                    INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                    VALUES (12, {courseId}, 1, N'Tổng hợp & Ôn tập', N'Từ vựng tổng hợp và ôn tập', NULL, 12, 1, 11, GETDATE(), 1);
                    SET IDENTITY_INSERT LessonTopics OFF;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = NULL WHERE HSKLevel = 1;
                DELETE FROM LessonTopics WHERE HSKLevel = 1;
            ");
        }
    }
}

