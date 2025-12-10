using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedGrammarDataHsk1Topic1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "data", "hsk1_topic1_with_images.json");
            if (!File.Exists(jsonPath))
            {
                Console.WriteLine($"[Migration] File JSON not found: {jsonPath}");
                return;
            }

            var jsonContent = File.ReadAllText(jsonPath);
            var wordsWithGrammar = JsonSerializer.Deserialize<List<WordWithGrammarDto>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (wordsWithGrammar == null || !wordsWithGrammar.Any())
            {
                Console.WriteLine("[Migration] No words with grammar found in JSON.");
                return;
            }

            foreach (var wordData in wordsWithGrammar)
            {
                if (wordData.Id <= 0)
                {
                    continue;
                }

                var updates = new List<string>();

                if (!string.IsNullOrEmpty(wordData.PartOfSpeech))
                {
                    updates.Add($"PartOfSpeech = N'{EscapeSql(wordData.PartOfSpeech)}'");
                }

                if (!string.IsNullOrEmpty(wordData.PartOfSpeechVi))
                {
                    updates.Add($"PartOfSpeechVi = N'{EscapeSql(wordData.PartOfSpeechVi)}'");
                }

                if (!string.IsNullOrEmpty(wordData.PartOfSpeechEn))
                {
                    updates.Add($"PartOfSpeechEn = N'{EscapeSql(wordData.PartOfSpeechEn)}'");
                }

                if (!string.IsNullOrEmpty(wordData.GrammarNote))
                {
                    updates.Add($"GrammarNote = N'{EscapeSql(wordData.GrammarNote)}'");
                }

                if (!string.IsNullOrEmpty(wordData.Structure))
                {
                    updates.Add($"Structure = N'{EscapeSql(wordData.Structure)}'");
                }

                if (updates.Any())
                {
                    var updateSql = $@"
                        UPDATE Words 
                        SET {string.Join(", ", updates)}
                        WHERE Id = {wordData.Id};
                    ";

                    migrationBuilder.Sql(updateSql);
                }
            }

            Console.WriteLine($"[Migration] Updated grammar data for {wordsWithGrammar.Count} words.");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa dữ liệu ngữ pháp (set về NULL)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET PartOfSpeech = NULL,
                    PartOfSpeechVi = NULL,
                    PartOfSpeechEn = NULL,
                    GrammarNote = NULL,
                    Structure = NULL
                WHERE HSKLevel = 1 AND TopicId = 1;
            ");
        }

        private static string EscapeSql(string value)
        {
            if (string.IsNullOrEmpty(value))
                return string.Empty;

            return value.Replace("'", "''");
        }

        private class WordWithGrammarDto
        {
            public int Id { get; set; }
            public string? PartOfSpeech { get; set; }
            public string? PartOfSpeechVi { get; set; }
            public string? PartOfSpeechEn { get; set; }
            public string? GrammarNote { get; set; }
            public string? Structure { get; set; }
        }
    }
}

