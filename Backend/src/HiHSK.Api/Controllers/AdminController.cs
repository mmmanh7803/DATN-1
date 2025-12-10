using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;

namespace HiHSK.Api.Controllers;

/// <summary>
/// Controller cho các chức năng quản trị (Admin)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;
    private readonly IWordClassificationService _wordClassificationService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(
        ApplicationDbContext context, 
        ILogger<AdminController> logger,
        IWordClassificationService wordClassificationService,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _logger = logger;
        _wordClassificationService = wordClassificationService;
        _userManager = userManager;
    }

    /// <summary>
    /// Seed dữ liệu từ file JSON vào database
    /// </summary>
    /// <param name="fileName">Tên file JSON trong thư mục data (ví dụ: seed-data-hsk1.json)</param>
    /// <param name="clearExisting">Xóa dữ liệu cũ trước khi seed (mặc định: false)</param>
    [HttpPost("seed")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth để seed data
    public async Task<IActionResult> SeedData(
        [FromQuery] string fileName = "seed-data-hsk1.json",
        [FromQuery] bool clearExisting = false)
    {
        try
        {
            // Đường dẫn file JSON
            var dataFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..", "..", "..", "..", "data", fileName
            );

            // Hoặc nếu file ở trong thư mục data của project
            if (!System.IO.File.Exists(dataFolder))
            {
                dataFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "..", "..", "data", fileName
                );
            }

            if (!System.IO.File.Exists(dataFolder))
            {
                return NotFound(new { message = $"Không tìm thấy file: {fileName}", path = dataFolder });
            }

            _logger.LogInformation($"Bắt đầu seed data từ file: {dataFolder}");

            // Xóa dữ liệu cũ nếu được yêu cầu
            if (clearExisting)
            {
                _logger.LogWarning("Đang xóa dữ liệu cũ...");
                await ClearExistingDataAsync();
            }

            // Seed data
            var seeder = new DataSeeder(_context);
            await seeder.SeedFromJsonAsync(dataFolder);

            // Đếm số lượng dữ liệu đã seed
            var stats = new
            {
                courseCategories = await _context.CourseCategories.CountAsync(),
                courses = await _context.Courses.CountAsync(),
                lessons = await _context.Lessons.CountAsync(),
                words = await _context.Words.CountAsync(),
                questions = await _context.Questions.CountAsync()
            };

            _logger.LogInformation($"Seed data thành công! Stats: {System.Text.Json.JsonSerializer.Serialize(stats)}");

            return Ok(new
            {
                message = "Seed data thành công!",
                stats = stats
            });
        }
        catch (FileNotFoundException ex)
        {
            _logger.LogError(ex, "File không tồn tại");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi seed data");
            return StatusCode(500, new { message = "Lỗi khi seed data", error = ex.Message });
        }
    }

    /// <summary>
    /// Xóa tất cả dữ liệu seed (cẩn thận!)
    /// </summary>
    [HttpPost("clear-data")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth để xóa data
    public async Task<IActionResult> ClearData()
    {
        try
        {
            await ClearExistingDataAsync();
            return Ok(new { message = "Đã xóa tất cả dữ liệu seed" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa dữ liệu");
            return StatusCode(500, new { message = "Lỗi khi xóa dữ liệu", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thống kê dữ liệu hiện tại
    /// </summary>
    [HttpGet("stats")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth để kiểm tra
    public async Task<IActionResult> GetStats()
    {
        var stats = new
        {
            courseCategories = await _context.CourseCategories.CountAsync(),
            courses = await _context.Courses.CountAsync(),
            lessons = await _context.LessonTopics.CountAsync(),
            words = await _context.Words.CountAsync(),
            questions = await _context.Questions.CountAsync(),
            questionOptions = await _context.QuestionOptions.CountAsync(),
            vocabularyTopics = await _context.VocabularyTopics.CountAsync()
        };

        return Ok(stats);
    }

    /// <summary>
    /// Seed Vocabulary Topic cho HSK1 và gán tất cả từ vựng HSK1 vào topic
    /// </summary>
    [HttpPost("seed-vocabulary-topic-hsk1")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth để seed data
    public async Task<IActionResult> SeedVocabularyTopicHsk1()
    {
        try
        {
            _logger.LogInformation("Bắt đầu seed Vocabulary Topic HSK1...");

            // Kiểm tra xem Vocabulary Topic HSK1 đã tồn tại chưa (theo tên hoặc Id)
            var existingTopic = await _context.VocabularyTopics
                .FirstOrDefaultAsync(t => t.Name == "HSK 1" || t.Id == 1);

            int topicId;
            if (existingTopic == null)
            {
                // Tạo Vocabulary Topic HSK1 - không set Id, để database tự generate
                var vocabularyTopic = new VocabularyTopic
                {
                    Name = "HSK 1",
                    Description = "Từ vựng HSK Cấp độ 1 - 150 từ vựng cơ bản",
                    ImageUrl = null,
                    SortOrder = 1
                };

                _context.VocabularyTopics.Add(vocabularyTopic);
                await _context.SaveChangesAsync();
                topicId = vocabularyTopic.Id;
                _logger.LogInformation($"Đã tạo Vocabulary Topic HSK1 (Id={topicId})");
            }
            else
            {
                topicId = existingTopic.Id;
                _logger.LogInformation($"Vocabulary Topic HSK1 đã tồn tại (Id={topicId}), bỏ qua tạo mới");
            }

            // Lấy tất cả từ vựng HSK1
            // Sử dụng raw SQL với NULL AS TopicId để tránh lỗi nếu cột TopicId chưa tồn tại
            // EF Core yêu cầu tất cả các cột của entity phải có trong SELECT
            var hsk1Words = await _context.Words
                .FromSqlRaw(@"
                    SELECT Id, Character, Pinyin, Meaning, HSKLevel, LessonId, 
                           AudioUrl, ExampleSentence, Frequency, StrokeCount, CreatedAt,
                           CAST(NULL AS int) AS TopicId
                    FROM Words 
                    WHERE HSKLevel = {0}", 1)
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation($"Tìm thấy {hsk1Words.Count} từ vựng HSK1");

            if (hsk1Words.Count == 0)
            {
                return BadRequest(new
                {
                    message = "Không tìm thấy từ vựng HSK1. Vui lòng seed từ vựng trước.",
                    vocabularyTopicId = topicId
                });
            }

            // Gán từ vựng vào Vocabulary Topic (tránh duplicate) - sử dụng batch insert
            int addedCount = 0;
            var linksToAdd = new List<WordVocabularyTopic>();

            foreach (var word in hsk1Words)
            {
                var existingLink = await _context.WordVocabularyTopics
                    .FirstOrDefaultAsync(wvt => wvt.WordId == word.Id && wvt.VocabularyTopicId == topicId);

                if (existingLink == null)
                {
                    linksToAdd.Add(new WordVocabularyTopic
                    {
                        WordId = word.Id,
                        VocabularyTopicId = topicId
                    });
                }
            }

            if (linksToAdd.Count > 0)
            {
                _context.WordVocabularyTopics.AddRange(linksToAdd);
                await _context.SaveChangesAsync();
                addedCount = linksToAdd.Count;
                _logger.LogInformation($"Đã gán {addedCount} từ vựng vào Vocabulary Topic HSK1 (Id={topicId})");
            }
            else
            {
                _logger.LogInformation($"Tất cả từ vựng đã được gán vào Vocabulary Topic HSK1 (Id={topicId})");
            }

            return Ok(new
            {
                message = "Seed Vocabulary Topic HSK1 thành công!",
                vocabularyTopicId = topicId,
                totalWords = hsk1Words.Count,
                addedWords = addedCount,
                existingWords = hsk1Words.Count - addedCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi seed Vocabulary Topic HSK1");
            
            // Log inner exception nếu có
            var errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
                _logger.LogError(ex.InnerException, "Inner exception");
            }

            return StatusCode(500, new 
            { 
                message = "Lỗi khi seed Vocabulary Topic HSK1", 
                error = errorMessage,
                details = ex.ToString()
            });
        }
    }

    private async Task ClearExistingDataAsync()
    {
        try
        {
            _logger.LogInformation("Bắt đầu xóa dữ liệu seed...");

            // Sử dụng raw SQL để xóa nhanh và tránh lỗi Foreign Key
            // Xóa theo thứ tự để tránh lỗi Foreign Key constraint
            
            _logger.LogInformation("Xóa WordVocabularyTopics...");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM WordVocabularyTopics WHERE VocabularyTopicId = 1 OR VocabularyTopicId IN (SELECT Id FROM VocabularyTopics WHERE Name = 'HSK 1')");
            
            _logger.LogInformation("Xóa User progress data...");
            await _context.Database.ExecuteSqlRawAsync(@"
                DELETE FROM UserWordProgresses WHERE WordId IN (SELECT Id FROM Words WHERE HSKLevel = 1);
                DELETE FROM UserLessonStatuses WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1);
                DELETE FROM UserCourseStatuses WHERE CourseId = 1;
                DELETE FROM UserAnswers WHERE QuestionId IN (SELECT Id FROM Questions WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1));
                DELETE FROM UserLessonProgresses WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1);
            ");

            _logger.LogInformation("Xóa Questions và Options...");
            await _context.Database.ExecuteSqlRawAsync(@"
                DELETE FROM QuestionOptions WHERE QuestionId IN (SELECT Id FROM Questions WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1));
                DELETE FROM Questions WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1);
            ");

            _logger.LogInformation("Xóa Reading Passages và Dialogues...");
            await _context.Database.ExecuteSqlRawAsync(@"
                DELETE FROM ReadingPassageWords WHERE ReadingPassageId IN (SELECT Id FROM ReadingPassages WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1));
                DELETE FROM ReadingPassages WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1);
                DELETE FROM DialogueSentences WHERE DialogueId IN (SELECT Id FROM Dialogues WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1));
                DELETE FROM Dialogues WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1);
                DELETE FROM SentencePatterns WHERE LessonId IN (SELECT Id FROM Lessons WHERE CourseId = 1);
            ");

            _logger.LogInformation("Xóa Words...");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Words WHERE HSKLevel = 1");

            _logger.LogInformation("Xóa Lessons...");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Lessons WHERE CourseId = 1");

            _logger.LogInformation("Xóa Courses...");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Courses WHERE CategoryId = 1");

            _logger.LogInformation("Xóa Course Categories...");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM CourseCategories WHERE Name = 'HSK1'");

            _logger.LogInformation("Xóa Vocabulary Topics...");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM VocabularyTopics WHERE Name = 'HSK 1' OR Id = 1");

            _logger.LogInformation("Đã xóa tất cả dữ liệu seed thành công!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa dữ liệu: {Message}", ex.Message);
            if (ex.InnerException != null)
            {
                _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
            }
            throw;
        }
    }

    /// <summary>
    /// Cập nhật tất cả ExampleSentence thành NULL (rỗng) trong bảng Words
    /// </summary>
    [HttpPost("clear-example-sentences")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth
    public async Task<IActionResult> ClearExampleSentences()
    {
        try
        {
            _logger.LogInformation("Bắt đầu cập nhật ExampleSentence thành NULL...");

            // Đếm số lượng bản ghi trước khi update
            var countBefore = await _context.Words
                .Where(w => w.ExampleSentence != null && w.ExampleSentence != "")
                .CountAsync();

            _logger.LogInformation($"Số lượng bản ghi có ExampleSentence trước khi update: {countBefore}");

            // Cập nhật tất cả ExampleSentence thành NULL
            var updatedCount = await _context.Database.ExecuteSqlRawAsync(@"
                UPDATE Words
                SET ExampleSentence = NULL
                WHERE ExampleSentence IS NOT NULL AND ExampleSentence != ''
            ");

            // Đếm số lượng bản ghi sau khi update
            var countAfter = await _context.Words
                .Where(w => w.ExampleSentence != null && w.ExampleSentence != "")
                .CountAsync();

            // Lấy thống kê
            var totalWords = await _context.Words.CountAsync();
            var wordsWithEmptyExample = await _context.Words
                .Where(w => w.ExampleSentence == null || w.ExampleSentence == "")
                .CountAsync();
            var wordsWithExample = await _context.Words
                .Where(w => w.ExampleSentence != null && w.ExampleSentence != "")
                .CountAsync();

            _logger.LogInformation($"Cập nhật thành công! Đã cập nhật {updatedCount} bản ghi.");

            return Ok(new
            {
                message = "Cập nhật ExampleSentence thành công!",
                updatedCount = updatedCount,
                countBefore = countBefore,
                countAfter = countAfter,
                stats = new
                {
                    totalWords = totalWords,
                    wordsWithEmptyExample = wordsWithEmptyExample,
                    wordsWithExample = wordsWithExample
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật ExampleSentence");
            return StatusCode(500, new
            {
                message = "Lỗi khi cập nhật ExampleSentence",
                error = ex.Message
            });
        }
    }

    // ============ WORDS MANAGEMENT ============

    /// <summary>
    /// Lấy danh sách từ vựng (Admin) với filter
    /// </summary>
    [HttpGet("words")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth
    public async Task<IActionResult> GetWords([FromQuery] int? hskLevel, [FromQuery] string? search)
    {
        try
        {
            var query = _context.Words.AsQueryable();

            if (hskLevel.HasValue)
            {
                query = query.Where(w => w.HSKLevel == hskLevel.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();
                query = query.Where(w =>
                    w.Character.Contains(search) ||
                    (w.Pinyin != null && w.Pinyin.Contains(search)) ||
                    (w.Meaning != null && w.Meaning.Contains(search))
                );
            }

            var words = await query
                .OrderBy(w => w.HSKLevel)
                .ThenBy(w => w.Character)
                .Select(w => new
                {
                    id = w.Id,
                    character = w.Character,
                    pinyin = w.Pinyin,
                    meaning = w.Meaning,
                    hskLevel = w.HSKLevel,
                    topicId = w.TopicId,
                    audioUrl = w.AudioUrl,
                    exampleSentence = w.ExampleSentence,
                    createdAt = w.CreatedAt
                })
                .ToListAsync();

            return Ok(words);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách từ vựng");
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy chi tiết từ vựng (Admin)
    /// </summary>
    [HttpGet("words/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetWordById(int id)
    {
        try
        {
            var word = await _context.Words
                .Where(w => w.Id == id)
                .Select(w => new
                {
                    id = w.Id,
                    character = w.Character,
                    pinyin = w.Pinyin,
                    meaning = w.Meaning,
                    hskLevel = w.HSKLevel,
                    topicId = w.TopicId,
                    audioUrl = w.AudioUrl,
                    exampleSentence = w.ExampleSentence,
                    createdAt = w.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (word == null)
            {
                return NotFound(new { message = "Không tìm thấy từ vựng" });
            }

            return Ok(word);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết từ vựng");
            return StatusCode(500, new { message = "Lỗi khi lấy chi tiết từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Tạo từ vựng mới
    /// </summary>
    [HttpPost("words")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateWord([FromBody] CreateWordDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Character) ||
                string.IsNullOrWhiteSpace(dto.Pinyin) ||
                string.IsNullOrWhiteSpace(dto.Meaning))
            {
                return BadRequest(new { message = "Character, Pinyin và Meaning là bắt buộc" });
            }

            var word = new Word
            {
                Character = dto.Character.Trim(),
                Pinyin = dto.Pinyin.Trim(),
                Meaning = dto.Meaning.Trim(),
                HSKLevel = dto.HskLevel,
                TopicId = dto.TopicId,
                AudioUrl = dto.AudioUrl,
                ExampleSentence = dto.ExampleSentence,
                CreatedAt = DateTime.UtcNow
            };

            _context.Words.Add(word);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = word.Id,
                character = word.Character,
                pinyin = word.Pinyin,
                meaning = word.Meaning,
                hskLevel = word.HSKLevel,
                topicId = word.TopicId,
                audioUrl = word.AudioUrl,
                exampleSentence = word.ExampleSentence,
                createdAt = word.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo từ vựng");
            return StatusCode(500, new { message = "Lỗi khi tạo từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật từ vựng
    /// </summary>
    [HttpPut("words/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateWord(int id, [FromBody] UpdateWordDto dto)
    {
        try
        {
            var word = await _context.Words.FindAsync(id);
            if (word == null)
            {
                return NotFound(new { message = "Không tìm thấy từ vựng" });
            }

            if (!string.IsNullOrWhiteSpace(dto.Character))
                word.Character = dto.Character.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Pinyin))
                word.Pinyin = dto.Pinyin.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Meaning))
                word.Meaning = dto.Meaning.Trim();
            if (dto.HskLevel.HasValue)
                word.HSKLevel = dto.HskLevel;
            if (dto.TopicId.HasValue)
                word.TopicId = dto.TopicId;
            if (dto.AudioUrl != null)
                word.AudioUrl = dto.AudioUrl;
            if (dto.ExampleSentence != null)
                word.ExampleSentence = dto.ExampleSentence;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = word.Id,
                character = word.Character,
                pinyin = word.Pinyin,
                meaning = word.Meaning,
                hskLevel = word.HSKLevel,
                topicId = word.TopicId,
                audioUrl = word.AudioUrl,
                exampleSentence = word.ExampleSentence,
                createdAt = word.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật từ vựng");
            return StatusCode(500, new { message = "Lỗi khi cập nhật từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Xóa từ vựng
    /// </summary>
    [HttpDelete("words/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteWord(int id)
    {
        try
        {
            var word = await _context.Words.FindAsync(id);
            if (word == null)
            {
                return NotFound(new { message = "Không tìm thấy từ vựng" });
            }

            _context.Words.Remove(word);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa từ vựng thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa từ vựng");
            return StatusCode(500, new { message = "Lỗi khi xóa từ vựng", error = ex.Message });
        }
    }

    // ============ MEDIA MANAGEMENT ============

    /// <summary>
    /// Upload media files (images/audio)
    /// </summary>
    [HttpPost("media/upload")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadMedia([FromForm] List<IFormFile> files)
    {
        try
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "Không có file nào được upload" });
            }

            var uploadedFiles = new List<object>();
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".mp3", ".wav", ".webp" };
                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                    if (!allowedExtensions.Contains(extension))
                    {
                        continue; // Skip invalid files
                    }

                    var fileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var fileUrl = $"/uploads/{fileName}";
                    uploadedFiles.Add(new
                    {
                        fileName = file.FileName,
                        url = fileUrl,
                        size = file.Length,
                        contentType = file.ContentType
                    });
                }
            }

            return Ok(new
            {
                message = "Upload thành công",
                files = uploadedFiles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi upload media");
            return StatusCode(500, new { message = "Lỗi khi upload media", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách media
    /// </summary>
    [HttpGet("media")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMedia([FromQuery] string? search)
    {
        try
        {
            // TODO: Implement media library with database storage
            return Ok(new { message = "Chức năng này sẽ được implement sau", media = new List<object>() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách media");
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách media", error = ex.Message });
        }
    }

    // ============ QUIZ MANAGEMENT ============

    /// <summary>
    /// Tạo quiz từ danh sách từ vựng
    /// </summary>
    [HttpPost("quizzes")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
    {
        try
        {
            // TODO: Implement quiz creation logic
            return Ok(new
            {
                message = "Quiz đã được tạo thành công",
                quizId = 0,
                wordCount = dto.WordIds?.Count ?? 0
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo quiz");
            return StatusCode(500, new { message = "Lỗi khi tạo quiz", error = ex.Message });
        }
    }

    // ============ EXPORT/IMPORT ============

    /// <summary>
    /// Lấy danh sách từ vựng chưa có HSK level và xuất ra JSON
    /// </summary>
    [HttpGet("words/without-hsk-level/export")]
    [AllowAnonymous]
    public async Task<IActionResult> ExportWordsWithoutHskLevel()
    {
        try
        {
            var words = await _context.Words
                .Where(w => w.HSKLevel == null)
                .OrderBy(w => w.Character)
                .Select(w => new
                {
                    id = w.Id,
                    character = w.Character,
                    pinyin = w.Pinyin,
                    meaning = w.Meaning,
                    audioUrl = w.AudioUrl,
                    exampleSentence = w.ExampleSentence,
                    frequency = w.Frequency,
                    strokeCount = w.StrokeCount,
                    topicId = w.TopicId,
                    createdAt = w.CreatedAt
                })
                .ToListAsync();

            var result = new
            {
                totalCount = words.Count,
                exportedAt = DateTime.UtcNow,
                words = words
            };

            var json = System.Text.Json.JsonSerializer.Serialize(result, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });

            var fileName = $"words-without-hsk-level_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
            var contentType = "application/json";

            return File(
                System.Text.Encoding.UTF8.GetBytes(json),
                contentType,
                fileName
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi export từ vựng chưa có HSK level");
            return StatusCode(500, new { message = "Lỗi khi export từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách từ vựng chưa có HSK level (API response, không download file)
    /// </summary>
    [HttpGet("words/without-hsk-level")]
    [AllowAnonymous]
    public async Task<IActionResult> GetWordsWithoutHskLevel()
    {
        try
        {
            var words = await _context.Words
                .Where(w => w.HSKLevel == null)
                .OrderBy(w => w.Character)
                .Select(w => new
                {
                    id = w.Id,
                    character = w.Character,
                    pinyin = w.Pinyin,
                    meaning = w.Meaning,
                    audioUrl = w.AudioUrl,
                    exampleSentence = w.ExampleSentence,
                    frequency = w.Frequency,
                    strokeCount = w.StrokeCount,
                    topicId = w.TopicId,
                    createdAt = w.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                totalCount = words.Count,
                words = words
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách từ vựng chưa có HSK level");
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Phân loại từ vựng theo chủ đề (LessonTopic)
    /// </summary>
    [HttpPost("words/classify-by-topic")]
    [AllowAnonymous]
    public async Task<IActionResult> ClassifyWordsByTopic([FromBody] ClassifyWordsRequest request)
    {
        try
        {
            if (request.WordIds == null || !request.WordIds.Any())
            {
                return BadRequest(new { message = "Danh sách wordIds không được rỗng" });
            }

            var classification = await _wordClassificationService.ClassifyWordsByTopicAsync(
                request.WordIds, 
                request.HskLevel);

            return Ok(new
            {
                message = "Phân loại thành công",
                classification = classification,
                totalWords = request.WordIds.Count,
                classifiedWords = classification.Values.Sum(v => v.Count)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi phân loại từ vựng");
            return StatusCode(500, new { message = "Lỗi khi phân loại từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Tự động tổ chức từ vựng HSK1 thành các LessonTopics
    /// </summary>
    [HttpPost("lessontopics/auto-organize-hsk1")]
    [AllowAnonymous]
    public async Task<IActionResult> AutoOrganizeHSK1(
        [FromQuery] string strategy = "thematic",
        [FromQuery] int? wordsPerTopic = null)
    {
        try
        {
            var result = await _wordClassificationService.AutoOrganizeHSK1Async(strategy, wordsPerTopic);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tự động tổ chức từ vựng HSK1");
            return StatusCode(500, new { message = "Lỗi khi tự động tổ chức", error = ex.Message });
        }
    }

    /// <summary>
    /// Gán từ vựng vào topic cụ thể
    /// </summary>
    [HttpPost("words/assign-to-topic")]
    [AllowAnonymous]
    public async Task<IActionResult> AssignWordsToTopic([FromBody] AssignWordsToTopicRequest request)
    {
        try
        {
            if (request.WordIds == null || !request.WordIds.Any())
            {
                return BadRequest(new { message = "Danh sách wordIds không được rỗng" });
            }

            var success = await _wordClassificationService.AssignWordsToTopicAsync(
                request.WordIds, 
                request.TopicId);

            if (success)
            {
                return Ok(new
                {
                    message = $"Đã gán {request.WordIds.Count} từ vựng vào topic {request.TopicId}",
                    wordCount = request.WordIds.Count,
                    topicId = request.TopicId
                });
            }

            return StatusCode(500, new { message = "Không thể gán từ vựng vào topic" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gán từ vựng vào topic");
            return StatusCode(500, new { message = "Lỗi khi gán từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Gợi ý topic phù hợp cho từ vựng
    /// </summary>
    [HttpGet("words/{wordId}/suggest-topic")]
    [AllowAnonymous]
    public async Task<IActionResult> SuggestTopicForWord(
        [FromRoute] int wordId,
        [FromQuery] int hskLevel = 1)
    {
        try
        {
            var topicId = await _wordClassificationService.SuggestTopicForWordAsync(wordId, hskLevel);

            if (topicId.HasValue)
            {
                var topic = await _context.LessonTopics.FindAsync(topicId.Value);
                return Ok(new
                {
                    wordId = wordId,
                    suggestedTopicId = topicId.Value,
                    suggestedTopicTitle = topic?.Title
                });
            }

            return NotFound(new { message = "Không tìm thấy topic phù hợp" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gợi ý topic cho từ vựng");
            return StatusCode(500, new { message = "Lỗi khi gợi ý topic", error = ex.Message });
        }
    }

    /// <summary>
    /// Export dữ liệu ra JSON để backup
    /// </summary>
    [HttpGet("words/export")]
    [AllowAnonymous]
    public async Task<IActionResult> ExportWords(
        [FromQuery] int? hskLevel = null,
        [FromQuery] bool includeTopics = true,
        [FromQuery] bool includeLessons = true,
        [FromQuery] bool includeQuestions = false)
    {
        try
        {
            _logger.LogInformation($"Bắt đầu export dữ liệu - HSKLevel: {hskLevel}, IncludeTopics: {includeTopics}");

            var exportData = new ExportDataDto();

            // Export CourseCategories
            var categories = await _context.CourseCategories
                .Where(c => hskLevel == null || c.Name.Contains($"HSK{hskLevel}"))
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            exportData.CourseCategories = categories.Select(c => new CourseCategoryExportDto
            {
                Id = c.Id,
                Name = c.Name,
                DisplayName = c.DisplayName,
                Description = c.Description,
                IconUrl = c.IconUrl,
                SortOrder = c.SortOrder
            }).ToList();

            // Export Courses
            var courses = await _context.Courses
                .Where(c => hskLevel == null || c.HSKLevel == hskLevel)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            exportData.Courses = courses.Select(c => new CourseExportDto
            {
                Id = c.Id,
                CategoryId = c.CategoryId,
                Title = c.Title,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                Level = c.Level,
                HSKLevel = c.HSKLevel,
                SortOrder = c.SortOrder,
                IsActive = c.IsActive
            }).ToList();

            // Export Lessons (nếu có)
            if (includeLessons)
            {
                var courseIds = courses.Select(c => c.Id).ToList();
                var lessons = await _context.Lessons
                    .Where(l => courseIds.Contains(l.CourseId))
                    .OrderBy(l => l.LessonIndex)
                    .ToListAsync();

                exportData.Lessons = lessons.Select(l => new LessonExportDto
                {
                    Id = l.Id,
                    CourseId = l.CourseId,
                    Title = l.Title,
                    Description = l.Description,
                    LessonIndex = l.LessonIndex,
                    Content = l.Content,
                    IsLocked = l.IsLocked,
                    PrerequisiteLessonId = l.PrerequisiteLessonId,
                    IsActive = l.IsActive
                }).ToList();
            }

            // Export LessonTopics (nếu có)
            if (includeTopics)
            {
                var topics = await _context.LessonTopics
                    .Where(t => hskLevel == null || t.HSKLevel == hskLevel)
                    .OrderBy(t => t.TopicIndex)
                    .ToListAsync();

                exportData.LessonTopics = topics.Select(t => new LessonTopicExportDto
                {
                    Id = t.Id,
                    CourseId = t.CourseId,
                    HSKLevel = t.HSKLevel,
                    Title = t.Title,
                    Description = t.Description,
                    ImageUrl = t.ImageUrl,
                    TopicIndex = t.TopicIndex,
                    IsLocked = t.IsLocked,
                    PrerequisiteTopicId = t.PrerequisiteTopicId,
                    IsActive = t.IsActive
                }).ToList();
            }

            // Export Words
            var wordsQuery = _context.Words.AsQueryable();
            if (hskLevel.HasValue)
            {
                wordsQuery = wordsQuery.Where(w => w.HSKLevel == hskLevel);
            }

            var words = await wordsQuery
                .OrderBy(w => w.Id)
                .ToListAsync();

            exportData.Words = words.Select(w => new WordExportDto
            {
                Id = w.Id,
                TopicId = w.TopicId,
                Character = w.Character,
                Pinyin = w.Pinyin,
                Meaning = w.Meaning,
                AudioUrl = w.AudioUrl,
                ExampleSentence = w.ExampleSentence,
                HSKLevel = w.HSKLevel,
                Frequency = w.Frequency,
                StrokeCount = w.StrokeCount
            }).ToList();

            // Export Questions (nếu có)
            if (includeQuestions)
            {
                var lessonIds = exportData.Lessons.Select(l => l.Id).ToList();
                var questions = await _context.Questions
                    .Where(q => lessonIds.Contains(q.LessonId ?? 0))
                    .Include(q => q.QuestionOptions)
                    .ToListAsync();

                exportData.Questions = questions.Select(q => new QuestionExportDto
                    {
                        Id = q.Id,
                        LessonId = q.LessonId,
                        ExerciseId = q.ExerciseId,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        AudioUrl = q.AudioUrl,
                        Points = q.Points,
                        DifficultyLevel = q.DifficultyLevel,
                        Explanation = q.Explanation,
                        Options = q.QuestionOptions
                            .OrderBy(o => o.OptionLabel)
                            .Select((o, index) => new QuestionOptionExportDto
                            {
                                Id = o.Id,
                                OptionText = o.OptionText,
                                IsCorrect = o.IsCorrect,
                                OptionOrder = index
                            }).ToList()
                }).ToList();
            }

            // Metadata
            exportData.Metadata = new ExportMetadata
            {
                ExportedAt = DateTime.UtcNow,
                TotalWords = exportData.Words.Count,
                TotalTopics = exportData.LessonTopics.Count,
                TotalLessons = exportData.Lessons.Count,
                Version = "1.0"
            };

            _logger.LogInformation($"Export thành công: {exportData.Words.Count} từ vựng, {exportData.LessonTopics.Count} topics");

            // Trả về JSON file
            var jsonOptions = new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var json = System.Text.Json.JsonSerializer.Serialize(exportData, jsonOptions);
            var fileName = hskLevel.HasValue 
                ? $"export-hsk{hskLevel}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json"
                : $"export-all-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json";

            return File(
                System.Text.Encoding.UTF8.GetBytes(json),
                "application/json",
                fileName
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi export dữ liệu");
            return StatusCode(500, new { message = "Lỗi khi export dữ liệu", error = ex.Message });
        }
    }

    // ============ USER MANAGEMENT ============

    /// <summary>
    /// Lấy danh sách tất cả users (Admin only)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? search)
    {
        try
        {
            var usersQuery = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                usersQuery = usersQuery.Where(u => 
                    (u.Email != null && u.Email.ToLower().Contains(search)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(search)));
            }

            var users = await usersQuery.ToListAsync();
            
            var result = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new
                {
                    id = user.Id,
                    email = user.Email,
                    userName = user.UserName,
                    roles = roles.ToList(),
                    emailConfirmed = user.EmailConfirmed,
                    lockoutEnd = user.LockoutEnd,
                    lockoutEnabled = user.LockoutEnabled,
                    accessFailedCount = user.AccessFailedCount
                });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách users");
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách users", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết user
    /// </summary>
    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy user" });
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                userName = user.UserName,
                roles = roles.ToList(),
                emailConfirmed = user.EmailConfirmed,
                lockoutEnd = user.LockoutEnd,
                lockoutEnabled = user.LockoutEnabled,
                accessFailedCount = user.AccessFailedCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin user");
            return StatusCode(500, new { message = "Lỗi khi lấy thông tin user", error = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật roles cho user
    /// </summary>
    [HttpPut("users/{id}/roles")]
    public async Task<IActionResult> UpdateUserRoles(string id, [FromBody] UpdateUserRolesDto dto)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy user" });
            }

            // Lấy roles hiện tại
            var currentRoles = await _userManager.GetRolesAsync(user);

            // Xóa tất cả roles hiện tại
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return BadRequest(new { message = "Không thể xóa roles cũ", errors = removeResult.Errors });
            }

            // Thêm roles mới
            if (dto.Roles != null && dto.Roles.Any())
            {
                var addResult = await _userManager.AddToRolesAsync(user, dto.Roles);
                if (!addResult.Succeeded)
                {
                    return BadRequest(new { message = "Không thể thêm roles mới", errors = addResult.Errors });
                }
            }

            var newRoles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                message = "Cập nhật roles thành công",
                userId = user.Id,
                roles = newRoles.ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật roles");
            return StatusCode(500, new { message = "Lỗi khi cập nhật roles", error = ex.Message });
        }
    }

    /// <summary>
    /// Gán role Admin cho user
    /// </summary>
    [HttpPost("users/{id}/make-admin")]
    public async Task<IActionResult> MakeAdmin(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy user" });
            }

            if (await _userManager.IsInRoleAsync(user, "Admin"))
            {
                return BadRequest(new { message = "User đã là Admin" });
            }

            var result = await _userManager.AddToRoleAsync(user, "Admin");
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Không thể gán role Admin", errors = result.Errors });
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                message = "Đã gán role Admin thành công",
                userId = user.Id,
                email = user.Email,
                roles = roles.ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gán role Admin");
            return StatusCode(500, new { message = "Lỗi khi gán role Admin", error = ex.Message });
        }
    }

    /// <summary>
    /// Gỡ role Admin khỏi user
    /// </summary>
    [HttpPost("users/{id}/remove-admin")]
    public async Task<IActionResult> RemoveAdmin(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy user" });
            }

            if (!await _userManager.IsInRoleAsync(user, "Admin"))
            {
                return BadRequest(new { message = "User không phải là Admin" });
            }

            var result = await _userManager.RemoveFromRoleAsync(user, "Admin");
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Không thể gỡ role Admin", errors = result.Errors });
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                message = "Đã gỡ role Admin thành công",
                userId = user.Id,
                email = user.Email,
                roles = roles.ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gỡ role Admin");
            return StatusCode(500, new { message = "Lỗi khi gỡ role Admin", error = ex.Message });
        }
    }

    /// <summary>
    /// Xóa user (cẩn thận!)
    /// </summary>
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy user" });
            }

            // Không cho phép xóa admin@hihsk.com
            if (user.Email?.ToLower() == "admin@hihsk.com")
            {
                return BadRequest(new { message = "Không thể xóa tài khoản admin mặc định" });
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Không thể xóa user", errors = result.Errors });
            }

            return Ok(new { message = "Đã xóa user thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa user");
            return StatusCode(500, new { message = "Lỗi khi xóa user", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách tất cả roles
    /// </summary>
    [HttpGet("roles")]
    public IActionResult GetRoles()
    {
        return Ok(new
        {
            roles = new[] { "Admin", "User" }
        });
    }

    // ============ QUESTION MANAGEMENT ============

    /// <summary>
    /// Lấy danh sách câu hỏi (phân loại theo đề thi hoặc hoạt động)
    /// </summary>
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] bool? forExam = null,
        [FromQuery] string? skillType = null,
        [FromQuery] int? partNumber = null,
        [FromQuery] string? questionType = null,
        [FromQuery] string? exerciseType = null,
        [FromQuery] int? exerciseId = null,
        [FromQuery] int? topicId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var query = _context.Questions
                .Include(q => q.QuestionOptions)
                .Include(q => q.Exercise)
                .AsQueryable();

            // Filter: Câu hỏi đề thi (có SkillType, không có ExerciseId)
            if (forExam == true)
            {
                query = query.Where(q => q.SkillType != null && q.ExerciseId == null);
            }
            // Filter: Câu hỏi hoạt động (có ExerciseId)
            else if (forExam == false)
            {
                query = query.Where(q => q.ExerciseId != null);
            }

            // Filter theo SkillType (cho câu hỏi đề thi)
            if (!string.IsNullOrEmpty(skillType))
            {
                query = query.Where(q => q.SkillType == skillType.ToUpper());
            }

            // Filter theo PartNumber (cho câu hỏi đề thi)
            if (partNumber.HasValue)
            {
                query = query.Where(q => q.PartNumber == partNumber.Value);
            }

            // Filter theo QuestionType
            if (!string.IsNullOrEmpty(questionType))
            {
                query = query.Where(q => q.QuestionType == questionType.ToUpper());
            }

            // Filter theo ExerciseType (cho câu hỏi hoạt động)
            if (!string.IsNullOrEmpty(exerciseType))
            {
                query = query.Where(q => q.Exercise != null && q.Exercise.ExerciseType == exerciseType.ToUpper());
            }

            // Filter theo ExerciseId cụ thể
            if (exerciseId.HasValue)
            {
                query = query.Where(q => q.ExerciseId == exerciseId.Value);
            }

            // Filter theo TopicId (thông qua Exercise)
            if (topicId.HasValue)
            {
                query = query.Where(q => q.Exercise != null && q.Exercise.TopicId == topicId.Value);
            }

            var totalCount = await query.CountAsync();

            var questions = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    q.QuestionType,
                    q.SkillType,
                    q.PartNumber,
                    q.ExerciseId,
                    q.Points,
                    q.DifficultyLevel,
                    q.AudioUrl,
                    q.ImageUrl,
                    q.CreatedAt,
                    // Thông tin Exercise (cho câu hỏi hoạt động)
                    Exercise = q.Exercise != null ? new
                    {
                        q.Exercise.Id,
                        q.Exercise.ExerciseType,
                        q.Exercise.Title,
                        q.Exercise.TopicId
                    } : null,
                    Options = q.QuestionOptions.OrderBy(o => o.OptionLabel).Select(o => new
                    {
                        o.Id,
                        o.OptionLabel,
                        o.OptionText,
                        o.ImageUrl,
                        o.IsCorrect
                    })
                })
                .ToListAsync();

            return Ok(new
            {
                data = questions,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách câu hỏi");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }

    /// <summary>
    /// Tạo câu hỏi mới
    /// </summary>
    [HttpPost("questions")]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto dto)
    {
        try
        {
            var question = new Question
            {
                QuestionText = dto.QuestionText,
                QuestionType = dto.QuestionType?.ToUpper() ?? "MULTIPLE_CHOICE",
                SkillType = dto.SkillType?.ToUpper(),
                PartNumber = dto.PartNumber,
                ExerciseId = dto.ExerciseId,
                Instruction = dto.Instruction,
                AudioUrl = dto.AudioUrl,
                ImageUrl = dto.ImageUrl,
                BlankSentence = dto.BlankSentence,
                Points = dto.Points ?? 1,
                DifficultyLevel = dto.DifficultyLevel ?? 1,
                Explanation = dto.Explanation,
                CreatedAt = DateTime.UtcNow
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            // Thêm options
            if (dto.Options != null && dto.Options.Count > 0)
            {
                foreach (var optDto in dto.Options)
                {
                    var option = new QuestionOption
                    {
                        QuestionId = question.Id,
                        OptionLabel = optDto.OptionLabel,
                        OptionText = optDto.OptionText ?? "",
                        ImageUrl = optDto.ImageUrl,
                        IsCorrect = optDto.IsCorrect
                    };
                    _context.QuestionOptions.Add(option);
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                success = true,
                message = "Tạo câu hỏi thành công",
                questionId = question.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo câu hỏi");
            return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
        }
    }

    /// <summary>
    /// Xóa câu hỏi
    /// </summary>
    [HttpDelete("questions/{id}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        try
        {
            var question = await _context.Questions
                .Include(q => q.QuestionOptions)
                .Include(q => q.ExamPaperQuestions)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy câu hỏi" });
            }

            // Kiểm tra câu hỏi có đang được sử dụng trong đề thi không
            if (question.ExamPaperQuestions.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = $"Không thể xóa. Câu hỏi đang được sử dụng trong {question.ExamPaperQuestions.Count} đề thi"
                });
            }

            // Xóa options
            _context.QuestionOptions.RemoveRange(question.QuestionOptions);
            // Xóa câu hỏi
            _context.Questions.Remove(question);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa câu hỏi thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa câu hỏi {QuestionId}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
        }
    }
}

// ============ Request DTOs ============

public class UpdateUserRolesDto
{
    public List<string> Roles { get; set; } = new();
}

public class CreateWordDto
{
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public int? HskLevel { get; set; }
    public int? TopicId { get; set; }
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
}

public class ClassifyWordsRequest
{
    public List<int> WordIds { get; set; } = new();
    public int HskLevel { get; set; } = 1;
}

public class AssignWordsToTopicRequest
{
    public List<int> WordIds { get; set; } = new();
    public int TopicId { get; set; }
}

public class UpdateWordDto
{
    public string? Character { get; set; }
    public string? Pinyin { get; set; }
    public string? Meaning { get; set; }
    public int? HskLevel { get; set; }
    public int? TopicId { get; set; }
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
}

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public List<int>? WordIds { get; set; }
    public int? HskLevel { get; set; }
}

public class CreateQuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionType { get; set; }
    public string? SkillType { get; set; }
    public int? PartNumber { get; set; }
    public int? ExerciseId { get; set; }
    public string? Instruction { get; set; }
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? BlankSentence { get; set; }
    public int? Points { get; set; }
    public int? DifficultyLevel { get; set; }
    public string? Explanation { get; set; }
    public List<CreateQuestionOptionDto>? Options { get; set; }
}

public class CreateQuestionOptionDto
{
    public string OptionLabel { get; set; } = string.Empty;
    public string? OptionText { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
}

