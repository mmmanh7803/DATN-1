using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLessonIdFromWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Xóa foreign key constraint nếu tồn tại
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Words_Lessons_LessonId')
                BEGIN
                    ALTER TABLE [Words] DROP CONSTRAINT [FK_Words_Lessons_LessonId];
                END
            ");

            // Xóa index nếu tồn tại
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Words_LessonId' AND object_id = OBJECT_ID('Words'))
                BEGIN
                    DROP INDEX [IX_Words_LessonId] ON [Words];
                END
            ");

            // Xóa cột LessonId
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Words' AND COLUMN_NAME = 'LessonId')
                BEGIN
                    ALTER TABLE [Words] DROP COLUMN [LessonId];
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Thêm lại cột LessonId
            migrationBuilder.AddColumn<int>(
                name: "LessonId",
                table: "Words",
                type: "int",
                nullable: true);

            // Thêm lại index
            migrationBuilder.CreateIndex(
                name: "IX_Words_LessonId",
                table: "Words",
                column: "LessonId");

            // Thêm lại foreign key
            migrationBuilder.AddForeignKey(
                name: "FK_Words_Lessons_LessonId",
                table: "Words",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}

