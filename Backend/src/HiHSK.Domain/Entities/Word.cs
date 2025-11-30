namespace HiHSK.Domain.Entities;

public class Word
{
    public int Id { get; set; }
    public int? TopicId { get; set; } // Chủ đề trong giáo trình HSK
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public int? HSKLevel { get; set; }
    public int? Frequency { get; set; }
    public int? StrokeCount { get; set; }
    public string? PartOfSpeech { get; set; } // Từ loại (tiếng Trung): 名词, 动词, 形容词...
    public string? PartOfSpeechVi { get; set; } // Từ loại (tiếng Việt): Danh từ, Động từ, Tính từ...
    public string? PartOfSpeechEn { get; set; } // Từ loại (tiếng Anh): Noun, Verb, Adjective...
    public string? GrammarNote { get; set; } // Ghi chú ngữ pháp
    public string? Structure { get; set; } // Cấu trúc câu
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public LessonTopic? Topic { get; set; }
    public ICollection<UserWordProgress> UserWordProgresses { get; set; } = new List<UserWordProgress>();
    public ICollection<WordVocabularyTopic> WordVocabularyTopics { get; set; } = new List<WordVocabularyTopic>();
    public ICollection<WordRadical> WordRadicals { get; set; } = new List<WordRadical>();
    public ICollection<WordMeasureWord> WordMeasureWords { get; set; } = new List<WordMeasureWord>();
    public ICollection<FavoriteWord> FavoriteWords { get; set; } = new List<FavoriteWord>();
    public ICollection<UserPronunciationAttempt> UserPronunciationAttempts { get; set; } = new List<UserPronunciationAttempt>();
    public ICollection<ReadingPassageWord> ReadingPassageWords { get; set; } = new List<ReadingPassageWord>();
    public ICollection<UserReadingWordMark> UserReadingWordMarks { get; set; } = new List<UserReadingWordMark>();
    public ICollection<WritingExercise> WritingExercises { get; set; } = new List<WritingExercise>();
    public ICollection<WordExample> WordExamples { get; set; } = new List<WordExample>();
}

