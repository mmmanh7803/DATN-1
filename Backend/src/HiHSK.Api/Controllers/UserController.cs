using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HiHSK.Domain.Entities;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<UserController> _logger;

    public UserController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<UserController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Lấy thông tin profile và thống kê của user hiện tại
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Người dùng chưa đăng nhập" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy người dùng" });
            }

            // Thống kê từ vựng
            var totalWords = await _context.UserWordProgresses
                .Where(p => p.UserId == userId)
                .CountAsync();

            var masteredWords = await _context.UserWordProgresses
                .Where(p => p.UserId == userId && p.Status == "Mastered")
                .CountAsync();

            var learningWords = await _context.UserWordProgresses
                .Where(p => p.UserId == userId && (p.Status == "Learning" || p.Status == "Reviewing"))
                .CountAsync();

            var newWords = await _context.UserWordProgresses
                .Where(p => p.UserId == userId && p.Status == "New")
                .CountAsync();

            // Thống kê thi
            var totalExams = await _context.UserLessonProgresses
                .Where(p => p.UserId == userId && p.ExamPaperId != null)
                .CountAsync();

            var passedExams = await _context.UserLessonProgresses
                .Include(p => p.ExamPaper)
                .Where(p => p.UserId == userId && 
                           p.ExamPaperId != null && 
                           p.Score >= p.ExamPaper!.PassingScore)
                .CountAsync();

            var averageScore = await _context.UserLessonProgresses
                .Where(p => p.UserId == userId && p.ExamPaperId != null)
                .AverageAsync(p => (double?)p.Score) ?? 0;

            // Thống kê topic đã hoàn thành
            var completedTopics = await _context.UserActivityProgresses
                .Where(p => p.UserId == userId && p.TopicId != null && p.IsCompleted)
                .Select(p => p.TopicId)
                .Distinct()
                .CountAsync();

            // Lấy exam gần nhất
            var recentExam = await _context.UserLessonProgresses
                .Include(p => p.ExamPaper)
                .Where(p => p.UserId == userId && p.ExamPaperId != null)
                .OrderByDescending(p => p.CompletedAt)
                .Select(p => new
                {
                    ExamTitle = p.ExamPaper!.Title,
                    p.Score,
                    p.CompletedAt
                })
                .FirstOrDefaultAsync();

            var roles = await _userManager.GetRolesAsync(user);

            var profileData = new
            {
                User = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    Roles = roles.ToList()
                },
                Statistics = new
                {
                    Vocabulary = new
                    {
                        Total = totalWords,
                        Mastered = masteredWords,
                        Learning = learningWords,
                        New = newWords
                    },
                    Exams = new
                    {
                        Total = totalExams,
                        Passed = passedExams,
                        Failed = totalExams - passedExams,
                        AverageScore = Math.Round(averageScore, 1)
                    },
                    Topics = new
                    {
                        Completed = completedTopics
                    },
                    RecentExam = recentExam
                }
            };

            return Ok(new { success = true, data = profileData });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin profile");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy danh sách từ vựng đã học
    /// </summary>
    [HttpGet("learned-words")]
    public async Task<IActionResult> GetLearnedWords(
        [FromQuery] int? hskLevel = null,
        [FromQuery] int? reviewLevel = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Người dùng chưa đăng nhập" });
            }

            var query = _context.UserWordProgresses
                .Include(p => p.Word)
                .Where(p => p.UserId == userId);

            // Filter theo HSK level
            if (hskLevel.HasValue)
            {
                query = query.Where(p => p.Word.HSKLevel == hskLevel.Value);
            }

            // Filter theo status
            if (reviewLevel.HasValue)
            {
                var statusMap = new Dictionary<int, string>
                {
                    { 0, "New" },
                    { 1, "Learning" },
                    { 2, "Reviewing" },
                    { 3, "Mastered" }
                };
                if (statusMap.ContainsKey(reviewLevel.Value))
                {
                    query = query.Where(p => p.Status == statusMap[reviewLevel.Value]);
                }
            }

            var totalCount = await query.CountAsync();

            var words = await query
                .OrderByDescending(p => p.LastReviewedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    WordId = p.WordId,
                    Character = p.Word.Character,
                    Pinyin = p.Word.Pinyin,
                    Meaning = p.Word.Meaning,
                    HSKLevel = p.Word.HSKLevel,
                    Status = p.Status,
                    ReviewCount = p.ReviewCount,
                    CorrectCount = p.CorrectCount,
                    WrongCount = p.WrongCount,
                    LastReviewedAt = p.LastReviewedAt,
                    NextReviewDate = p.NextReviewDate,
                    IsMastered = p.Status == "Mastered"
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = new
                {
                    Words = words,
                    Pagination = new
                    {
                        Page = page,
                        PageSize = pageSize,
                        TotalCount = totalCount,
                        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                    }
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách từ vựng đã học");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }
}

