using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class VocabularyRepository : IVocabularyRepository
{
    private readonly ApplicationDbContext _context;

    public VocabularyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<VocabularyTopic>> GetAllTopicsAsync()
    {
        return await _context.VocabularyTopics
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<VocabularyTopic?> GetTopicByIdAsync(int topicId)
    {
        return await _context.VocabularyTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);
    }

    public async Task<VocabularyTopic?> GetTopicWithWordsAsync(int topicId)
    {
        // Load topic without navigation properties first
        var topic = await _context.VocabularyTopics
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == topicId);
        
        if (topic == null)
            return null;
        
        // Query WordVocabularyTopics TRỰC TIẾP với filter theo topicId
        // ĐÂY LÀ CÁCH ĐÚNG để chỉ lấy words thuộc topic hiện tại
        var wordVocabularyTopics = await _context.WordVocabularyTopics
            .Where(wvt => wvt.VocabularyTopicId == topicId)
            .AsNoTracking()
            .ToListAsync();
        
        Console.WriteLine($"🔍 [VocabularyRepository] Topic ID {topicId}: {topic.Name}");
        Console.WriteLine($"  - WordVocabularyTopics từ DB (đã filter): {wordVocabularyTopics.Count}");
        
        if (wordVocabularyTopics.Count == 0)
        {
            Console.WriteLine($"  ⚠️ Không tìm thấy WordVocabularyTopics nào cho topic {topicId}");
            topic.WordVocabularyTopics = new List<WordVocabularyTopic>();
            return topic;
        }
        
        // Lấy wordIds từ junction table
        var wordIds = wordVocabularyTopics.Select(wvt => wvt.WordId).Distinct().ToList();
        Console.WriteLine($"  - Word IDs: {string.Join(", ", wordIds.Take(10))}{(wordIds.Count > 10 ? "..." : "")}");
        
        // Load Words từ DB
        var words = await _context.Words
            .Where(w => wordIds.Contains(w.Id))
            .AsNoTracking()
            .Select(w => new Word
            {
                Id = w.Id,
                Character = w.Character,
                Pinyin = w.Pinyin,
                Meaning = w.Meaning,
                AudioUrl = w.AudioUrl,
                ImageUrl = w.ImageUrl,
                ExampleSentence = w.ExampleSentence,
                HSKLevel = w.HSKLevel,
                StrokeCount = w.StrokeCount,
                Frequency = w.Frequency,
                CreatedAt = w.CreatedAt,
                TopicId = null // Không load navigation property
            })
            .OrderBy(w => w.Id)
            .ToListAsync();
        
        Console.WriteLine($"  - Words loaded từ DB: {words.Count}");
        
        // Gán Words vào WordVocabularyTopics
        foreach (var wvt in wordVocabularyTopics)
        {
            wvt.Word = words.FirstOrDefault(w => w.Id == wvt.WordId);
        }
        
        // Assign the filtered list to topic
        topic.WordVocabularyTopics = wordVocabularyTopics;
        
        var assignedCount = wordVocabularyTopics.Count(wvt => wvt.Word != null);
        Console.WriteLine($"  - Words assigned thành công: {assignedCount}/{wordVocabularyTopics.Count}");
        
        if (assignedCount != wordVocabularyTopics.Count)
        {
            Console.WriteLine($"  ⚠️ CÓ {wordVocabularyTopics.Count - assignedCount} word(s) không tìm thấy trong DB!");
        }
        
        return topic;
    }

    public async Task<List<Word>> GetWordsByTopicIdAsync(int topicId)
    {
        // Load Words mà không load navigation property Topic
        var wordIds = await _context.WordVocabularyTopics
            .Where(wvt => wvt.VocabularyTopicId == topicId)
            .Select(wvt => wvt.WordId)
            .ToListAsync();
        
        return await _context.Words
            .Where(w => wordIds.Contains(w.Id))
            .AsNoTracking()
            .Select(w => new Word
            {
                Id = w.Id,
                Character = w.Character,
                Pinyin = w.Pinyin,
                Meaning = w.Meaning,
                AudioUrl = w.AudioUrl,
                ImageUrl = w.ImageUrl,
                ExampleSentence = w.ExampleSentence,
                HSKLevel = w.HSKLevel,
                StrokeCount = w.StrokeCount,
                Frequency = w.Frequency,
                CreatedAt = w.CreatedAt
            })
            .OrderBy(w => w.Character)
            .ToListAsync();
    }

    public async Task<int> GetWordCountByTopicIdAsync(int topicId)
    {
        return await _context.WordVocabularyTopics
            .CountAsync(wvt => wvt.VocabularyTopicId == topicId);
    }

    public async Task<List<Word>> GetWordsByHSKLevelAsync(int hskLevel)
    {
        // Load words với AsNoTracking, chỉ load các fields cần thiết
        // Sắp xếp theo ID để đảm bảo thứ tự nhất quán
        try
        {
            // Sử dụng LINQ thay vì FromSqlRaw để tránh lỗi nếu schema thay đổi
            var words = await _context.Words
                .Where(w => w.HSKLevel == hskLevel)
                .OrderBy(w => w.Id)
                .Take(150) // Chỉ lấy 150 từ đầu tiên
                .AsNoTracking()
                .Select(w => new Word
                {
                    Id = w.Id,
                    Character = w.Character,
                    Pinyin = w.Pinyin,
                    Meaning = w.Meaning,
                    AudioUrl = w.AudioUrl,
                    ImageUrl = w.ImageUrl,
                    ExampleSentence = w.ExampleSentence,
                    HSKLevel = w.HSKLevel,
                    StrokeCount = w.StrokeCount,
                    Frequency = w.Frequency,
                    CreatedAt = w.CreatedAt
                })
                .ToListAsync();

            // Load WordExamples riêng nếu bảng tồn tại
            var wordIds = words.Select(w => w.Id).ToList();
            if (wordIds.Any())
            {
                try
                {
                    // Kiểm tra xem bảng WordExamples có tồn tại không
                    var examples = await _context.WordExamples
                        .Where(e => wordIds.Contains(e.WordId))
                        .AsNoTracking()
                        .OrderBy(e => e.WordId)
                        .ThenBy(e => e.SortOrder)
                        .ToListAsync();

                    // Gán examples vào words
                    foreach (var word in words)
                    {
                        word.WordExamples = examples
                            .Where(e => e.WordId == word.Id)
                            .OrderBy(e => e.SortOrder)
                            .ToList();
                    }
                }
                catch
                {
                    // Nếu bảng WordExamples chưa tồn tại, bỏ qua
                    // Words vẫn được trả về nhưng không có examples
                    foreach (var word in words)
                    {
                        word.WordExamples = new List<WordExample>();
                    }
                }
            }
            else
            {
                // Nếu không có words, trả về danh sách rỗng
                foreach (var word in words)
                {
                    word.WordExamples = new List<WordExample>();
                }
            }

            return words;
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi load words: {ex.Message}", ex);
        }
    }

    public async Task<Word?> GetWordByCharacterAsync(string character)
    {
        if (string.IsNullOrWhiteSpace(character))
            return null;

        try
        {
            // Tìm từ chính xác theo character
            var word = await _context.Words
                .Where(w => w.Character == character)
                .AsNoTracking()
                .Select(w => new Word
                {
                    Id = w.Id,
                    Character = w.Character,
                    Pinyin = w.Pinyin,
                    Meaning = w.Meaning,
                    AudioUrl = w.AudioUrl,
                    ImageUrl = w.ImageUrl,
                    ExampleSentence = w.ExampleSentence,
                    HSKLevel = w.HSKLevel,
                    StrokeCount = w.StrokeCount,
                    Frequency = w.Frequency,
                    CreatedAt = w.CreatedAt
                })
                .FirstOrDefaultAsync();

            // Nếu không tìm thấy chính xác, tìm từ chứa character hoặc character chứa từ
            if (word == null)
            {
                word = await _context.Words
                    .Where(w => w.Character.Contains(character) || character.Contains(w.Character))
                    .AsNoTracking()
                    .Select(w => new Word
                    {
                        Id = w.Id,
                        Character = w.Character,
                        Pinyin = w.Pinyin,
                        Meaning = w.Meaning,
                        AudioUrl = w.AudioUrl,
                        ImageUrl = w.ImageUrl,
                        ExampleSentence = w.ExampleSentence,
                        HSKLevel = w.HSKLevel,
                        StrokeCount = w.StrokeCount,
                        Frequency = w.Frequency,
                        CreatedAt = w.CreatedAt
                    })
                    .FirstOrDefaultAsync();
            }

            // Load WordExamples nếu có
            if (word != null)
            {
                try
                {
                    var examples = await _context.WordExamples
                        .Where(e => e.WordId == word.Id)
                        .AsNoTracking()
                        .OrderBy(e => e.SortOrder)
                        .ToListAsync();
                    word.WordExamples = examples;
                }
                catch
                {
                    word.WordExamples = new List<WordExample>();
                }
            }

            return word;
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi tìm từ theo character: {ex.Message}", ex);
        }
    }

    public async Task<Word?> GetWordByIdAsync(int wordId)
    {
        try
        {
            var word = await _context.Words
                .AsNoTracking()
                .Where(w => w.Id == wordId)
                .Select(w => new Word
                {
                    Id = w.Id,
                    TopicId = w.TopicId,
                    Character = w.Character,
                    Pinyin = w.Pinyin,
                    Meaning = w.Meaning,
                    AudioUrl = w.AudioUrl,
                    ImageUrl = w.ImageUrl,
                    ExampleSentence = w.ExampleSentence,
                    HSKLevel = w.HSKLevel,
                    Frequency = w.Frequency,
                    StrokeCount = w.StrokeCount,
                    CreatedAt = w.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (word != null)
            {
                var examples = await _context.WordExamples
                    .AsNoTracking()
                    .Where(e => e.WordId == wordId)
                    .OrderBy(e => e.SortOrder)
                    .Select(e => new WordExample
                    {
                        Id = e.Id,
                        WordId = e.WordId,
                        Character = e.Character,
                        Pinyin = e.Pinyin,
                        Meaning = e.Meaning,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .ToListAsync();
                
                word.WordExamples = examples;
            }

            return word;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyRepository] ❌ Lỗi khi lấy Word theo Id {wordId}: {ex.Message}");
            throw new Exception($"Lỗi khi lấy Word theo Id: {ex.Message}", ex);
        }
    }

    public async Task<Word> AddWordAsync(Word word)
    {
        try
        {
            Console.WriteLine($"[VocabularyRepository] Bắt đầu lưu từ mới: Character='{word.Character}', Pinyin='{word.Pinyin}', Meaning='{word.Meaning}'");

            // Validate và truncate nếu cần
            var character = (word.Character ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(character))
            {
                throw new ArgumentException("Character không được để trống");
            }
            if (character.Length > 50)
            {
                character = character.Substring(0, 50);
                Console.WriteLine($"[VocabularyRepository] ⚠️ Character bị cắt xuống 50 ký tự: '{character}'");
            }

            var pinyin = (word.Pinyin ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(pinyin))
            {
                throw new ArgumentException("Pinyin không được để trống");
            }
            if (pinyin.Length > 100)
            {
                pinyin = pinyin.Substring(0, 100);
                Console.WriteLine($"[VocabularyRepository] ⚠️ Pinyin bị cắt xuống 100 ký tự: '{pinyin}'");
            }

            var meaning = (word.Meaning ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(meaning))
            {
                throw new ArgumentException("Meaning không được để trống");
            }
            if (meaning.Length > 500)
            {
                meaning = meaning.Substring(0, 500);
                Console.WriteLine($"[VocabularyRepository] ⚠️ Meaning bị cắt xuống 500 ký tự: '{meaning}'");
            }

            var exampleSentence = word.ExampleSentence;
            if (!string.IsNullOrEmpty(exampleSentence) && exampleSentence.Length > 500)
            {
                exampleSentence = exampleSentence.Substring(0, 500);
                Console.WriteLine($"[VocabularyRepository] ⚠️ ExampleSentence bị cắt xuống 500 ký tự");
            }

            // KIỂM TRA RACE CONDITION: Có thể từ đã được tạo bởi request khác
            var existingWord = await _context.Words
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Character == character);
            
            if (existingWord != null)
            {
                Console.WriteLine($"[VocabularyRepository] ⚠️ Từ '{character}' đã tồn tại (race condition), trả về existing word với Id={existingWord.Id}");
                return existingWord;
            }

            // Tạo Word mới để tránh tracking issues
            var newWord = new Word
            {
                Character = character,
                Pinyin = pinyin,
                Meaning = meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = exampleSentence,
                HSKLevel = word.HSKLevel,
                Frequency = word.Frequency,
                StrokeCount = word.StrokeCount,
                TopicId = word.TopicId,
                CreatedAt = word.CreatedAt != default ? word.CreatedAt : DateTime.UtcNow
            };

            // Lưu Word (không lưu WordExamples ở đây)
            _context.Words.Add(newWord);
            await _context.SaveChangesAsync();
            Console.WriteLine($"[VocabularyRepository] ✅ Đã lưu Word với Id={newWord.Id}");

            // Reload để có đầy đủ thông tin
            var savedWord = await _context.Words
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Id == newWord.Id);

            return savedWord ?? newWord;
        }
        catch (DbUpdateException dbEx)
        {
            Console.WriteLine($"[VocabularyRepository] ❌ Lỗi database khi thêm từ mới: {dbEx.Message}");
            if (dbEx.InnerException != null)
            {
                Console.WriteLine($"[VocabularyRepository] InnerException: {dbEx.InnerException.Message}");
            }
            
            // Nếu lỗi duplicate, thử lấy lại từ database (race condition)
            if (dbEx.InnerException?.Message?.Contains("duplicate") == true || 
                dbEx.InnerException?.Message?.Contains("UNIQUE") == true)
            {
                Console.WriteLine($"[VocabularyRepository] ⚠️ Detect duplicate error, thử lấy lại từ database");
                var character = (word.Character ?? string.Empty).Trim();
                var existingWord = await _context.Words
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.Character == character);
                
                if (existingWord != null)
                {
                    Console.WriteLine($"[VocabularyRepository] ✅ Tìm thấy existing word sau duplicate error, Id={existingWord.Id}");
                    return existingWord;
                }
            }
            
            throw new Exception($"Lỗi khi thêm từ mới: {dbEx.Message}", dbEx);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyRepository] ❌ Lỗi khi thêm từ mới: {ex.Message}");
            Console.WriteLine($"[VocabularyRepository] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[VocabularyRepository] InnerException: {ex.InnerException.Message}");
                Console.WriteLine($"[VocabularyRepository] InnerStackTrace: {ex.InnerException.StackTrace}");
            }
            throw new Exception($"Lỗi khi thêm từ mới: {ex.Message}", ex);
        }
    }

    public async Task AddWordExamplesAsync(int wordId, List<WordExampleDto> examples)
    {
        try
        {
            if (examples == null || !examples.Any())
            {
                Console.WriteLine($"[VocabularyRepository] Không có WordExamples để lưu cho WordId={wordId}");
                return;
            }

            Console.WriteLine($"[VocabularyRepository] Bắt đầu lưu {examples.Count} WordExamples cho WordId={wordId}");

            foreach (var exampleDto in examples)
            {
                var example = new WordExample
                {
                    WordId = wordId,
                    Character = exampleDto.Character ?? string.Empty,
                    Pinyin = exampleDto.Pinyin ?? string.Empty,
                    Meaning = exampleDto.Meaning ?? string.Empty,
                    SortOrder = exampleDto.SortOrder > 0 ? exampleDto.SortOrder : examples.IndexOf(exampleDto) + 1
                };

                Console.WriteLine($"[VocabularyRepository] Lưu WordExample: Character='{example.Character}', Pinyin='{example.Pinyin}', Meaning='{example.Meaning}', SortOrder={example.SortOrder}");
                _context.WordExamples.Add(example);
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"[VocabularyRepository] Đã lưu {examples.Count} WordExamples thành công cho WordId={wordId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyRepository] ❌ Lỗi khi thêm WordExamples cho WordId={wordId}: {ex.Message}");
            Console.WriteLine($"[VocabularyRepository] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[VocabularyRepository] InnerException: {ex.InnerException.Message}");
                Console.WriteLine($"[VocabularyRepository] InnerStackTrace: {ex.InnerException.StackTrace}");
            }
            throw new Exception($"Lỗi khi thêm WordExamples: {ex.Message}", ex);
        }
    }

    public async Task<List<int>> GetWordIdsByTopicIdAsync(int topicId)
    {
        return await _context.Words
            .Where(w => w.TopicId == topicId)
            .Select(w => w.Id)
            .ToListAsync();
    }
}

