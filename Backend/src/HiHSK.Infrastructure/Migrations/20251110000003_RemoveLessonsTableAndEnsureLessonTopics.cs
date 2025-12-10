using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    public partial class RemoveLessonsTableAndEnsureLessonTopics : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop all foreign keys referencing Lessons table from other tables
            migrationBuilder.Sql(@"
                DECLARE @sql NVARCHAR(MAX) = '';
                SELECT @sql = @sql + 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];' + CHAR(13)
                FROM sys.foreign_keys
                WHERE referenced_object_id = OBJECT_ID('Lessons');
                EXEC sp_executesql @sql;
            ");

            // Xóa foreign keys từ bảng Lessons (nếu có)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Lessons_Courses_CourseId')
                    ALTER TABLE [Lessons] DROP CONSTRAINT [FK_Lessons_Courses_CourseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Lessons_Lessons_PrerequisiteLessonId')
                    ALTER TABLE [Lessons] DROP CONSTRAINT [FK_Lessons_Lessons_PrerequisiteLessonId];
            ");

            // Xóa indexes của bảng Lessons (nếu có)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Lessons_PrerequisiteLessonId' AND object_id = OBJECT_ID('Lessons'))
                    DROP INDEX [IX_Lessons_PrerequisiteLessonId] ON [Lessons];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Lessons_CourseId_LessonIndex' AND object_id = OBJECT_ID('Lessons'))
                    DROP INDEX [IX_Lessons_CourseId_LessonIndex] ON [Lessons];
            ");

            // Xóa bảng Lessons (nếu tồn tại)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Lessons')
                    DROP TABLE [Lessons];
            ");

            // Không tạo lại bảng LessonTopics ở đây vì migration 20251107135905_AddLessonTopicAndExercise đã tạo rồi
            // Migration này chỉ có nhiệm vụ xóa bảng Lessons
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Tạo lại bảng Lessons (nếu cần rollback)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Lessons')
                    AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Courses')
                BEGIN
                    CREATE TABLE [Lessons] (
                        [Id] int NOT NULL IDENTITY,
                        [CourseId] int NOT NULL,
                        [Title] nvarchar(250) NOT NULL,
                        [LessonIndex] int NOT NULL,
                        CONSTRAINT [PK_Lessons] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Lessons_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE CASCADE
                    );

                    CREATE INDEX [IX_Lessons_CourseId_LessonIndex] ON [Lessons] ([CourseId], [LessonIndex]);
                END
            ");
        }
    }
}

