using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Application.Services;

public class VocabularyService : IVocabularyService
{
    private readonly IVocabularyRepository _vocabularyRepository;
    private readonly IUserWordProgressRepository _userProgressRepository;
    private readonly IActivityProgressRepository _activityProgressRepository;
    private readonly GeminiService _geminiService;

    public VocabularyService(
        IVocabularyRepository vocabularyRepository,
        IUserWordProgressRepository userProgressRepository,
        IActivityProgressRepository activityProgressRepository,
        GeminiService geminiService)
    {
        _vocabularyRepository = vocabularyRepository;
        _userProgressRepository = userProgressRepository;
        _activityProgressRepository = activityProgressRepository;
        _geminiService = geminiService;
    }

    public async Task<List<VocabularyTopicDto>> GetAllTopicsAsync(string? userId = null)
    {
        var topics = await _vocabularyRepository.GetAllTopicsAsync();
        var result = new List<VocabularyTopicDto>();

        foreach (var topic in topics)
        {
            var wordCount = await _vocabularyRepository.GetWordCountByTopicIdAsync(topic.Id);
            
            result.Add(new VocabularyTopicDto
            {
                Id = topic.Id,
                Name = topic.Name,
                Description = topic.Description,
                ImageUrl = topic.ImageUrl,
                SortOrder = topic.SortOrder,
                WordCount = wordCount
            });
        }

        return result;
    }

