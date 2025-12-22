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
    private readonly IActivityProgressRepository _activityProgressRepository;

    public LessonTopicsController(
        ApplicationDbContext context, 
        ILogger<LessonTopicsController> logger,
        IUserWordProgressRepository userProgressRepository,
        IActivityProgressRepository activityProgressRepository)
    {
        _context = context;
        _logger = logger;
        _userProgressRepository = userProgressRepository;
        _activityProgressRepository = activityProgressRepository;
    }

    [HttpGet("hsk/{hskLevel}")]
    public async Task<ActionResult<List<LessonTopicListDto>>> GetTopicsByHSKLevel(int hskLevel)
    {
        try
        {
            _logger.LogInformation($"Đang lấy danh sách chủ đề cho HSK level: {hskLevel}");

            var topics = await _context.LessonTopics
                .Where(t => t.HSKLevel == hskLevel && t.IsActive)
                .OrderBy(t => t.TopicIndex)
                .ToListAsync();

            _logger.LogInformation($"Tìm thấy {topics.Count} chủ đề cho HSK level {hskLevel}");

            var topicIds = topics.Select(t => t.Id).ToList();
            
            // Tính số lượng activities (thay vì exercises từ bảng LessonExercises không dùng)
            // Sử dụng số lượng required activities làm tổng số activities cho mỗi topic
            var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
            var totalActivitiesCount = requiredActivities.Count;
            
            // Tất cả topics đều có cùng số lượng activities
            var exerciseCounts = topicIds.ToDictionary(id => id, id => totalActivitiesCount);

            // Tính số lượng words - xử lý trường hợp bảng chưa tồn tại
            Dictionary<int, int> wordCounts = new Dictionary<int, int>();
            try
            {
                wordCounts = await _context.Words
                    .Where(w => w.TopicId != null && topicIds.Contains(w.TopicId.Value))
                    .GroupBy(w => w.TopicId)
                    .Select(g => new { TopicId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.TopicId!.Value, x => x.Count);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể query bảng Words. Có thể bảng chưa được tạo. Trả về 0 words cho tất cả topics.");
                // Nếu bảng không tồn tại, set tất cả về 0
                wordCounts = new Dictionary<int, int>();
            }

            // Lấy userId để kiểm tra trạng thái unlock cho từng user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Tính toán trạng thái unlock cho từng topic dựa trên user
            var topicUnlockStatus = new Dictionary<int, bool>();
            var topicProgressPercentage = new Dictionary<int, double>();
            
            foreach (var topic in topics)
            {
                try
                {
                    // Topic đầu tiên luôn mở khóa
                    if (topic.TopicIndex == 1 || topic.PrerequisiteTopicId == null)
                    {
                        topicUnlockStatus[topic.Id] = false; // isLocked = false -> mở khóa
                    }
                    else if (!string.IsNullOrEmpty(userId))
                    {
                        // Kiểm tra prerequisite topic đã hoàn thành chưa
                        var (canAccess, _) = await _activityProgressRepository.CanAccessTopicAsync(userId, topic.Id);
                        topicUnlockStatus[topic.Id] = !canAccess; // isLocked = !canAccess
                    }
                    else
                    {
                        // Không có user -> sử dụng trạng thái global
                        topicUnlockStatus[topic.Id] = topic.IsLocked;
                    }
                    
                    // Tính progress percentage cho topic
                    if (!string.IsNullOrEmpty(userId))
                    {
                        // Sử dụng lại biến requiredActivities đã khai báo ở scope ngoài
                        var completedActivities = await _context.UserActivityProgresses
                            .CountAsync(p => p.UserId == userId 
                                && p.TopicId == topic.Id 
                                && p.IsCompleted
                                && requiredActivities.Contains(p.ActivityId));
                        
                        topicProgressPercentage[topic.Id] = requiredActivities.Count > 0 
                            ? Math.Round((double)completedActivities / requiredActivities.Count * 100, 1)
                            : 0;
                    }
                    else
                    {
                        topicProgressPercentage[topic.Id] = 0;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Lỗi khi xử lý topic {topic.Id} ({topic.Title})");
                    // Nếu có lỗi với một topic, set giá trị mặc định
                    topicUnlockStatus[topic.Id] = topic.IsLocked;
                    topicProgressPercentage[topic.Id] = 0;
                }
            }

            var result = topics.Select(t => new LessonTopicListDto
            {
                Id = t.Id,
                CourseId = t.CourseId,
                HSKLevel = t.HSKLevel,
                Title = t.Title,
                Description = t.Description,
                ImageUrl = t.ImageUrl,
                TopicIndex = t.TopicIndex,
                IsLocked = topicUnlockStatus.GetValueOrDefault(t.Id, t.IsLocked),
                PrerequisiteTopicId = t.PrerequisiteTopicId,
                TotalExercises = exerciseCounts.GetValueOrDefault(t.Id, 0),
                TotalWords = wordCounts.GetValueOrDefault(t.Id, 0),
                ProgressPercentage = topicProgressPercentage.GetValueOrDefault(t.Id, 0)
            }).ToList();

            _logger.LogInformation($"Đã tạo thành công {result.Count} DTO cho HSK level {hskLevel}");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi lấy danh sách chủ đề cho HSK level {hskLevel}");
            return StatusCode(500, new 
            { 
                message = "Lỗi khi lấy danh sách chủ đề",
                error = ex.Message,
                innerException = ex.InnerException?.Message,
                stackTrace = ex.StackTrace,
                hint = "Vui lòng kiểm tra xem bảng LessonTopics, LessonExercises, Words, và UserActivityProgresses đã được tạo trong database chưa. Chạy migration: dotnet ef database update --startup-project ../HiHSK.Api"
            });
        }
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

            // Sử dụng số lượng required activities thay vì đếm từ bảng LessonExercises
            var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
            var exerciseCount = requiredActivities.Count;

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

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        // Topic đầu tiên luôn mở khóa
        if (topic.TopicIndex == 1 || topic.PrerequisiteTopicId == null)
        {
            return Ok(new 
            { 
                topicId = id, 
                isLocked = false,
                reason = "Chủ đề đầu tiên luôn mở khóa"
            });
        }
        
        // Nếu có user đăng nhập, kiểm tra trạng thái dựa trên user
        if (!string.IsNullOrEmpty(userId))
        {
            var (canAccess, reason) = await _activityProgressRepository.CanAccessTopicAsync(userId, id);
            var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
            
            // Lấy progress của prerequisite topic
            int? prerequisiteTopicId = topic.PrerequisiteTopicId;
            int completedCount = 0;
            
            if (prerequisiteTopicId.HasValue)
            {
                completedCount = await _context.UserActivityProgresses
                    .CountAsync(p => p.UserId == userId 
                        && p.TopicId == prerequisiteTopicId.Value 
                        && p.IsCompleted
                        && requiredActivities.Contains(p.ActivityId));
            }
            
            return Ok(new 
            { 
                topicId = id, 
                isLocked = !canAccess,
                canAccess,
                reason,
                prerequisiteTopicId,
                prerequisiteProgress = new
                {
                    completedCount,
                    totalRequired = requiredActivities.Count,
                    percentage = requiredActivities.Count > 0 
                        ? Math.Round((double)completedCount / requiredActivities.Count * 100, 1) 
                        : 0
                }
            });
        }

        // Không có user -> sử dụng trạng thái global
        return Ok(new 
        { 
            topicId = id, 
            isLocked = topic.IsLocked,
            reason = topic.IsLocked ? "Vui lòng đăng nhập để xem trạng thái mở khóa" : "Chủ đề đã mở khóa"
        });
    }
}

