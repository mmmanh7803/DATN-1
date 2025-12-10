using Microsoft.EntityFrameworkCore.Migrations;
using System.Text.Json;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedWordExamplesHsk1Topic1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tìm file JSON
            var jsonPath = FindJsonFile();
            if (string.IsNullOrEmpty(jsonPath) || !File.Exists(jsonPath))
            {
                return;
            }

            // Đọc file JSON
            var jsonContent = File.ReadAllText(jsonPath);
            var words = JsonSerializer.Deserialize<List<WordData>>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (words == null || words.Count == 0)
            {
                return;
            }

            // Seed các ví dụ
            foreach (var word in words)
            {
                if (word.Examples == null || word.Examples.Count == 0)
                    continue;

                var wordCharacterEscaped = EscapeSql(word.Character ?? "");

                // Insert từng ví dụ
                for (int i = 0; i < word.Examples.Count; i++)
                {
                    var example = word.Examples[i];
                    var characterEscaped = EscapeSql(example.Chinese ?? "");
                    var pinyinEscaped = EscapeSql(example.Pinyin ?? "");
                    var meaningEscaped = EscapeSql(example.Meaning ?? "");

                    // Tìm WordId từ Character trong database
                    migrationBuilder.Sql($@"
                        DECLARE @WordId INT;
                        SELECT @WordId = Id FROM Words WHERE Character = N'{wordCharacterEscaped}' AND HSKLevel = 1;
                        
                        IF @WordId IS NOT NULL
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM WordExamples 
                                WHERE WordId = @WordId 
                                AND Character = N'{characterEscaped}'
                                AND Pinyin = N'{pinyinEscaped}'
                            )
                            BEGIN
                                INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
                                VALUES (@WordId, N'{characterEscaped}', N'{pinyinEscaped}', N'{meaningEscaped}', NULL, {i})
                            END
                        END
                    ");
                }
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa các ví dụ đã seed (dựa trên Character từ file JSON)
            var wordCharacters = new[] { "不客气", "对不起", "好", "吗", "没关系", "哪", "哪儿", "那", "呢", "你", "请", "是", "喂", "谢谢", "再见", "怎么", "怎么样", "这" };
            
            foreach (var character in wordCharacters)
            {
                var characterEscaped = EscapeSql(character);
                migrationBuilder.Sql($@"
                    DELETE FROM WordExamples 
                    WHERE WordId IN (
                        SELECT Id FROM Words WHERE Character = N'{characterEscaped}' AND HSKLevel = 1
                    )
                ");
            }
        }

        private string? FindJsonFile()
        {
            var possiblePaths = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "..", "data", "hsk1_topic1_with_images.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "data", "hsk1_topic1_with_images.json"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "data", "hsk1_topic1_with_images.json"),
            };

            foreach (var path in possiblePaths)
            {
                var fullPath = Path.GetFullPath(path);
                if (File.Exists(fullPath))
                {
                    return fullPath;
                }
            }

            return null;
        }

        private static string EscapeSql(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            return input.Replace("'", "''").Replace("\r", "").Replace("\n", " ");
        }

        // Classes để deserialize JSON
        private class WordData
        {
            public string? Character { get; set; }
            public int Id { get; set; }
            public List<ExampleData>? Examples { get; set; }
        }

        private class ExampleData
        {
            public string? Chinese { get; set; }
            public string? Pinyin { get; set; }
            public string? Meaning { get; set; }
        }
    }
}

