namespace HiHSK.Domain.Entities;

public class Question
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? ExerciseId { get; set; } // Bài tập trong chủ đề
    public int? ReadingPassageId { get; set; }
    public int? DialogueId { get; set; }
    public int? SentencePatternId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    
    // Question Type: TRUE_FALSE, SELECT_IMAGE, MULTIPLE_CHOICE, FILL_BLANK, CHOOSE_MEANING
    public string QuestionType { get; set; } = "CHOOSE_MEANING";
    
    // Skill Type for exam: LISTENING, READING
    public string? SkillType { get; set; }
    
    // Part number in exam (1, 2, 3, 4)
    public int? PartNumber { get; set; }
    
    // Instruction for this question
    public string? Instruction { get; set; }
    
    public string? AudioUrl { get; set; }
    
    // Audio time markers (in seconds) for shared audio file
    public int? AudioStartTime { get; set; }
    public int? AudioEndTime { get; set; }
    
    // Image URL for the question (used in TRUE_FALSE, SELECT_IMAGE types)
    public string? ImageUrl { get; set; }
    
    // For FILL_BLANK type: sentence with blank (e.g., "我____喝茶。")
    public string? BlankSentence { get; set; }
    
    public int Points { get; set; } = 1;
    public int DifficultyLevel { get; set; } = 1;
    public string? Explanation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public LessonExercise? Exercise { get; set; }
    public ReadingPassage? ReadingPassage { get; set; }
    public Dialogue? Dialogue { get; set; }
    public SentencePattern? SentencePattern { get; set; }
    public ICollection<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();
    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
    public ICollection<ExamPaperQuestion> ExamPaperQuestions { get; set; } = new List<ExamPaperQuestion>();
}

