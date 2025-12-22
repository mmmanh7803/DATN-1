using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/activities")]
[Authorize]
public class ActivityProgressController : ControllerBase
{
    private readonly IActivityProgressRepository _activityProgressRepository;
    private readonly IVocabularyService _vocabularyService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ActivityProgressController> _logger;

    public ActivityProgressController(
        IActivityProgressRepository activityProgressRepository,
        IVocabularyService vocabularyService,
        ApplicationDbContext context,
        ILogger<ActivityProgressController> logger)
    {
        _activityProgressRepository = activityProgressRepository;
        _vocabularyService = vocabularyService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Đánh dấu một activity đã hoàn thành
    /// </summary>
    [HttpPost("complete")]
    public async Task<ActionResult> CompleteActivity([FromBody] CompleteActivityRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        if (string.IsNullOrWhiteSpace(request.ActivityId))
            return BadRequest(new { message = "ActivityId không được để trống" });

        if (!request.HskLevel.HasValue && !request.TopicId.HasValue)
            return BadRequest(new { message = "Phải cung cấp HskLevel+PartNumber hoặc TopicId" });

        if (request.HskLevel.HasValue && !request.PartNumber.HasValue)
            return BadRequest(new { message = "Khi cung cấp HskLevel thì phải có PartNumber" });

        try
        {
            _logger.LogInformation(
                $"User {userId} completing activity '{request.ActivityId}' for " +
                $"HSK{request.HskLevel}-Part{request.PartNumber} or Topic{request.TopicId}");

            var progress = await _activityProgressRepository.MarkActivityCompletedAsync(
                userId,
                request.HskLevel,
                request.PartNumber,
                request.TopicId,
                request.ActivityId,
                request.Score);

            return Ok(new
            {
                message = "Đánh dấu hoạt động hoàn thành thành công",
                activityId = request.ActivityId,
                isCompleted = progress.IsCompleted,
                completedAt = progress.CompletedAt,
                score = progress.Score
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đánh dấu activity completed");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra xem activity đã hoàn thành chưa
    /// </summary>
    [HttpGet("check-completed")]
    public async Task<ActionResult> CheckActivityCompleted(
        [FromQuery] string activityId,
        [FromQuery] int? hskLevel,
        [FromQuery] int? partNumber,
        [FromQuery] int? topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        if (string.IsNullOrWhiteSpace(activityId))
            return BadRequest(new { message = "ActivityId không được để trống" });

        try
        {
            var isCompleted = await _activityProgressRepository.IsActivityCompletedAsync(
                userId,
                hskLevel,
                partNumber,
                topicId,
                activityId);

            return Ok(new
            {
                activityId,
                isCompleted
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra activity completed");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách activities đã hoàn thành
    /// </summary>
    [HttpGet("completed-list")]
    public async Task<ActionResult> GetCompletedActivities(
        [FromQuery] int? hskLevel,
        [FromQuery] int? partNumber,
        [FromQuery] int? topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            List<HiHSK.Domain.Entities.UserActivityProgress> activities;

            if (hskLevel.HasValue && partNumber.HasValue)
            {
                activities = await _activityProgressRepository.GetUserActivityProgressByPartAsync(
                    userId, hskLevel.Value, partNumber.Value);
            }
            else if (topicId.HasValue)
            {
                activities = await _activityProgressRepository.GetUserActivityProgressByTopicAsync(
                    userId, topicId.Value);
            }
            else
            {
                return BadRequest(new { message = "Phải cung cấp HskLevel+PartNumber hoặc TopicId" });
            }

            var result = activities.Where(a => a.IsCompleted).Select(a => new
            {
                activityId = a.ActivityId,
                isCompleted = a.IsCompleted,
                score = a.Score,
                completedAt = a.CompletedAt
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách activities completed");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra và tự động đánh dấu activity "vocabulary" nếu tất cả từ đã học
    /// Frontend gọi API này sau khi user đánh dấu từ cuối cùng là "đã học"
    /// </summary>
    [HttpPost("check-and-mark-vocabulary")]
    public async Task<ActionResult> CheckAndMarkVocabulary([FromBody] CheckVocabularyRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            bool marked = false;
            List<int> wordIds;

            // Hỗ trợ cả topicId và hskLevel + partNumber
            if (request.TopicId.HasValue)
            {
                // Lấy words từ topic
                var topic = await _context.LessonTopics
                    .Include(t => t.Words)
                    .FirstOrDefaultAsync(t => t.Id == request.TopicId.Value);

                if (topic == null)
                    return NotFound(new { message = "Topic không tồn tại" });

                wordIds = topic.Words.Select(w => w.Id).ToList();

                // Kiểm tra và tự động đánh dấu cho topic
                marked = await _activityProgressRepository.CheckAndMarkVocabularyCompletedByTopicAsync(
                    userId,
                    request.TopicId.Value,
                    wordIds);

                if (marked)
                {
                    _logger.LogInformation(
                        $"User {userId} hoàn thành activity 'vocabulary' cho Topic {request.TopicId}");
                }
            }
            else if (request.HskLevel.HasValue && request.PartNumber.HasValue)
            {
                // Lấy danh sách tất cả từ trong part
                var words = await _vocabularyService.GetWordsByHSKLevelAndPartAsync(
                    request.HskLevel.Value,
                    request.PartNumber.Value,
                    userId);

                wordIds = words.Select(w => w.Id).ToList();

                // Kiểm tra và tự động đánh dấu cho part
                marked = await _activityProgressRepository.CheckAndMarkVocabularyCompletedAsync(
                    userId,
                    request.HskLevel.Value,
                    request.PartNumber.Value,
                    wordIds);

                if (marked)
                {
                    _logger.LogInformation(
                        $"User {userId} hoàn thành activity 'vocabulary' cho HSK{request.HskLevel}-Part{request.PartNumber}");
                }
            }
            else
            {
                return BadRequest(new { message = "Phải cung cấp TopicId hoặc (HSKLevel và PartNumber)" });
            }

            return Ok(new
            {
                marked,
                message = marked
                    ? "Tất cả từ đã học! Activity 'vocabulary' đã được đánh dấu hoàn thành."
                    : "Chưa học hết tất cả từ."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi check vocabulary completed");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra xem user có thể truy cập part này không (prerequisite check)
    /// Part N unlock khi part N-1 đã hoàn thành 100% activities
    /// </summary>
    [HttpGet("can-access-part")]
    public async Task<ActionResult> CanAccessPart(
        [FromQuery] int hskLevel,
        [FromQuery] int partNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            // Part 1 luôn unlock
            if (partNumber == 1)
            {
                return Ok(new
                {
                    canAccess = true,
                    reason = "Part đầu tiên luôn mở khóa"
                });
            }

            // Kiểm tra part trước đó (N-1) đã hoàn thành chưa
            int previousPart = partNumber - 1;
            var completedCount = await _activityProgressRepository.CountCompletedActivitiesAsync(
                userId,
                hskLevel,
                previousPart,
                null);

            const int totalActivities = 14; // Tổng số activities cần hoàn thành
            bool previousPartCompleted = completedCount == totalActivities;

            if (!previousPartCompleted)
            {
                return Ok(new
                {
                    canAccess = false,
                    reason = $"Bạn cần hoàn thành tất cả {totalActivities} hoạt động của Part {previousPart} trước",
                    previousPart,
                    completedActivities = completedCount,
                    totalActivities
                });
            }

            return Ok(new
            {
                canAccess = true,
                reason = $"Part {previousPart} đã hoàn thành"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra quyền truy cập part");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }
    
    /// <summary>
    /// Kiểm tra xem user có thể truy cập topic này không
    /// Topic N unlock khi topic N-1 đã hoàn thành tất cả required activities
    /// </summary>
    [HttpGet("can-access-topic")]
    public async Task<ActionResult> CanAccessTopic([FromQuery] int topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            var (canAccess, reason) = await _activityProgressRepository.CanAccessTopicAsync(userId, topicId);
            var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
            
            return Ok(new
            {
                topicId,
                canAccess,
                reason,
                requiredActivities,
                totalRequiredActivities = requiredActivities.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi kiểm tra quyền truy cập topic {topicId}");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }
    
    /// <summary>
    /// Kiểm tra xem topic đã hoàn thành chưa
    /// </summary>
    [HttpGet("topic-completed")]
    public async Task<ActionResult> IsTopicCompleted([FromQuery] int topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            var isCompleted = await _activityProgressRepository.IsTopicCompletedAsync(userId, topicId);
            var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
            
            // Lấy danh sách activities đã hoàn thành
            var completedActivities = await _context.UserActivityProgresses
                .Where(p => p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.IsCompleted
                    && requiredActivities.Contains(p.ActivityId))
                .Select(p => p.ActivityId)
                .ToListAsync();
            
            return Ok(new
            {
                topicId,
                isCompleted,
                completedActivities,
                requiredActivities,
                completedCount = completedActivities.Count,
                totalRequired = requiredActivities.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi kiểm tra topic {topicId} completed");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }
    
    /// <summary>
    /// Kiểm tra và mở khóa topic tiếp theo nếu topic hiện tại đã hoàn thành
    /// </summary>
    [HttpPost("check-and-unlock-next-topic")]
    public async Task<ActionResult> CheckAndUnlockNextTopic([FromBody] CheckUnlockTopicRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            var (unlocked, nextTopicId) = await _activityProgressRepository.CheckAndUnlockNextTopicAsync(
                userId, request.CompletedTopicId);
            
            if (unlocked && nextTopicId.HasValue)
            {
                var nextTopic = await _context.LessonTopics.FindAsync(nextTopicId.Value);
                
                _logger.LogInformation(
                    $"User {userId} đã mở khóa topic {nextTopicId} sau khi hoàn thành topic {request.CompletedTopicId}");
                
                return Ok(new
                {
                    unlocked = true,
                    message = $"Chúc mừng! Bạn đã mở khóa chủ đề \"{nextTopic?.Title}\"",
                    nextTopicId = nextTopicId.Value,
                    nextTopicTitle = nextTopic?.Title
                });
            }
            
            // Kiểm tra xem topic hiện tại đã hoàn thành chưa
            var isCurrentCompleted = await _activityProgressRepository.IsTopicCompletedAsync(userId, request.CompletedTopicId);
            
            if (!isCurrentCompleted)
            {
                var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
                var completedActivities = await _context.UserActivityProgresses
                    .Where(p => p.UserId == userId 
                        && p.TopicId == request.CompletedTopicId 
                        && p.IsCompleted
                        && requiredActivities.Contains(p.ActivityId))
                    .Select(p => p.ActivityId)
                    .ToListAsync();
                
                return Ok(new
                {
                    unlocked = false,
                    message = $"Chưa hoàn thành chủ đề. Còn {requiredActivities.Count - completedActivities.Count} hoạt động cần hoàn thành.",
                    completedActivities,
                    requiredActivities,
                    completedCount = completedActivities.Count,
                    totalRequired = requiredActivities.Count
                });
            }
            
            // Topic đã hoàn thành nhưng không có topic tiếp theo
            return Ok(new
            {
                unlocked = false,
                message = "Chúc mừng! Bạn đã hoàn thành tất cả chủ đề của cấp độ HSK này.",
                isLevelCompleted = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi kiểm tra và mở khóa topic tiếp theo");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }
    
    /// <summary>
    /// Lấy danh sách required activities
    /// </summary>
    [HttpGet("required-activities")]
    [AllowAnonymous]
    public ActionResult GetRequiredActivities()
    {
        var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
        return Ok(new
        {
            requiredActivities,
            count = requiredActivities.Count,
            description = "Danh sách các hoạt động bắt buộc phải hoàn thành để mở khóa chủ đề tiếp theo"
        });
    }
    
    /// <summary>
    /// Lấy progress của tất cả activities trong topic
    /// </summary>
    [HttpGet("topic-progress")]
    public async Task<ActionResult> GetTopicActivityProgress([FromQuery] int topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            // Lấy progress của user cho topic này
            var userProgresses = await _context.UserActivityProgresses
                .Where(p => p.UserId == userId && p.TopicId == topicId)
                .ToListAsync();

            var completedActivityIds = userProgresses
                .Where(p => p.IsCompleted)
                .Select(p => p.ActivityId)
                .Distinct()
                .ToList();

            // Lấy tất cả activity IDs đã có trong hệ thống (từ UserActivityProgresses và required activities)
            var allActivityIds = userProgresses
                .Select(p => p.ActivityId)
                .Distinct()
                .ToList();
            
            var requiredActivities = _activityProgressRepository.GetRequiredActivityIds();
            foreach (var reqActivity in requiredActivities)
            {
                if (!allActivityIds.Contains(reqActivity))
                {
                    allActivityIds.Add(reqActivity);
                }
            }

            // Tính toán progress
            var totalActivities = allActivityIds.Count;
            var completedActivities = completedActivityIds.Count;
            var progressPercentage = totalActivities > 0 
                ? Math.Round((double)completedActivities / totalActivities * 100, 1) 
                : 0;

            return Ok(new
            {
                topicId,
                totalActivities,
                completedActivities,
                progressPercentage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi lấy progress của topic {topicId}");
            return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
        }
    }
}

public class CompleteActivityRequest
{
    public int? HskLevel { get; set; }
    public int? PartNumber { get; set; }
    public int? TopicId { get; set; }
    public string ActivityId { get; set; } = string.Empty;
    public int? Score { get; set; }
}

public class CheckVocabularyRequest
{
    public int? HskLevel { get; set; }
    public int? PartNumber { get; set; }
    public int? TopicId { get; set; }
}

public class CheckUnlockTopicRequest
{
    public int CompletedTopicId { get; set; }
}

