namespace HiHSK.Domain.Entities;

public class QuestionOption
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public string OptionLabel { get; set; } = string.Empty; // 'A', 'B', 'C', 'D', '✓', '✗'
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
    
    // Image URL for SELECT_IMAGE type questions
    public string? ImageUrl { get; set; }

    // Navigation properties
    public Question Question { get; set; } = null!;
    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
}

