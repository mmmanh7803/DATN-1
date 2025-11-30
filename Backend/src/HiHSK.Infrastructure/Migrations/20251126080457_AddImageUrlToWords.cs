using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Words",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Words");
        }
    }
}
