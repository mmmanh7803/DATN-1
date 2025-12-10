using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface IVocabularyService
{
    Task<List<VocabularyTopicDto>> GetAllTopicsAsync(string? userId = null);
    Task<VocabularyTopicDetailDto?> GetTopicByIdAsync(int topicId, string? userId = null);
    Task<List<FlashcardReviewDto>> GetWordsForReviewAsync(int topicId, string userId, bool onlyDue = true, int? limit = null);
    Task<ReviewStatsDto> GetTopicStatsAsync(int topicId, string userId);
    Task<ReviewStatsDto> GetOverallStatsAsync(string userId);
    Task<List<WordWithProgressDto>> GetWordsByHSKLevelAndPartAsync(int hskLevel, int partNumber, string? userId = null);
    Task<WordWithProgressDto> GetOrCreateWordByCharacterAsync(string character, string? userId = null);
    Task<Dictionary<string, WordWithProgressDto>> GetOrCreateWordsBatchAsync(
        List<string> characters, 
        string? userId = null,
        int batchSize = 5,
        int maxRetries = 2,
        int delayBetweenBatchesMs = 500);
    Task<PartProgressDto> GetPartProgressAsync(int hskLevel, int partNumber, string userId);
    Task<WordWithProgressDto?> GetWordByIdAsync(int wordId, string? userId = null);
    Task<List<QuestionDto>> GenerateImageQuizQuestionsAsync(int topicId, int? count = null);
    Task<List<QuestionDto>> GenerateFillBlankQuestionsAsync(int topicId, int? count = null);
}

