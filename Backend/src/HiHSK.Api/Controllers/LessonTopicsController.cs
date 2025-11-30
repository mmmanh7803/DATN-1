using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/lessontopics")]
[AllowAnonymous]
public class LessonTopicsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LessonTopicsController> _logger;
    private readonly IUserWordProgressRepository _userProgressRepository;

    public LessonTopicsController(
        ApplicationDbContext context, 
        ILogger<LessonTopicsController> logger,
        IUserWordProgressRepository userProgressRepository)
    {
        _context = context;
        _logger = logger;
        _userProgressRepository = userProgressRepository;
    }

    [HttpGet("hsk/{hskLevel}")]
    public async Task<ActionResult<List<LessonTopicListDto>>> GetTopicsByHSKLevel(int hskLevel)
    {
        var topics = await _context.LessonTopics
            .Where(t => t.HSKLevel == hskLevel && t.IsActive)
            .OrderBy(t => t.TopicIndex)
            .ToListAsync();

        var topicIds = topics.Select(t => t.Id).ToList();
        
        var exerciseCounts = await _context.LessonExercises
            .Where(e => topicIds.Contains(e.TopicId) && e.IsActive)
            .GroupBy(e => e.TopicId)
            .Select(g => new { TopicId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TopicId, x => x.Count);

        var wordCounts = await _context.Words
            .Where(w => w.TopicId != null && topicIds.Contains(w.TopicId.Value))
            .GroupBy(w => w.TopicId)
            .Select(g => new { TopicId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TopicId!.Value, x => x.Count);

        var result = topics.Select(t => new LessonTopicListDto
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
            TotalExercises = exerciseCounts.GetValueOrDefault(t.Id, 0),
            TotalWords = wordCounts.GetValueOrDefault(t.Id, 0),
            ProgressPercentage = 0
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LessonTopicDto>> GetTopicById(int id)
    {
        try
        {
            _logger.LogInformation($"Đang lấy chi tiết chủ đề với ID: {id}");

            var topic = await _context.LessonTopics
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);

            if (topic == null)
            {
                _logger.LogWarning($"Không tìm thấy chủ đề với ID: {id}");
                return NotFound(new { message = "Chủ đề không tồn tại" });
            }

            _logger.LogInformation($"Đã tìm thấy chủ đề: {topic.Title}");

            var exerciseCount = await _context.LessonExercises
                .CountAsync(e => e.TopicId == id && e.IsActive);

            var wordCount = await _context.Words
                .CountAsync(w => w.TopicId == id);

            _logger.LogInformation($"Chủ đề có {wordCount} từ vựng và {exerciseCount} bài tập");

            var wordsQuery = _context.Words
                .Where(w => w.TopicId == id)
                .OrderBy(w => w.Id);

            var wordIds = await wordsQuery.Select(w => w.Id).ToListAsync();

            var wordExamplesDict = await _context.WordExamples
                .Where(e => wordIds.Contains(e.WordId))
                .OrderBy(e => e.SortOrder)
                .GroupBy(e => e.WordId)
                .ToDictionaryAsync(
                    g => g.Key,
                    g => g.Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character,
                        Pinyin = e.Pinyin,
                        Meaning = e.Meaning,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    }).ToList()
                );

            var words = await wordsQuery
                .Select(w => new WordDto
                {
                    Id = w.Id,
                    Character = w.Character,
                    Pinyin = w.Pinyin,
                    Meaning = w.Meaning,
                    AudioUrl = w.AudioUrl,
                    ImageUrl = w.ImageUrl,
                    ExampleSentence = w.ExampleSentence,
                    HSKLevel = w.HSKLevel,
                    StrokeCount = w.StrokeCount,
                    PartOfSpeech = w.PartOfSpeech,
                    PartOfSpeechVi = w.PartOfSpeechVi,
                    PartOfSpeechEn = w.PartOfSpeechEn,
                    GrammarNote = w.GrammarNote,
                    Structure = w.Structure,
                    Examples = wordExamplesDict.GetValueOrDefault(w.Id, new List<WordExampleDto>())
                })
                .ToListAsync();

            _logger.LogInformation($"Đã load {words.Count} từ vựng");

            // Load progress cho words nếu có user đăng nhập
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var wordsWithProgress = new List<WordWithProgressDto>();
            
            foreach (var word in words)
            {
                var wordWithProgress = new WordWithProgressDto
                {
                    Id = word.Id,
                    Character = word.Character,
                    Pinyin = word.Pinyin,
                    Meaning = word.Meaning,
                    AudioUrl = word.AudioUrl,
                    ImageUrl = word.ImageUrl,
                    ExampleSentence = word.ExampleSentence,
                    HSKLevel = word.HSKLevel,
                    StrokeCount = word.StrokeCount,
                    PartOfSpeech = word.PartOfSpeech,
                    PartOfSpeechVi = word.PartOfSpeechVi,
                    PartOfSpeechEn = word.PartOfSpeechEn,
                    GrammarNote = word.GrammarNote,
                    Structure = word.Structure,
                    Examples = word.Examples
                };

                // Load progress nếu có user đăng nhập
                if (!string.IsNullOrEmpty(userId))
                {
                    var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
                    if (progress != null)
                    {
                        wordWithProgress.Progress = new UserWordProgressDto
                        {
                            Id = progress.Id,
                            UserId = progress.UserId,
                            WordId = progress.WordId,
                            Status = progress.Status,
                            NextReviewDate = progress.NextReviewDate,
                            ReviewCount = progress.ReviewCount,
                            CorrectCount = progress.CorrectCount,
                            WrongCount = progress.WrongCount,
                            LastReviewedAt = progress.LastReviewedAt
                        };
                    }
                }
                
                wordsWithProgress.Add(wordWithProgress);
            }

            var topicDto = new LessonTopicDto
            {
                Id = topic.Id,
                CourseId = topic.CourseId,
                HSKLevel = topic.HSKLevel,
                Title = topic.Title,
                Description = topic.Description,
                ImageUrl = topic.ImageUrl,
                TopicIndex = topic.TopicIndex,
                IsLocked = topic.IsLocked,
                PrerequisiteTopicId = topic.PrerequisiteTopicId,
                TotalExercises = exerciseCount,
                TotalWords = wordCount,
                ProgressPercentage = 0,
                Words = wordsWithProgress
            };

            _logger.LogInformation($"Đã tạo DTO thành công cho chủ đề ID: {id}");
            return Ok(topicDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi lấy chi tiết chủ đề ID: {id}");
            return StatusCode(500, new 
            { 
                message = "Lỗi khi lấy chi tiết chủ đề",
                error = ex.Message,
                stackTrace = ex.StackTrace,
                innerException = ex.InnerException?.Message,
                hint = "Vui lòng kiểm tra xem bảng LessonTopics và Words đã được tạo trong database chưa. Chạy migration: dotnet ef database update --startup-project ../HiHSK.Api"
            });
        }
    }

    [HttpGet("{id}/unlock-status")]
    public async Task<ActionResult<object>> GetUnlockStatus(int id)
    {
        var topic = await _context.LessonTopics.FindAsync(id);
        
        if (topic == null)
            return NotFound(new { message = "Chủ đề không tồn tại" });

        return Ok(new { topicId = id, isLocked = topic.IsLocked });
    }
}

