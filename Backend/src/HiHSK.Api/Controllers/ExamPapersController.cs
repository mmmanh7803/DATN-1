using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HiHSK.Infrastructure.Data;
using HiHSK.Domain.Entities;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamPapersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ExamPapersController> _logger;

    public ExamPapersController(
        ApplicationDbContext context,
        ILogger<ExamPapersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách tất cả đề thi
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllExamPapers()
    {
        try
        {
            var exams = await _context.ExamPapers
                .Where(e => e.IsActive)
                .OrderBy(e => e.Level)
                .ThenBy(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.ExamType,
                    e.Level,
                    e.Description,
                    e.DurationMinutes,
                    e.TotalQuestions,
                    e.TotalPoints,
                    e.PassingScore,
                    e.CreatedAt,
                    QuestionCount = e.ExamPaperQuestions.Count
                })
                .ToListAsync();

            return Ok(new { success = true, data = exams });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách đề thi");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy danh sách đề thi theo loại (HSK hoặc THPT)
    /// </summary>
    [HttpGet("by-type/{examType}")]
    public async Task<IActionResult> GetExamPapersByType(string examType)
    {
        try
        {
            var exams = await _context.ExamPapers
                .Where(e => e.IsActive && e.ExamType == examType.ToUpper())
                .OrderBy(e => e.Level)
                .ThenBy(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.ExamType,
                    e.Level,
                    e.Description,
                    e.DurationMinutes,
                    e.TotalQuestions,
                    e.TotalPoints,
                    e.PassingScore,
                    e.CreatedAt,
                    QuestionCount = e.ExamPaperQuestions.Count
                })
                .ToListAsync();

            return Ok(new { success = true, data = exams });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy đề thi theo loại {ExamType}", examType);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy danh sách đề thi HSK theo cấp độ (1-6)
    /// </summary>
    [HttpGet("hsk/level/{level}")]
    public async Task<IActionResult> GetHSKExamsByLevel(int level)
    {
        try
        {
            if (level < 1 || level > 6)
            {
                return BadRequest(new { success = false, message = "Cấp độ HSK phải từ 1 đến 6" });
            }

            var exams = await _context.ExamPapers
                .Where(e => e.IsActive && e.ExamType == "HSK" && e.Level == level)
                .OrderBy(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.ExamType,
                    e.Level,
                    e.Description,
                    e.DurationMinutes,
                    e.TotalQuestions,
                    e.TotalPoints,
                    e.PassingScore,
                    e.CreatedAt,
                    QuestionCount = e.ExamPaperQuestions.Count
                })
                .ToListAsync();

            return Ok(new { success = true, data = exams });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy đề thi HSK cấp {Level}", level);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy chi tiết một đề thi (bao gồm câu hỏi)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetExamPaperById(int id)
    {
        try
        {
            var exam = await _context.ExamPapers
                .Include(e => e.ExamPaperQuestions)
                    .ThenInclude(epq => epq.Question)
                        .ThenInclude(q => q.QuestionOptions)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            var examData = new
            {
                exam.Id,
                exam.Title,
                exam.ExamType,
                exam.Level,
                exam.Description,
                exam.DurationMinutes,
                exam.TotalQuestions,
                exam.TotalPoints,
                exam.PassingScore,
                exam.CreatedAt,
                Questions = exam.ExamPaperQuestions
                    .OrderBy(epq => epq.QuestionOrder)
                    .Select(epq => new
                    {
                        QuestionOrder = epq.QuestionOrder,
                        Id = epq.Question.Id,
                        QuestionText = epq.Question.QuestionText,
                        QuestionType = epq.Question.QuestionType,
                        SkillType = epq.Question.SkillType,
                        PartNumber = epq.Question.PartNumber,
                        Instruction = epq.Question.Instruction,
                        AudioUrl = epq.Question.AudioUrl,
                        AudioStartTime = epq.Question.AudioStartTime,
                        AudioEndTime = epq.Question.AudioEndTime,
                        ImageUrl = epq.Question.ImageUrl,
                        BlankSentence = epq.Question.BlankSentence,
                        Points = epq.Question.Points,
                        DifficultyLevel = epq.Question.DifficultyLevel,
                        Explanation = epq.Question.Explanation,
                        Options = epq.Question.QuestionOptions
                            .OrderBy(o => o.OptionLabel)
                            .Select(o => new
                            {
                                o.Id,
                                o.OptionText,
                                o.OptionLabel,
                                o.ImageUrl,
                                o.IsCorrect,
                                o.Explanation
                            })
                    })
            };

            return Ok(new { success = true, data = examData });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết đề thi {Id}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy chi tiết đề thi để làm bài (không có đáp án)
    /// </summary>
    [HttpGet("{id}/take")]
    [Authorize]
    public async Task<IActionResult> GetExamPaperForTaking(int id)
    {
        try
        {
            var exam = await _context.ExamPapers
                .Include(e => e.ExamPaperQuestions)
                    .ThenInclude(epq => epq.Question)
                        .ThenInclude(q => q.QuestionOptions)
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            var examData = new
            {
                exam.Id,
                exam.Title,
                exam.ExamType,
                exam.Level,
                exam.Description,
                exam.DurationMinutes,
                exam.TotalQuestions,
                exam.TotalPoints,
                exam.PassingScore,
                Questions = exam.ExamPaperQuestions
                    .OrderBy(epq => epq.QuestionOrder)
                    .Select(epq => new
                    {
                        QuestionOrder = epq.QuestionOrder,
                        Id = epq.Question.Id,
                        QuestionText = epq.Question.QuestionText,
                        QuestionType = epq.Question.QuestionType,
                        SkillType = epq.Question.SkillType,
                        PartNumber = epq.Question.PartNumber,
                        Instruction = epq.Question.Instruction,
                        AudioUrl = epq.Question.AudioUrl,
                        ImageUrl = epq.Question.ImageUrl,
                        BlankSentence = epq.Question.BlankSentence,
                        Points = epq.Question.Points,
                        DifficultyLevel = epq.Question.DifficultyLevel,
                        Options = epq.Question.QuestionOptions
                            .OrderBy(o => o.OptionLabel)
                            .Select(o => new
                            {
                                o.Id,
                                o.OptionText,
                                o.OptionLabel,
                                o.ImageUrl
                                // Không trả về IsCorrect và Explanation
                            })
                    })
            };

            return Ok(new { success = true, data = examData });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy đề thi {Id} để làm bài", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Tạo đề thi mới (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateExamPaper([FromBody] CreateExamPaperDto dto)
    {
        try
        {
            var exam = new ExamPaper
            {
                Title = dto.Title,
                ExamType = dto.ExamType.ToUpper(),
                Level = dto.Level,
                Description = dto.Description,
                DurationMinutes = dto.DurationMinutes,
                TotalQuestions = dto.TotalQuestions,
                TotalPoints = dto.TotalPoints,
                PassingScore = dto.PassingScore,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ExamPapers.Add(exam);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Tạo đề thi thành công",
                data = new
                {
                    exam.Id,
                    exam.Title,
                    exam.ExamType,
                    exam.Level
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo đề thi");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Cập nhật thông tin đề thi (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateExamPaper(int id, [FromBody] UpdateExamPaperDto dto)
    {
        try
        {
            var exam = await _context.ExamPapers.FindAsync(id);
            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            if (!string.IsNullOrEmpty(dto.Title)) exam.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Description)) exam.Description = dto.Description;
            if (dto.DurationMinutes.HasValue) exam.DurationMinutes = dto.DurationMinutes.Value;
            if (dto.TotalQuestions.HasValue) exam.TotalQuestions = dto.TotalQuestions.Value;
            if (dto.TotalPoints.HasValue) exam.TotalPoints = dto.TotalPoints.Value;
            if (dto.PassingScore.HasValue) exam.PassingScore = dto.PassingScore.Value;
            if (dto.IsActive.HasValue) exam.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cập nhật đề thi thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật đề thi {Id}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Xóa đề thi (Admin only) - Soft delete
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteExamPaper(int id)
    {
        try
        {
            var exam = await _context.ExamPapers.FindAsync(id);
            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            exam.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Xóa đề thi thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa đề thi {Id}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Thêm câu hỏi vào đề thi (Admin only)
    /// </summary>
    [HttpPost("{examId}/questions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddQuestionToExam(int examId, [FromBody] AddQuestionToExamDto dto)
    {
        try
        {
            var exam = await _context.ExamPapers.FindAsync(examId);
            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            var question = await _context.Questions.FindAsync(dto.QuestionId);
            if (question == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy câu hỏi" });
            }

            var exists = await _context.ExamPaperQuestions
                .AnyAsync(epq => epq.ExamPaperId == examId && epq.QuestionId == dto.QuestionId);

            if (exists)
            {
                return BadRequest(new { success = false, message = "Câu hỏi đã tồn tại trong đề thi" });
            }

            var examQuestion = new ExamPaperQuestion
            {
                ExamPaperId = examId,
                QuestionId = dto.QuestionId,
                QuestionOrder = dto.QuestionOrder
            };

            _context.ExamPaperQuestions.Add(examQuestion);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Thêm câu hỏi vào đề thi thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi thêm câu hỏi vào đề thi");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Xóa câu hỏi khỏi đề thi (Admin only)
    /// </summary>
    [HttpDelete("{examId}/questions/{questionId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveQuestionFromExam(int examId, int questionId)
    {
        try
        {
            var examQuestion = await _context.ExamPaperQuestions
                .FirstOrDefaultAsync(epq => epq.ExamPaperId == examId && epq.QuestionId == questionId);

            if (examQuestion == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy câu hỏi trong đề thi" });
            }

            _context.ExamPaperQuestions.Remove(examQuestion);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Xóa câu hỏi khỏi đề thi thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa câu hỏi khỏi đề thi");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy danh sách câu hỏi chưa được thêm vào đề thi (để thêm vào đề)
    /// </summary>
    [HttpGet("{examId}/available-questions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAvailableQuestions(
        int examId,
        [FromQuery] string? skillType = null,
        [FromQuery] int? partNumber = null,
        [FromQuery] string? questionType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            // Lấy danh sách ID câu hỏi đã có trong đề thi
            var existingQuestionIds = await _context.ExamPaperQuestions
                .Where(epq => epq.ExamPaperId == examId)
                .Select(epq => epq.QuestionId)
                .ToListAsync();

            // Query câu hỏi DÀNH CHO ĐỀ THI (có SkillType và không thuộc hoạt động học tập)
            // Câu hỏi đề thi có SkillType (LISTENING/READING), không có ExerciseId
            var query = _context.Questions
                .Include(q => q.QuestionOptions)
                .Where(q => !existingQuestionIds.Contains(q.Id))
                .Where(q => q.SkillType != null && q.ExerciseId == null); // Chỉ lấy câu hỏi đề thi

            // Filter theo skillType (LISTENING, READING)
            if (!string.IsNullOrEmpty(skillType))
            {
                query = query.Where(q => q.SkillType == skillType.ToUpper());
            }

            // Filter theo partNumber
            if (partNumber.HasValue)
            {
                query = query.Where(q => q.PartNumber == partNumber.Value);
            }

            // Filter theo questionType
            if (!string.IsNullOrEmpty(questionType))
            {
                query = query.Where(q => q.QuestionType == questionType.ToUpper());
            }

            // Đếm tổng số câu hỏi
            var totalCount = await query.CountAsync();

            // Phân trang
            var questions = await query
                .OrderBy(q => q.SkillType)
                .ThenBy(q => q.PartNumber)
                .ThenBy(q => q.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    q.QuestionType,
                    q.SkillType,
                    q.PartNumber,
                    q.Points,
                    q.DifficultyLevel,
                    q.AudioUrl,
                    q.ImageUrl,
                    OptionsCount = q.QuestionOptions.Count,
                    CorrectOption = q.QuestionOptions.FirstOrDefault(o => o.IsCorrect) != null 
                        ? q.QuestionOptions.First(o => o.IsCorrect).OptionLabel 
                        : null
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = new
                {
                    Questions = questions,
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
            _logger.LogError(ex, "Lỗi khi lấy danh sách câu hỏi available cho đề thi {ExamId}", examId);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Thêm nhiều câu hỏi vào đề thi cùng lúc
    /// </summary>
    [HttpPost("{examId}/questions/bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddQuestionsToExamBulk(int examId, [FromBody] AddQuestionsBulkDto dto)
    {
        try
        {
            var exam = await _context.ExamPapers.FindAsync(examId);
            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            // Lấy order cao nhất hiện tại
            var maxOrder = await _context.ExamPaperQuestions
                .Where(epq => epq.ExamPaperId == examId)
                .MaxAsync(epq => (int?)epq.QuestionOrder) ?? 0;

            var addedCount = 0;
            foreach (var questionId in dto.QuestionIds)
            {
                // Kiểm tra câu hỏi tồn tại
                var questionExists = await _context.Questions.AnyAsync(q => q.Id == questionId);
                if (!questionExists) continue;

                // Kiểm tra câu hỏi đã có trong đề thi chưa
                var alreadyExists = await _context.ExamPaperQuestions
                    .AnyAsync(epq => epq.ExamPaperId == examId && epq.QuestionId == questionId);
                if (alreadyExists) continue;

                // Thêm câu hỏi vào đề thi
                maxOrder++;
                _context.ExamPaperQuestions.Add(new ExamPaperQuestion
                {
                    ExamPaperId = examId,
                    QuestionId = questionId,
                    QuestionOrder = maxOrder
                });
                addedCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã thêm {addedCount} câu hỏi vào đề thi",
                addedCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi thêm nhiều câu hỏi vào đề thi {ExamId}", examId);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Nộp bài thi và tính điểm
    /// </summary>
    [HttpPost("{id}/submit")]
    [Authorize]
    public async Task<IActionResult> SubmitExam(int id, [FromBody] SubmitExamDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Người dùng chưa đăng nhập" });
            }

            // Lấy đề thi với câu hỏi và đáp án
            var exam = await _context.ExamPapers
                .Include(e => e.ExamPaperQuestions)
                    .ThenInclude(epq => epq.Question)
                        .ThenInclude(q => q.QuestionOptions)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            // Tính điểm
            var questions = exam.ExamPaperQuestions
                .OrderBy(epq => epq.QuestionOrder)
                .Select(epq => epq.Question)
                .ToList();

            int correctAnswers = 0;
            int wrongAnswers = 0;
            int listeningCorrect = 0;
            int listeningTotal = 0;
            int readingCorrect = 0;
            int readingTotal = 0;
            int earnedPoints = 0;

            var answerDetails = new List<AnswerDetailDto>();
            var userAnswerEntities = new List<UserAnswer>();

            foreach (var question in questions)
            {
                var userAnswer = dto.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
                var correctOption = question.QuestionOptions.FirstOrDefault(o => o.IsCorrect);
                
                bool isCorrect = false;
                string selectedOptionLabel = userAnswer?.SelectedOption ?? "";
                
                // Kiểm tra đáp án
                if (userAnswer != null && correctOption != null)
                {
                    // So sánh theo OptionLabel
                    var selectedOpt = question.QuestionOptions
                        .FirstOrDefault(o => o.OptionLabel == userAnswer.SelectedOption);
                    
                    isCorrect = selectedOpt?.IsCorrect ?? false;
                    
                    if (isCorrect)
                    {
                        correctAnswers++;
                        earnedPoints += question.Points;
                    }
                    else
                    {
                        wrongAnswers++;
                    }
                }
                else if (userAnswer != null)
                {
                    wrongAnswers++;
                }

                // Thống kê theo skill type
                if (question.SkillType?.ToUpper() == "LISTENING")
                {
                    listeningTotal++;
                    if (isCorrect) listeningCorrect++;
                }
                else if (question.SkillType?.ToUpper() == "READING")
                {
                    readingTotal++;
                    if (isCorrect) readingCorrect++;
                }

                // Chi tiết đáp án
                var examPaperQuestion = exam.ExamPaperQuestions
                    .FirstOrDefault(epq => epq.QuestionId == question.Id);

                answerDetails.Add(new AnswerDetailDto
                {
                    QuestionId = question.Id,
                    QuestionOrder = examPaperQuestion?.QuestionOrder ?? 0,
                    QuestionText = question.QuestionText,
                    QuestionType = question.QuestionType,
                    SkillType = question.SkillType,
                    PartNumber = question.PartNumber ?? 0,
                    ImageUrl = question.ImageUrl,
                    AudioUrl = question.AudioUrl,
                    SelectedOption = selectedOptionLabel,
                    CorrectOption = correctOption?.OptionLabel ?? "",
                    IsCorrect = isCorrect,
                    Explanation = question.Explanation,
                    Options = question.QuestionOptions
                        .OrderBy(o => o.OptionLabel)
                        .Select(o => new OptionDetailDto
                        {
                            Id = o.Id,
                            Label = o.OptionLabel,
                            Text = o.OptionText,
                            ImageUrl = o.ImageUrl,
                            IsCorrect = o.IsCorrect
                        }).ToList()
                });
            }

            int unanswered = questions.Count - dto.Answers.Count;
            int scorePercentage = questions.Count > 0 
                ? (int)Math.Round((double)correctAnswers / questions.Count * 100) 
                : 0;
            int listeningScore = listeningTotal > 0 
                ? (int)Math.Round((double)listeningCorrect / listeningTotal * 100) 
                : 0;
            int readingScore = readingTotal > 0 
                ? (int)Math.Round((double)readingCorrect / readingTotal * 100) 
                : 0;
            bool isPassed = scorePercentage >= exam.PassingScore;

            // Lưu kết quả vào database
            var progress = new UserLessonProgress
            {
                UserId = userId,
                ExamPaperId = id,
                Score = scorePercentage,
                TotalQuestions = questions.Count,
                TotalPoints = exam.TotalPoints,
                CorrectAnswers = correctAnswers,
                WrongAnswers = wrongAnswers,
                TimeSpentSeconds = dto.TimeSpentSeconds,
                CompletedAt = DateTime.UtcNow
            };

            _context.UserLessonProgresses.Add(progress);
            await _context.SaveChangesAsync();

            // Lưu chi tiết từng câu trả lời
            foreach (var answer in dto.Answers)
            {
                var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null) continue;

                var selectedOption = question.QuestionOptions
                    .FirstOrDefault(o => o.OptionLabel == answer.SelectedOption);
                var correctOption = question.QuestionOptions.FirstOrDefault(o => o.IsCorrect);

                var userAnswerEntity = new UserAnswer
                {
                    UserProgressId = progress.Id,
                    QuestionId = answer.QuestionId,
                    SelectedOptionId = selectedOption?.Id,
                    UserAnswerText = answer.SelectedOption,
                    IsCorrect = selectedOption?.IsCorrect ?? false,
                    PointsEarned = (selectedOption?.IsCorrect ?? false) ? question.Points : 0
                };

                _context.UserAnswers.Add(userAnswerEntity);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Format time spent
            var minutes = dto.TimeSpentSeconds / 60;
            var seconds = dto.TimeSpentSeconds % 60;
            var timeSpent = $"{minutes:D2}:{seconds:D2}";

            var result = new ExamResultDto
            {
                ProgressId = progress.Id,
                ExamId = id,
                ExamTitle = exam.Title,
                TotalQuestions = questions.Count,
                CorrectAnswers = correctAnswers,
                WrongAnswers = wrongAnswers,
                Unanswered = unanswered,
                Score = scorePercentage,
                TotalPoints = exam.TotalPoints,
                EarnedPoints = earnedPoints,
                PassingScore = exam.PassingScore,
                IsPassed = isPassed,
                TimeSpent = timeSpent,
                TimeSpentSeconds = dto.TimeSpentSeconds,
                ListeningCorrect = listeningCorrect,
                ListeningTotal = listeningTotal,
                ListeningScore = listeningScore,
                ReadingCorrect = readingCorrect,
                ReadingTotal = readingTotal,
                ReadingScore = readingScore,
                CompletedAt = progress.CompletedAt,
                Details = answerDetails
            };

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Lỗi khi nộp bài thi {Id}", id);
            return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lấy kết quả thi theo progressId
    /// </summary>
    [HttpGet("result/{progressId}")]
    [Authorize]
    public async Task<IActionResult> GetExamResult(int progressId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Người dùng chưa đăng nhập" });
            }

            var progress = await _context.UserLessonProgresses
                .Include(p => p.ExamPaper)
                .Include(p => p.UserAnswers)
                    .ThenInclude(a => a.Question)
                        .ThenInclude(q => q.QuestionOptions)
                .FirstOrDefaultAsync(p => p.Id == progressId && p.UserId == userId);

            if (progress == null || progress.ExamPaper == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy kết quả thi" });
            }

            // Lấy thông tin exam với questions
            var exam = await _context.ExamPapers
                .Include(e => e.ExamPaperQuestions)
                    .ThenInclude(epq => epq.Question)
                        .ThenInclude(q => q.QuestionOptions)
                .FirstOrDefaultAsync(e => e.Id == progress.ExamPaperId);

            if (exam == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đề thi" });
            }

            // Tính toán thống kê
            int listeningCorrect = 0, listeningTotal = 0;
            int readingCorrect = 0, readingTotal = 0;
            var answerDetails = new List<AnswerDetailDto>();

            foreach (var epq in exam.ExamPaperQuestions.OrderBy(e => e.QuestionOrder))
            {
                var question = epq.Question;
                var userAnswer = progress.UserAnswers.FirstOrDefault(a => a.QuestionId == question.Id);
                var correctOption = question.QuestionOptions.FirstOrDefault(o => o.IsCorrect);

                // Thống kê theo skill type
                if (question.SkillType?.ToUpper() == "LISTENING")
                {
                    listeningTotal++;
                    if (userAnswer?.IsCorrect ?? false) listeningCorrect++;
                }
                else if (question.SkillType?.ToUpper() == "READING")
                {
                    readingTotal++;
                    if (userAnswer?.IsCorrect ?? false) readingCorrect++;
                }

                answerDetails.Add(new AnswerDetailDto
                {
                    QuestionId = question.Id,
                    QuestionOrder = epq.QuestionOrder,
                    QuestionText = question.QuestionText,
                    QuestionType = question.QuestionType,
                    SkillType = question.SkillType,
                    PartNumber = question.PartNumber ?? 0,
                    ImageUrl = question.ImageUrl,
                    AudioUrl = question.AudioUrl,
                    SelectedOption = userAnswer?.UserAnswerText ?? "",
                    CorrectOption = correctOption?.OptionLabel ?? "",
                    IsCorrect = userAnswer?.IsCorrect ?? false,
                    Explanation = question.Explanation,
                    Options = question.QuestionOptions
                        .OrderBy(o => o.OptionLabel)
                        .Select(o => new OptionDetailDto
                        {
                            Id = o.Id,
                            Label = o.OptionLabel,
                            Text = o.OptionText,
                            ImageUrl = o.ImageUrl,
                            IsCorrect = o.IsCorrect
                        }).ToList()
                });
            }

            int listeningScore = listeningTotal > 0 
                ? (int)Math.Round((double)listeningCorrect / listeningTotal * 100) 
                : 0;
            int readingScore = readingTotal > 0 
                ? (int)Math.Round((double)readingCorrect / readingTotal * 100) 
                : 0;

            var timeSpentSeconds = progress.TimeSpentSeconds ?? 0;
            var minutes = timeSpentSeconds / 60;
            var seconds = timeSpentSeconds % 60;

            var result = new ExamResultDto
            {
                ProgressId = progress.Id,
                ExamId = exam.Id,
                ExamTitle = exam.Title,
                TotalQuestions = progress.TotalQuestions,
                CorrectAnswers = progress.CorrectAnswers,
                WrongAnswers = progress.WrongAnswers,
                Unanswered = progress.TotalQuestions - progress.CorrectAnswers - progress.WrongAnswers,
                Score = progress.Score,
                TotalPoints = progress.TotalPoints,
                EarnedPoints = progress.UserAnswers.Sum(a => a.PointsEarned),
                PassingScore = exam.PassingScore,
                IsPassed = progress.Score >= exam.PassingScore,
                TimeSpent = $"{minutes:D2}:{seconds:D2}",
                TimeSpentSeconds = timeSpentSeconds,
                ListeningCorrect = listeningCorrect,
                ListeningTotal = listeningTotal,
                ListeningScore = listeningScore,
                ReadingCorrect = readingCorrect,
                ReadingTotal = readingTotal,
                ReadingScore = readingScore,
                CompletedAt = progress.CompletedAt,
                Details = answerDetails
            };

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy kết quả thi {ProgressId}", progressId);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy kết quả thi mới nhất theo examId
    /// </summary>
    [HttpGet("{id}/latest-result")]
    [Authorize]
    public async Task<IActionResult> GetLatestExamResult(int id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Người dùng chưa đăng nhập" });
            }

            var latestProgress = await _context.UserLessonProgresses
                .Where(p => p.ExamPaperId == id && p.UserId == userId)
                .OrderByDescending(p => p.CompletedAt)
                .FirstOrDefaultAsync();

            if (latestProgress == null)
            {
                return NotFound(new { success = false, message = "Chưa có kết quả thi" });
            }

            return await GetExamResult(latestProgress.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy kết quả thi mới nhất cho exam {Id}", id);
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Lấy lịch sử thi của user
    /// </summary>
    [HttpGet("history")]
    [Authorize]
    public async Task<IActionResult> GetExamHistory([FromQuery] int? examId = null, [FromQuery] int? limit = 20)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Người dùng chưa đăng nhập" });
            }

            var query = _context.UserLessonProgresses
                .Include(p => p.ExamPaper)
                .Where(p => p.UserId == userId && p.ExamPaperId != null);

            if (examId.HasValue)
            {
                query = query.Where(p => p.ExamPaperId == examId);
            }

            var history = await query
                .OrderByDescending(p => p.CompletedAt)
                .Take(limit ?? 20)
                .Select(p => new
                {
                    ProgressId = p.Id,
                    ExamId = p.ExamPaperId,
                    ExamTitle = p.ExamPaper!.Title,
                    ExamType = p.ExamPaper.ExamType,
                    Level = p.ExamPaper.Level,
                    p.Score,
                    p.TotalQuestions,
                    p.CorrectAnswers,
                    p.WrongAnswers,
                    IsPassed = p.Score >= p.ExamPaper.PassingScore,
                    PassingScore = p.ExamPaper.PassingScore,
                    p.TimeSpentSeconds,
                    p.CompletedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = history });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy lịch sử thi");
            return StatusCode(500, new { success = false, message = "Lỗi server" });
        }
    }

    /// <summary>
    /// Import đề thi từ JSON (Admin only)
    /// </summary>
    [HttpPost("import")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ImportExamFromJson([FromBody] ImportExamDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Tạo đề thi mới
            var exam = new ExamPaper
            {
                Title = dto.ExamPaper.Title,
                ExamType = dto.ExamPaper.ExamType.ToUpper(),
                Level = dto.ExamPaper.Level,
                Description = dto.ExamPaper.Description,
                DurationMinutes = dto.ExamPaper.DurationMinutes,
                TotalQuestions = dto.ExamPaper.TotalQuestions,
                TotalPoints = dto.ExamPaper.TotalPoints,
                PassingScore = dto.ExamPaper.PassingScore,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ExamPapers.Add(exam);
            await _context.SaveChangesAsync();

            // Thêm câu hỏi
            foreach (var questionDto in dto.Questions)
            {
                var question = new Question
                {
                    QuestionText = questionDto.QuestionText,
                    QuestionType = questionDto.QuestionType,
                    SkillType = questionDto.SkillType,
                    PartNumber = questionDto.PartNumber,
                    Instruction = questionDto.Instruction,
                    AudioUrl = questionDto.AudioUrl,
                    ImageUrl = questionDto.ImageUrl,
                    BlankSentence = questionDto.BlankSentence,
                    Points = questionDto.Points,
                    DifficultyLevel = 1,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Questions.Add(question);
                await _context.SaveChangesAsync();

                // Thêm options
                foreach (var optionDto in questionDto.Options)
                {
                    var option = new QuestionOption
                    {
                        QuestionId = question.Id,
                        OptionLabel = optionDto.OptionLabel,
                        OptionText = optionDto.OptionText ?? "",
                        ImageUrl = optionDto.ImageUrl,
                        IsCorrect = optionDto.IsCorrect
                    };
                    _context.QuestionOptions.Add(option);
                }
                await _context.SaveChangesAsync();

                // Liên kết với đề thi
                var examQuestion = new ExamPaperQuestion
                {
                    ExamPaperId = exam.Id,
                    QuestionId = question.Id,
                    QuestionOrder = questionDto.QuestionOrder
                };
                _context.ExamPaperQuestions.Add(examQuestion);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = $"Import thành công đề thi với {dto.Questions.Count} câu hỏi",
                data = new
                {
                    examId = exam.Id,
                    title = exam.Title,
                    questionCount = dto.Questions.Count
                }
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Lỗi khi import đề thi từ JSON");
            return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
        }
    }
}

// DTOs
public class CreateExamPaperDto
{
    public string Title { get; set; } = string.Empty;
    public string ExamType { get; set; } = "HSK"; // HSK hoặc THPT
    public int? Level { get; set; }
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int PassingScore { get; set; }
}

public class UpdateExamPaperDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public int? TotalQuestions { get; set; }
    public int? TotalPoints { get; set; }
    public int? PassingScore { get; set; }
    public bool? IsActive { get; set; }
}

public class AddQuestionToExamDto
{
    public int QuestionId { get; set; }
    public int QuestionOrder { get; set; }
}

public class AddQuestionsBulkDto
{
    public List<int> QuestionIds { get; set; } = new();
}

// Import DTOs
public class ImportExamDto
{
    public ImportExamPaperDto ExamPaper { get; set; } = null!;
    public List<ImportQuestionDto> Questions { get; set; } = new();
}

public class ImportExamPaperDto
{
    public string Title { get; set; } = string.Empty;
    public string ExamType { get; set; } = "HSK";
    public int? Level { get; set; }
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int PassingScore { get; set; }
}

public class ImportQuestionDto
{
    public int QuestionOrder { get; set; }
    public string SkillType { get; set; } = string.Empty; // LISTENING, READING
    public int PartNumber { get; set; }
    public string QuestionType { get; set; } = string.Empty; // TRUE_FALSE, SELECT_IMAGE, MULTIPLE_CHOICE, FILL_BLANK
    public string QuestionText { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? BlankSentence { get; set; }
    public int Points { get; set; } = 5;
    public List<ImportOptionDto> Options { get; set; } = new();
}

public class ImportOptionDto
{
    public string OptionLabel { get; set; } = string.Empty;
    public string? OptionText { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
}

// Submit Exam DTOs
public class SubmitExamDto
{
    public List<UserAnswerDto> Answers { get; set; } = new();
    public int TimeSpentSeconds { get; set; }
}

public class UserAnswerDto
{
    public int QuestionId { get; set; }
    public string SelectedOption { get; set; } = string.Empty;
}

public class ExamResultDto
{
    public int ProgressId { get; set; }
    public int ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int Unanswered { get; set; }
    public int Score { get; set; } // Percentage
    public int TotalPoints { get; set; }
    public int EarnedPoints { get; set; }
    public int PassingScore { get; set; }
    public bool IsPassed { get; set; }
    public string TimeSpent { get; set; } = string.Empty;
    public int TimeSpentSeconds { get; set; }
    public int ListeningCorrect { get; set; }
    public int ListeningTotal { get; set; }
    public int ListeningScore { get; set; }
    public int ReadingCorrect { get; set; }
    public int ReadingTotal { get; set; }
    public int ReadingScore { get; set; }
    public DateTime CompletedAt { get; set; }
    public List<AnswerDetailDto> Details { get; set; } = new();
}

public class AnswerDetailDto
{
    public int QuestionId { get; set; }
    public int QuestionOrder { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionType { get; set; }
    public string? SkillType { get; set; }
    public int PartNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? AudioUrl { get; set; }
    public string SelectedOption { get; set; } = string.Empty;
    public string CorrectOption { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
    public List<OptionDetailDto> Options { get; set; } = new();
}

public class OptionDetailDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? Text { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
}

