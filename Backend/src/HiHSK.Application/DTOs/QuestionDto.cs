namespace HiHSK.Application.DTOs;

public class QuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public int Points { get; set; }
    public string? Explanation { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
    public int? CorrectWordId { get; set; } // ID của từ vựng đúng (cho IMAGE_QUIZ)
}

public class QuestionOptionDto
{
    public int Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public string OptionLabel { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}















