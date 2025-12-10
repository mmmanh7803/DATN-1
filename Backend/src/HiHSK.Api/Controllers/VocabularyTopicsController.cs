using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/vocabularytopics")]
[Authorize]
public class VocabularyTopicsController : ControllerBase
{
    private readonly IVocabularyService _vocabularyService;
    private readonly ISRSService _srsService;
    private readonly ILogger<VocabularyTopicsController> _logger;

    public VocabularyTopicsController(
        IVocabularyService vocabularyService,
        ISRSService srsService,
        ILogger<VocabularyTopicsController> logger)
    {
        _vocabularyService = vocabularyService;
        _srsService = srsService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<VocabularyTopicDto>>> GetAllTopics()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var topics = await _vocabularyService.GetAllTopicsAsync(userId);
        return Ok(topics);
    }

    [HttpGet("{topicId}/image-quiz")]
    public async Task<ActionResult<List<QuestionDto>>> GetImageQuizQuestions(
        int topicId,
        [FromQuery] int? count = null)
    {
        try
        {
            var questions = await _vocabularyService.GenerateImageQuizQuestionsAsync(topicId, count);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo câu hỏi kiểm tra từ vựng bằng hình ảnh");
            return StatusCode(500, new { message = "Lỗi khi tạo câu hỏi", error = ex.Message });
        }
    }

    [HttpGet("{topicId}/fill-blank")]
    public async Task<ActionResult<List<QuestionDto>>> GetFillBlankQuestions(
        int topicId,
        [FromQuery] int? count = null)
    {
        try
        {
            var questions = await _vocabularyService.GenerateFillBlankQuestionsAsync(topicId, count);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo câu hỏi điền từ vào chỗ trống");
            return StatusCode(500, new { message = "Lỗi khi tạo câu hỏi", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VocabularyTopicDetailDto>> GetTopicById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var topic = await _vocabularyService.GetTopicByIdAsync(id, userId);
        
        if (topic == null)
            return NotFound(new { message = "Chủ đề không tồn tại" });

        return Ok(topic);
    }

    [HttpGet("{topicId}/review-words")]
    public async Task<ActionResult<List<FlashcardReviewDto>>> GetReviewWords(
        int topicId,
        [FromQuery] bool onlyDue = true,
        [FromQuery] int? limit = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        var words = await _vocabularyService.GetWordsForReviewAsync(topicId, userId, onlyDue, limit);
        return Ok(words);
    }

    [HttpGet("{topicId}/stats")]
    public async Task<ActionResult<ReviewStatsDto>> GetTopicStats(int topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        var stats = await _vocabularyService.GetTopicStatsAsync(topicId, userId);
        return Ok(stats);
    }

    [HttpGet("overall-stats")]
    public async Task<ActionResult<ReviewStatsDto>> GetOverallStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        var stats = await _vocabularyService.GetOverallStatsAsync(userId);
        return Ok(stats);
    }

    [HttpGet("words/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<WordWithProgressDto>> GetWordById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var word = await _vocabularyService.GetWordByIdAsync(id, userId);
        
        if (word == null)
            return NotFound(new { message = "Từ vựng không tồn tại" });

        return Ok(word);
    }

    [HttpPost("words/get-or-create")]
    [AllowAnonymous]
    public async Task<ActionResult<WordWithProgressDto>> GetOrCreateWordByCharacter([FromBody] GetOrCreateWordRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Character))
        {
            return BadRequest(new { message = "Character không được để trống" });
        }

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var word = await _vocabularyService.GetOrCreateWordByCharacterAsync(request.Character, userId);
            return Ok(word);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy/tạo từ vựng: {Character}", request.Character);
            return StatusCode(500, new { message = "Lỗi khi lấy/tạo từ vựng", error = ex.Message });
        }
    }

    [HttpPost("words/get-or-create-batch")]
    [AllowAnonymous]
    public async Task<ActionResult<Dictionary<string, WordWithProgressDto>>> GetOrCreateWordsBatch([FromBody] GetOrCreateWordsBatchRequest request)
    {
        if (request == null || request.Characters == null || request.Characters.Count == 0)
        {
            return BadRequest(new { message = "Danh sách characters không được để trống" });
        }

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var words = await _vocabularyService.GetOrCreateWordsBatchAsync(request.Characters, userId);
            return Ok(words);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy/tạo nhiều từ vựng");
            return StatusCode(500, new { message = "Lỗi khi lấy/tạo nhiều từ vựng", error = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật trạng thái ôn tập từ vựng (SRS)
    /// </summary>
    [HttpPost("review")]
    public async Task<ActionResult<UserWordProgressDto>> UpdateReviewStatus([FromBody] UpdateReviewStatusRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Người dùng chưa đăng nhập" });

        try
        {
            var progress = await _srsService.UpdateReviewStatusAsync(userId, request.WordId, request.Rating);
            return Ok(progress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật trạng thái ôn tập từ vựng");
            return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái ôn tập", error = ex.Message });
        }
    }
}

public class GetOrCreateWordRequest
{
    public string Character { get; set; } = string.Empty;
}

public class GetOrCreateWordsBatchRequest
{
    public List<string> Characters { get; set; } = new();
}

