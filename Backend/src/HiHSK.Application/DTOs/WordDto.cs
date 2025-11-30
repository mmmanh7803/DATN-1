namespace HiHSK.Application.DTOs;

public class WordExampleDto
{
    public int Id { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int SortOrder { get; set; }
}

public class WordDto
{
    public int Id { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public int? HSKLevel { get; set; }
    public int? StrokeCount { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? PartOfSpeechVi { get; set; }
    public string? PartOfSpeechEn { get; set; }
    public string? GrammarNote { get; set; }
    public string? Structure { get; set; }
    public List<WordExampleDto> Examples { get; set; } = new();
}