    public async Task<VocabularyTopicDetailDto?> GetTopicByIdAsync(int topicId, string? userId = null)
    {
        var topic = await _vocabularyRepository.GetTopicWithWordsAsync(topicId);
        if (topic == null)
            return null;

        var words = topic.WordVocabularyTopics.Select(wvt => wvt.Word).ToList();
        
        // DEBUG: Log số từ vựng
        Console.WriteLine($"🔍 [VocabularyService] Topic ID {topicId}: {topic.Name}");
        Console.WriteLine($"  - WordVocabularyTopics count: {topic.WordVocabularyTopics.Count}");
        Console.WriteLine($"  - Words count (after Select): {words.Count}");
        
        var wordsWithProgress = new List<WordWithProgressDto>();

        foreach (var word in words)
        {
            var wordDto = new WordWithProgressDto
            {
                Id = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ImageUrl = word.ImageUrl,
                ExampleSentence = word.ExampleSentence,
                HSKLevel = word.HSKLevel,
                StrokeCount = word.StrokeCount,
                PartOfSpeech = word.PartOfSpeech,
                PartOfSpeechVi = word.PartOfSpeechVi,
                PartOfSpeechEn = word.PartOfSpeechEn,
                GrammarNote = word.GrammarNote,
                Structure = word.Structure
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        UserId = progress.UserId,
                        WordId = progress.WordId,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            wordsWithProgress.Add(wordDto);
        }

        return new VocabularyTopicDetailDto
        {
            Id = topic.Id,
            Name = topic.Name,
            Description = topic.Description,
            ImageUrl = topic.ImageUrl,
            SortOrder = topic.SortOrder,
            WordCount = words.Count,
            Words = wordsWithProgress
        };
    }

    public async Task<List<FlashcardReviewDto>> GetWordsForReviewAsync(int topicId, string userId, bool onlyDue = true, int? limit = null)
    {
        List<Domain.Entities.Word> words;

        if (onlyDue)
        {
            var progressList = await _userProgressRepository.GetWordsDueForReviewAsync(userId, topicId, limit);
            words = progressList.Select(p => p.Word).ToList();
        }
        else
        {
            words = await _vocabularyRepository.GetWordsByTopicIdAsync(topicId);
            if (limit.HasValue)
            {
                words = words.Take(limit.Value).ToList();
            }
        }

        var result = new List<FlashcardReviewDto>();

        foreach (var word in words)
        {
            var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
            
            result.Add(new FlashcardReviewDto
            {
                WordId = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = word.ExampleSentence,
                Progress = progress != null ? new UserWordProgressDto
                {
                    Id = progress.Id,
                    UserId = progress.UserId,
                    WordId = progress.WordId,
                    Status = progress.Status,
                    NextReviewDate = progress.NextReviewDate,
                    ReviewCount = progress.ReviewCount,
                    CorrectCount = progress.CorrectCount,
                    WrongCount = progress.WrongCount,
                    LastReviewedAt = progress.LastReviewedAt
                } : null
            });
        }

        return result;
    }

    public async Task<ReviewStatsDto> GetTopicStatsAsync(int topicId, string userId)
    {
        var totalWords = await _vocabularyRepository.GetWordCountByTopicIdAsync(topicId);
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId, topicId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId, topicId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId, topicId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId, topicId);

        return new ReviewStatsDto
        {
            TotalWords = totalWords,
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }

    public async Task<ReviewStatsDto> GetOverallStatsAsync(string userId)
    {
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId);

        return new ReviewStatsDto
        {
            TotalWords = 0, // Tổng số từ sẽ được tính từ tất cả topics
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }

    public async Task<List<WordWithProgressDto>> GetWordsByHSKLevelAndPartAsync(int hskLevel, int partNumber, string? userId = null)
    {
        // Validate partNumber (1-10)
        if (partNumber < 1 || partNumber > 10)
        {
            throw new ArgumentException("Part number must be between 1 and 10", nameof(partNumber));
        }

        // Lấy 150 từ vựng theo HSK level, đã được sắp xếp theo ID (thứ tự)
        // Không phụ thuộc vào LessonId, chỉ chia theo thứ tự ID
        var allWords = await _vocabularyRepository.GetWordsByHSKLevelAsync(hskLevel);
        
        // Tính toán phần cần lấy: mỗi phần 15 từ (chia đều 150 từ thành 10 phần)
        // Part 1: từ 1-15, Part 2: từ 16-30, ..., Part 10: từ 136-150
        const int wordsPerPart = 15;
        int skip = (partNumber - 1) * wordsPerPart;
        
        // Lấy phần từ vựng theo thứ tự ID (không phụ thuộc vào LessonId)
        // allWords đã được sắp xếp theo ID trong repository
        var wordsInPart = allWords
            .Skip(skip)
            .Take(wordsPerPart)
            .ToList();

        var result = new List<WordWithProgressDto>();

        foreach (var word in wordsInPart)
        {
            var wordDto = new WordWithProgressDto
            {
                Id = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ImageUrl = word.ImageUrl,
                ExampleSentence = word.ExampleSentence,
                HSKLevel = word.HSKLevel,
                StrokeCount = word.StrokeCount,
                PartOfSpeech = word.PartOfSpeech,
                PartOfSpeechVi = word.PartOfSpeechVi,
                PartOfSpeechEn = word.PartOfSpeechEn,
                GrammarNote = word.GrammarNote,
                Structure = word.Structure,
                Examples = (word.WordExamples ?? new List<Domain.Entities.WordExample>())
                    .Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character,
                        Pinyin = e.Pinyin,
                        Meaning = e.Meaning,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .OrderBy(e => e.SortOrder)
                    .ToList()
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        UserId = progress.UserId,
                        WordId = progress.WordId,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            result.Add(wordDto);
        }

        return result;
    }

    public async Task<WordWithProgressDto> GetOrCreateWordByCharacterAsync(string character, string? userId = null)
    {
        if (string.IsNullOrWhiteSpace(character))
            throw new ArgumentException("Character không được để trống");

        // 1. Tìm từ trong database
        var existingWord = await _vocabularyRepository.GetWordByCharacterAsync(character);
        if (existingWord != null)
        {
            // Từ đã tồn tại, trả về thông tin
            var wordDto = new WordWithProgressDto
            {
                Id = existingWord.Id,
                Character = existingWord.Character,
                Pinyin = existingWord.Pinyin,
                Meaning = existingWord.Meaning,
                AudioUrl = existingWord.AudioUrl,
                ImageUrl = existingWord.ImageUrl,
                ExampleSentence = existingWord.ExampleSentence,
                HSKLevel = existingWord.HSKLevel,
                StrokeCount = existingWord.StrokeCount,
                Examples = (existingWord.WordExamples ?? new List<WordExample>())
                    .Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character,
                        Pinyin = e.Pinyin,
                        Meaning = e.Meaning,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .OrderBy(e => e.SortOrder)
                    .ToList()
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, existingWord.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        UserId = progress.UserId,
                        WordId = progress.WordId,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            return wordDto;
        }

        // 2. Từ chưa tồn tại, gọi Gemini API để generate thông tin
        WordInfoDto wordInfo = null;
        bool aiFailed = false;
        try
        {
            Console.WriteLine($"[VocabularyService] Bắt đầu gọi Gemini API cho character '{character}'");
            wordInfo = await _geminiService.GenerateWordInfoAsync(character);
            if (wordInfo == null)
            {
                throw new Exception("Gemini API trả về null");
            }
            if (string.IsNullOrWhiteSpace(wordInfo.Pinyin))
            {
                throw new Exception("Gemini API không trả về pinyin");
            }
            if (string.IsNullOrWhiteSpace(wordInfo.Meaning))
            {
                throw new Exception("Gemini API không trả về meaning");
            }
            Console.WriteLine($"[VocabularyService] ✅ Gemini API trả về thành công: Pinyin='{wordInfo.Pinyin}', Meaning='{wordInfo.Meaning}', Examples={wordInfo.Examples?.Count ?? 0}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyService] ❌ Lỗi khi gọi Gemini API cho '{character}': {ex.Message}");
            Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[VocabularyService] InnerException: {ex.InnerException.Message}");
            }
            
            // Thay vì throw exception, tạo word với thông tin tối thiểu
            aiFailed = true;
            wordInfo = new WordInfoDto
            {
                Pinyin = "", // Sẽ được parse từ client nếu có
                Meaning = "Không thể tải thông tin từ AI. Vui lòng thử lại sau.",
                Examples = new List<WordExampleDto>()
            };
            Console.WriteLine($"[VocabularyService] ⚠️ Tạo word với thông tin tối thiểu do AI fail");
        }

        // 3. Tạo từ mới (KHÔNG gán WordExamples vào navigation property để tránh lỗi tracking)
        // Nếu AI fail, vẫn tạo word với thông tin tối thiểu
        var newWord = new Word
        {
            Character = character,
            Pinyin = wordInfo?.Pinyin ?? "", // Có thể để trống nếu AI fail
            Meaning = wordInfo?.Meaning ?? "Không thể tải thông tin từ AI. Vui lòng thử lại sau.",
            CreatedAt = DateTime.UtcNow
        };

        // 4. Lưu Word vào database trước (để có Id)
        Word savedWord;
        try
        {
            savedWord = await _vocabularyRepository.AddWordAsync(newWord);
            if (savedWord == null)
            {
                throw new Exception("AddWordAsync trả về null");
            }
            if (savedWord.Id <= 0)
            {
                throw new Exception($"Word được lưu nhưng không có Id hợp lệ. Id={savedWord.Id}");
            }
            Console.WriteLine($"[VocabularyService] ✅ Đã lưu Word với Id={savedWord.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyService] ❌ Lỗi khi lưu từ mới '{character}' vào database: {ex.Message}");
            Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[VocabularyService] InnerException: {ex.InnerException.Message}");
                Console.WriteLine($"[VocabularyService] InnerStackTrace: {ex.InnerException.StackTrace}");
            }
            throw new Exception($"Không thể lưu từ vựng vào database: {ex.Message}", ex);
        }

        // 5. Lưu WordExamples sau khi Word đã có Id (chỉ khi AI thành công)
        if (!aiFailed && wordInfo != null && wordInfo.Examples != null && wordInfo.Examples.Any())
        {
            try
            {
                Console.WriteLine($"[VocabularyService] Bắt đầu lưu {wordInfo.Examples.Count} WordExamples cho WordId={savedWord.Id}");
                await _vocabularyRepository.AddWordExamplesAsync(savedWord.Id, wordInfo.Examples);
                
                // Reload Word để có WordExamples
                var reloadedWord = await _vocabularyRepository.GetWordByIdAsync(savedWord.Id);
                if (reloadedWord != null)
                {
                    savedWord = reloadedWord;
                    Console.WriteLine($"[VocabularyService] ✅ Reload Word thành công, có {savedWord.WordExamples?.Count ?? 0} WordExamples");
                }
                else
                {
                    Console.WriteLine($"[VocabularyService] ⚠️ Không thể reload Word sau khi lưu WordExamples, sử dụng savedWord gốc");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[VocabularyService] ⚠️ Lỗi khi lưu WordExamples cho từ '{character}': {ex.Message}");
                Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[VocabularyService] InnerException: {ex.InnerException.Message}");
                }
                // Không throw exception, vì Word đã được lưu thành công
                // Chỉ log lỗi và tiếp tục với savedWord gốc (không có WordExamples)
            }
        }

        // 6. Trả về DTO với WordExamples đã lưu (có Id)
        try
        {
            var result = new WordWithProgressDto
            {
                Id = savedWord.Id,
                Character = savedWord.Character ?? character,
                Pinyin = savedWord.Pinyin ?? wordInfo.Pinyin,
                Meaning = savedWord.Meaning ?? wordInfo.Meaning,
                AudioUrl = savedWord.AudioUrl,
                ImageUrl = savedWord.ImageUrl,
                ExampleSentence = savedWord.ExampleSentence,
                HSKLevel = savedWord.HSKLevel,
                StrokeCount = savedWord.StrokeCount,
                Examples = (savedWord.WordExamples ?? new List<WordExample>())
                    .Where(e => e != null) // Lọc null
                    .Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character ?? string.Empty,
                        Pinyin = e.Pinyin ?? string.Empty,
                        Meaning = e.Meaning ?? string.Empty,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .OrderBy(e => e.SortOrder)
                    .ToList()
            };

            // Thêm progress nếu có userId
            if (userId != null)
            {
                try
                {
                    var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, savedWord.Id);
                    if (progress != null)
                    {
                        result.Progress = new UserWordProgressDto
                        {
                            Id = progress.Id,
                            Status = progress.Status,
                            NextReviewDate = progress.NextReviewDate,
                            ReviewCount = progress.ReviewCount,
                            CorrectCount = progress.CorrectCount,
                            WrongCount = progress.WrongCount,
                            LastReviewedAt = progress.LastReviewedAt
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[VocabularyService] ⚠️ Lỗi khi lấy progress cho userId={userId}, wordId={savedWord.Id}: {ex.Message}");
                    // Không throw, chỉ log
                }
            }

            Console.WriteLine($"[VocabularyService] ✅ Trả về WordWithProgressDto thành công cho character '{character}'");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyService] ❌ Lỗi khi tạo WordWithProgressDto cho '{character}': {ex.Message}");
            Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
            throw new Exception($"Không thể tạo DTO cho từ vựng: {ex.Message}", ex);
        }
    }

    public async Task<Dictionary<string, WordWithProgressDto>> GetOrCreateWordsBatchAsync(
        List<string> characters, 
        string? userId = null,
        int batchSize = 5,
        int maxRetries = 2,
        int delayBetweenBatchesMs = 500)
    {
        var result = new Dictionary<string, WordWithProgressDto>();
        
        // Loại bỏ duplicates và empty strings
        var uniqueCharacters = characters
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Distinct()
            .ToList();

        if (!uniqueCharacters.Any())
        {
            return result;
        }

        Console.WriteLine($"[VocabularyService] Bắt đầu batch process cho {uniqueCharacters.Count} từ (batchSize={batchSize}, maxRetries={maxRetries})");

        // Xử lý theo batch nhỏ để tránh quá tải Gemini API
        for (int i = 0; i < uniqueCharacters.Count; i += batchSize)
        {
            var batch = uniqueCharacters.Skip(i).Take(batchSize).ToList();
            var batchNumber = (i / batchSize) + 1;
            var totalBatches = (int)Math.Ceiling((double)uniqueCharacters.Count / batchSize);
            
            Console.WriteLine($"[VocabularyService] Đang xử lý batch {batchNumber}/{totalBatches} ({batch.Count} từ)");

            // Xử lý từng từ trong batch (song song trong batch)
            var batchTasks = batch.Select(async character =>
            {
                int retryCount = 0;
                Exception? lastException = null;

                // Retry mechanism
                while (retryCount < maxRetries)
                {
                    try
                    {
                        // Timeout cho mỗi từ (30s)
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                        var word = await GetOrCreateWordByCharacterAsync(character, userId);
                        
                        Console.WriteLine($"[VocabularyService] ✅ Thành công: '{character}' (retry {retryCount})");
                        return new { Character = character, Word = word, Success = true };
                    }
                    catch (Exception ex)
                    {
                        lastException = ex;
                        retryCount++;
                        
                        Console.WriteLine($"[VocabularyService] ❌ Lỗi '{character}' (retry {retryCount}/{maxRetries}): {ex.Message}");
                        
                        if (retryCount < maxRetries)
                        {
                            // Exponential backoff: 1s, 2s, 4s...
                            var delayMs = 1000 * (int)Math.Pow(2, retryCount - 1);
                            Console.WriteLine($"[VocabularyService] Đợi {delayMs}ms trước khi retry...");
                            await Task.Delay(delayMs);
                        }
                    }
                }

                // Nếu fail hết retries, tạo word với thông tin tối thiểu
                Console.WriteLine($"[VocabularyService] ⚠️ Fail sau {maxRetries} retries cho '{character}', tạo word với thông tin tối thiểu");
                
                try
                {
                    // Tạo word minimal trong database
                    var minimalWord = new Word
                    {
                        Character = character,
                        Pinyin = "",
                        Meaning = $"Không thể tải thông tin (lỗi {maxRetries} lần). Vui lòng thử lại sau.",
                        CreatedAt = DateTime.UtcNow
                    };
                    
                    await _vocabularyRepository.AddWordAsync(minimalWord);
                    
                    var wordDto = new WordWithProgressDto
                    {
                        Id = minimalWord.Id,
                        Character = minimalWord.Character,
                        Pinyin = minimalWord.Pinyin,
                        Meaning = minimalWord.Meaning,
                        Examples = new List<WordExampleDto>()
                    };
                    
                    return new { Character = character, Word = wordDto, Success = false };
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[VocabularyService] ❌ Không thể tạo minimal word cho '{character}': {ex.Message}");
                    return new { Character = character, Word = (WordWithProgressDto?)null, Success = false };
                }
            });

            var batchResults = await Task.WhenAll(batchTasks);

            // Thêm vào result
            foreach (var item in batchResults)
            {
                if (item.Word != null)
                {
                    result[item.Character] = item.Word;
                }
            }

            // Delay giữa các batch (trừ batch cuối)
            if (i + batchSize < uniqueCharacters.Count)
            {
                Console.WriteLine($"[VocabularyService] Đợi {delayBetweenBatchesMs}ms trước batch tiếp theo...");
                await Task.Delay(delayBetweenBatchesMs);
            }
        }

        Console.WriteLine($"[VocabularyService] ✅ Hoàn thành batch process: {result.Count}/{uniqueCharacters.Count} từ thành công");
        return result;
    }

    public async Task<PartProgressDto> GetPartProgressAsync(int hskLevel, int partNumber, string userId)
    {
        // Lấy danh sách từ trong part
        var words = await GetWordsByHSKLevelAndPartAsync(hskLevel, partNumber, userId);

        // Tính toán thống kê từ vựng
        var totalWords = words.Count;
        var masteredWords = words.Count(w => w.Progress?.Status == "Mastered");
        var learningWords = words.Count(w => w.Progress?.Status == "Learning");
        var newWords = words.Count(w => w.Progress == null || w.Progress.Status == "New");

        // Kiểm tra điều kiện: tất cả từ vựng đã được đánh dấu là "đã học" (Learning hoặc Mastered)
        var allWordsLearned = totalWords > 0 && words.All(w => 
            w.Progress != null && 
            (w.Progress.Status == "Learning" || w.Progress.Status == "Mastered"));

        // Lấy activity progress từ database
        var activityProgresses = await _activityProgressRepository.GetUserActivityProgressByPartAsync(userId, hskLevel, partNumber);
        var completedActivityIds = activityProgresses.Where(p => p.IsCompleted).Select(p => p.ActivityId).ToHashSet();

        // Định nghĩa các hoạt động học tập - ĐỌC TỪ DATABASE thay vì dùng allWordsLearned
        var activities = new List<ActivityProgressDto>
        {
            new ActivityProgressDto
            {
                ActivityId = "vocabulary",
                ActivityName = "Từ vựng",
                IsCompleted = completedActivityIds.Contains("vocabulary")
            },
            new ActivityProgressDto
            {
                ActivityId = "quick-memorize",
                ActivityName = "Nhớ nhanh từ",
                IsCompleted = completedActivityIds.Contains("quick-memorize")
            },
            new ActivityProgressDto
            {
                ActivityId = "true-false",
                ActivityName = "Chọn đúng sai",
                IsCompleted = completedActivityIds.Contains("true-false")
            },
            new ActivityProgressDto
            {
                ActivityId = "true-false-sentence",
                ActivityName = "Chọn đúng sai với câu",
                IsCompleted = completedActivityIds.Contains("true-false-sentence")
            },
            new ActivityProgressDto
            {
                ActivityId = "listen-image",
                ActivityName = "Nghe câu chọn hình ảnh",
                IsCompleted = completedActivityIds.Contains("listen-image")
            },
            new ActivityProgressDto
            {
                ActivityId = "match-sentence",
                ActivityName = "Ghép câu",
                IsCompleted = completedActivityIds.Contains("match-sentence")
            },
            new ActivityProgressDto
            {
                ActivityId = "fill-blank",
                ActivityName = "Điền từ",
                IsCompleted = completedActivityIds.Contains("fill-blank")
            },
            new ActivityProgressDto
            {
                ActivityId = "flashcard",
                ActivityName = "Flash card từ vựng",
                IsCompleted = completedActivityIds.Contains("flashcard")
            },
            new ActivityProgressDto
            {
                ActivityId = "conversation",
                ActivityName = "Hội thoại",
                IsCompleted = completedActivityIds.Contains("conversation")
            },
            new ActivityProgressDto
            {
                ActivityId = "reading",
                ActivityName = "Đọc hiểu",
                IsCompleted = completedActivityIds.Contains("reading")
            },
            new ActivityProgressDto
            {
                ActivityId = "grammar",
                ActivityName = "Ngữ pháp",
                IsCompleted = completedActivityIds.Contains("grammar")
            },
            new ActivityProgressDto
            {
                ActivityId = "arrange-sentence",
                ActivityName = "Sắp xếp câu",
                IsCompleted = completedActivityIds.Contains("arrange-sentence")
            },
            new ActivityProgressDto
            {
                ActivityId = "translation",
                ActivityName = "Bài tập luyện dịch",
                IsCompleted = completedActivityIds.Contains("translation")
            },
            new ActivityProgressDto
            {
                ActivityId = "comprehensive-test",
                ActivityName = "Kiểm tra tổng hợp",
                IsCompleted = completedActivityIds.Contains("comprehensive-test")
            }
        };

        var completedActivities = activities.Count(a => a.IsCompleted);
        var totalActivities = activities.Count;

        // Tính phần trăm hoàn thành: dựa trên số hoạt động đã hoàn thành
        var progressPercentage = totalActivities > 0 
            ? (int)Math.Round((double)completedActivities / totalActivities * 100) 
            : 0;

        return new PartProgressDto
        {
            HskLevel = hskLevel,
            PartNumber = partNumber,
            TotalWords = totalWords,
            MasteredWords = masteredWords,
            LearningWords = learningWords,
            NewWords = newWords,
            CompletedActivities = completedActivities,
            TotalActivities = totalActivities,
            ProgressPercentage = progressPercentage,
            Activities = activities
        };
    }

    public async Task<WordWithProgressDto?> GetWordByIdAsync(int wordId, string? userId = null)
    {
        var word = await _vocabularyRepository.GetWordByIdAsync(wordId);
        if (word == null)
            return null;

        var wordDto = new WordWithProgressDto
        {
            Id = word.Id,
            Character = word.Character,
            Pinyin = word.Pinyin,
            Meaning = word.Meaning,
            AudioUrl = word.AudioUrl,
            ImageUrl = word.ImageUrl,
            ExampleSentence = word.ExampleSentence,
            HSKLevel = word.HSKLevel,
            StrokeCount = word.StrokeCount,
            PartOfSpeech = word.PartOfSpeech,
            PartOfSpeechVi = word.PartOfSpeechVi,
            PartOfSpeechEn = word.PartOfSpeechEn,
            GrammarNote = word.GrammarNote,
            Structure = word.Structure,
            Examples = (word.WordExamples ?? new List<WordExample>())
                .Select(e => new WordExampleDto
                {
                    Id = e.Id,
                    Character = e.Character,
                    Pinyin = e.Pinyin,
                    Meaning = e.Meaning,
                    AudioUrl = e.AudioUrl,
                    SortOrder = e.SortOrder
                })
                .OrderBy(e => e.SortOrder)
                .ToList()
        };

        // Lấy progress nếu có userId
        if (userId != null)
        {
            var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
            if (progress != null)
            {
                wordDto.Progress = new UserWordProgressDto
                {
                    Id = progress.Id,
                    Status = progress.Status,
                    NextReviewDate = progress.NextReviewDate,
                    ReviewCount = progress.ReviewCount,
                    CorrectCount = progress.CorrectCount,
                    WrongCount = progress.WrongCount,
                    LastReviewedAt = progress.LastReviewedAt
                };
            }
        }

        return wordDto;
    }

    public async Task<List<QuestionDto>> GenerateImageQuizQuestionsAsync(int topicId, int? count = null)
    {
        // Lấy danh sách từ vựng trong topic
        var words = await _vocabularyRepository.GetWordsByTopicIdAsync(topicId);
        
        if (words == null || words.Count < 4)
        {
            return new List<QuestionDto>();
        }

        // Lấy topic để có ImageUrl
        var topic = await _vocabularyRepository.GetTopicByIdAsync(topicId);
        
        // Xáo trộn danh sách từ vựng
        var shuffledWords = words.OrderBy(x => Guid.NewGuid()).ToList();
        
        // Số lượng câu hỏi (mặc định là số từ vựng, tối đa 20)
        var questionCount = count ?? Math.Min(words.Count, 20);
        questionCount = Math.Min(questionCount, shuffledWords.Count);
        
        var questions = new List<QuestionDto>();
        var random = new Random();
        
        for (int i = 0; i < questionCount; i++)
        {
            var correctWord = shuffledWords[i];
            
            // Lấy 3 từ nhiễu ngẫu nhiên (khác với từ đúng)
            var wrongWords = words
                .Where(w => w.Id != correctWord.Id)
                .OrderBy(x => Guid.NewGuid())
                .Take(3)
                .ToList();
            
            // Tạo 4 lựa chọn: 1 đúng + 3 nhiễu
            var options = new List<QuestionOptionDto>();
            
            // Thêm đáp án đúng
            options.Add(new QuestionOptionDto
            {
                Id = 1,
                OptionText = $"{correctWord.Character} ({correctWord.Pinyin}) - {correctWord.Meaning}",
                OptionLabel = "A",
                IsCorrect = true
            });
            
            // Thêm 3 đáp án nhiễu
            var labels = new[] { "B", "C", "D" };
            for (int j = 0; j < wrongWords.Count && j < 3; j++)
            {
                options.Add(new QuestionOptionDto
                {
                    Id = j + 2,
                    OptionText = $"{wrongWords[j].Character} ({wrongWords[j].Pinyin}) - {wrongWords[j].Meaning}",
                    OptionLabel = labels[j],
                    IsCorrect = false
                });
            }
            
            // Xáo trộn thứ tự các đáp án
            options = options.OrderBy(x => Guid.NewGuid()).ToList();
            
            // Cập nhật lại label sau khi xáo trộn
            var newLabels = new[] { "A", "B", "C", "D" };
            for (int j = 0; j < options.Count; j++)
            {
                options[j].OptionLabel = newLabels[j];
            }
            
            // Tạo câu hỏi
            var question = new QuestionDto
            {
                Id = i + 1, // Temporary ID
                QuestionText = $"Chọn từ vựng đúng cho hình ảnh:",
                QuestionType = "IMAGE_QUIZ",
                Points = 1,
                Explanation = $"Đáp án đúng: {correctWord.Character} ({correctWord.Pinyin}) - {correctWord.Meaning}",
                Options = options,
                CorrectWordId = correctWord.Id,
                // Sử dụng ImageUrl của từ vựng, nếu không có thì dùng topic.ImageUrl
                ImageUrl = correctWord.ImageUrl ?? topic?.ImageUrl
            };
            
            questions.Add(question);
        }
        
        return questions;
    }

    public async Task<List<QuestionDto>> GenerateFillBlankQuestionsAsync(int topicId, int? count = null)
    {
        // Lấy danh sách từ vựng trong topic
        var words = await _vocabularyRepository.GetWordsByTopicIdAsync(topicId);
        
        if (words == null || words.Count < 4)
        {
            return new List<QuestionDto>();
        }

        // Xáo trộn danh sách từ vựng
        var shuffledWords = words.OrderBy(x => Guid.NewGuid()).ToList();
        
        // Số lượng câu hỏi (mặc định là số từ vựng, tối đa 10)
        var questionCount = count ?? Math.Min(words.Count, 10);
        questionCount = Math.Min(questionCount, shuffledWords.Count);
        
        var questions = new List<QuestionDto>();
        
        for (int i = 0; i < questionCount; i++)
        {
            var correctWord = shuffledWords[i];
            
            // Tạo câu có chỗ trống từ exampleSentence hoặc tạo câu mẫu
            string sentenceWithBlank;
            if (!string.IsNullOrWhiteSpace(correctWord.ExampleSentence))
            {
                // Thay thế từ đúng bằng chỗ trống
                sentenceWithBlank = correctWord.ExampleSentence.Replace(
                    correctWord.Character, 
                    "_____"
                );
            }
            else
            {
                // Tạo câu mẫu đơn giản
                sentenceWithBlank = $"这是_____。";
            }
            
            // Lấy 3 từ nhiễu ngẫu nhiên (khác với từ đúng)
            var wrongWords = words
                .Where(w => w.Id != correctWord.Id)
                .OrderBy(x => Guid.NewGuid())
                .Take(3)
                .ToList();
            
            // Tạo 4 lựa chọn: 1 đúng + 3 nhiễu
            var options = new List<QuestionOptionDto>();
            
            // Thêm đáp án đúng
            options.Add(new QuestionOptionDto
            {
                Id = 1,
                OptionText = correctWord.Character,
                OptionLabel = "A",
                IsCorrect = true
            });
            
            // Thêm 3 đáp án nhiễu
            var labels = new[] { "B", "C", "D" };
            for (int j = 0; j < wrongWords.Count && j < 3; j++)
            {
                options.Add(new QuestionOptionDto
                {
                    Id = j + 2,
                    OptionText = wrongWords[j].Character,
                    OptionLabel = labels[j],
                    IsCorrect = false
                });
            }
            
            // Xáo trộn thứ tự các đáp án
            options = options.OrderBy(x => Guid.NewGuid()).ToList();
            
            // Cập nhật lại label sau khi xáo trộn
            var newLabels = new[] { "A", "B", "C", "D" };
            for (int j = 0; j < options.Count; j++)
            {
                options[j].OptionLabel = newLabels[j];
            }
            
            // Tạo câu hỏi
            var question = new QuestionDto
            {
                Id = i + 1, // Temporary ID
                QuestionText = $"Điền từ vào chỗ trống:",
                QuestionType = "FILL_BLANK",
                Points = 1,
                Explanation = $"Đáp án đúng: {correctWord.Character} ({correctWord.Pinyin}) - {correctWord.Meaning}",
                Options = options,
                CorrectWordId = correctWord.Id,
                BlankSentence = sentenceWithBlank,
                AudioUrl = correctWord.AudioUrl // Cho tab "Nghe và điền từ"
            };
            
            questions.Add(question);
        }
        
        return questions;
    }
}

