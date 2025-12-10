using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGrammarFieldsToWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Thêm các cột ngữ pháp vào bảng Words
            migrationBuilder.AddColumn<string>(
                name: "PartOfSpeech",
                table: "Words",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PartOfSpeechVi",
                table: "Words",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PartOfSpeechEn",
                table: "Words",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GrammarNote",
                table: "Words",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Structure",
                table: "Words",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            // Tạo index cho PartOfSpeech để dễ tìm kiếm
            migrationBuilder.CreateIndex(
                name: "IX_Words_PartOfSpeech",
                table: "Words",
                column: "PartOfSpeech");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa index
            migrationBuilder.DropIndex(
                name: "IX_Words_PartOfSpeech",
                table: "Words");

            // Xóa các cột
            migrationBuilder.DropColumn(
                name: "PartOfSpeech",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "PartOfSpeechVi",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "PartOfSpeechEn",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "GrammarNote",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "Structure",
                table: "Words");
        }
    }
}

