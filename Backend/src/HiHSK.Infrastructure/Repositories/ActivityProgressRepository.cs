using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class ActivityProgressRepository : IActivityProgressRepository
{
    private readonly ApplicationDbContext _context;
    
    // Danh sách activities bắt buộc để hoàn thành topic
    // User phải hoàn thành TẤT CẢ các activities này để mở khóa topic tiếp theo
    private static readonly List<string> RequiredActivityIds = new()
    {
        "vocabulary",        
        "quick-memorize",    
        "pronunciation"      
    };

    public ActivityProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public List<string> GetRequiredActivityIds() => RequiredActivityIds;

    public async Task<List<UserActivityProgress>> GetUserActivityProgressByPartAsync(
        string userId, 
        int hskLevel, 
        int partNumber)
    {
        return await _context.UserActivityProgresses
            .Where(p => p.UserId == userId 
                && p.HskLevel == hskLevel 
                && p.PartNumber == partNumber)
            .ToListAsync();
    }

    public async Task<List<UserActivityProgress>> GetUserActivityProgressByTopicAsync(
        string userId, 
        int topicId)
    {
        return await _context.UserActivityProgresses
            .Where(p => p.UserId == userId && p.TopicId == topicId)
            .ToListAsync();
    }

    public async Task<UserActivityProgress> MarkActivityCompletedAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId,
        string activityId,
        int? score = null)
    {
        // Tìm xem đã có record chưa
        UserActivityProgress? existing = null;

        if (hskLevel.HasValue && partNumber.HasValue)
        {
            existing = await _context.UserActivityProgresses
                .FirstOrDefaultAsync(p => 
                    p.UserId == userId 
                    && p.HskLevel == hskLevel 
                    && p.PartNumber == partNumber 
                    && p.ActivityId == activityId);
        }
        else if (topicId.HasValue)
        {
            existing = await _context.UserActivityProgresses
                .FirstOrDefaultAsync(p => 
                    p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.ActivityId == activityId);
        }

        if (existing != null)
        {
            // Update existing
            existing.IsCompleted = true;
            existing.Score = score;
            existing.CompletedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        // Create new
        var newProgress = new UserActivityProgress
        {
            UserId = userId,
            HskLevel = hskLevel,
            PartNumber = partNumber,
            TopicId = topicId,
            ActivityId = activityId,
            IsCompleted = true,
            Score = score,
            CompletedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserActivityProgresses.Add(newProgress);
        await _context.SaveChangesAsync();
        return newProgress;
    }

    public async Task<bool> IsActivityCompletedAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId,
        string activityId)
    {
        if (hskLevel.HasValue && partNumber.HasValue)
        {
            return await _context.UserActivityProgresses
                .AnyAsync(p => 
                    p.UserId == userId 
                    && p.HskLevel == hskLevel 
                    && p.PartNumber == partNumber 
                    && p.ActivityId == activityId 
                    && p.IsCompleted);
        }
        else if (topicId.HasValue)
        {
            return await _context.UserActivityProgresses
                .AnyAsync(p => 
                    p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.ActivityId == activityId 
                    && p.IsCompleted);
        }

        return false;
    }

    public async Task<int> CountCompletedActivitiesAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId)
    {
        if (hskLevel.HasValue && partNumber.HasValue)
        {
            return await _context.UserActivityProgresses
                .CountAsync(p => 
                    p.UserId == userId 
                    && p.HskLevel == hskLevel 
                    && p.PartNumber == partNumber 
                    && p.IsCompleted);
        }
        else if (topicId.HasValue)
        {
            return await _context.UserActivityProgresses
                .CountAsync(p => 
                    p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.IsCompleted);
        }

        return 0;
    }

    public async Task<UserActivityProgress?> GetActivityProgressByIdAsync(int id)
    {
        return await _context.UserActivityProgresses.FindAsync(id);
    }

    public async Task<bool> CheckAndMarkVocabularyCompletedAsync(
        string userId,
        int hskLevel,
        int partNumber,
        List<int> wordIds)
    {
        if (wordIds == null || wordIds.Count == 0)
            return false;

        // Lấy progress của tất cả từ trong part
        var wordProgresses = await _context.UserWordProgresses
            .Where(p => p.UserId == userId && wordIds.Contains(p.WordId))
            .ToListAsync();

        // Kiểm tra xem tất cả từ đã được đánh dấu là "đã học" (Learning hoặc Mastered) chưa
        var allWordsLearned = wordIds.Count > 0 && 
            wordProgresses.Count == wordIds.Count && // Tất cả từ đều có progress
            wordProgresses.All(p => p.Status == "Learning" || p.Status == "Mastered");

        if (allWordsLearned)
        {
            // Tự động đánh dấu activity "vocabulary" là completed
            await MarkActivityCompletedAsync(
                userId,
                hskLevel,
                partNumber,
                null,
                "vocabulary",
                null);
            
            return true;
        }

        return false;
    }

    public async Task<bool> CheckAndMarkVocabularyCompletedByTopicAsync(
        string userId,
        int topicId,
        List<int> wordIds)
    {
        if (wordIds == null || wordIds.Count == 0)
            return false;

        // Lấy progress của tất cả từ trong topic
        var wordProgresses = await _context.UserWordProgresses
            .Where(p => p.UserId == userId && wordIds.Contains(p.WordId))
            .ToListAsync();

        // Kiểm tra xem tất cả từ đã được đánh dấu là "đã học" (Learning hoặc Mastered) chưa
        var allWordsLearned = wordIds.Count > 0 && 
            wordProgresses.Count == wordIds.Count && // Tất cả từ đều có progress
            wordProgresses.All(p => p.Status == "Learning" || p.Status == "Mastered");

        if (allWordsLearned)
        {
            // Tự động đánh dấu activity "vocabulary" là completed cho topic
            await MarkActivityCompletedAsync(
                userId,
                null,
                null,
                topicId,
                "vocabulary",
                null);
            
            return true;
        }

        return false;
    }
    
    public async Task<bool> IsTopicCompletedAsync(string userId, int topicId)
    {
        // Lấy tất cả activities đã hoàn thành của topic
        var completedActivities = await _context.UserActivityProgresses
            .Where(p => p.UserId == userId && p.TopicId == topicId && p.IsCompleted)
            .Select(p => p.ActivityId)
            .ToListAsync();
        
        // Kiểm tra xem tất cả required activities đã hoàn thành chưa
        return RequiredActivityIds.All(required => completedActivities.Contains(required));
    }
    
    public async Task<(bool unlocked, int? nextTopicId)> CheckAndUnlockNextTopicAsync(
        string userId, 
        int completedTopicId)
    {
        // Kiểm tra xem topic hiện tại đã hoàn thành chưa
        var isCurrentTopicCompleted = await IsTopicCompletedAsync(userId, completedTopicId);
        
        if (!isCurrentTopicCompleted)
        {
            return (false, null);
        }
        
        // Lấy thông tin topic hiện tại
        var currentTopic = await _context.LessonTopics
            .FirstOrDefaultAsync(t => t.Id == completedTopicId);
        
        if (currentTopic == null)
        {
            return (false, null);
        }
        
        // Tìm topic tiếp theo trong cùng HSK level
        var nextTopic = await _context.LessonTopics
            .Where(t => t.HSKLevel == currentTopic.HSKLevel 
                && t.TopicIndex == currentTopic.TopicIndex + 1 
                && t.IsActive)
            .FirstOrDefaultAsync();
        
        if (nextTopic == null)
        {
            // Không có topic tiếp theo (đã hoàn thành tất cả topics của level này)
            return (false, null);
        }
        
        // Topic đã được mở khóa rồi (kiểm tra global IsLocked)
        // Lưu ý: IsLocked trong LessonTopic là global, không phải per-user
        // Chúng ta sẽ sử dụng bảng riêng để track user-specific unlock
        
        return (true, nextTopic.Id);
    }
    
    public async Task<(bool canAccess, string reason)> CanAccessTopicAsync(string userId, int topicId)
    {
        var topic = await _context.LessonTopics
            .Include(t => t.PrerequisiteTopic)
            .FirstOrDefaultAsync(t => t.Id == topicId);
        
        if (topic == null)
        {
            return (false, "Topic không tồn tại");
        }
        
        // Topic đầu tiên (TopicIndex = 1 hoặc không có prerequisite) luôn mở khóa
        if (topic.TopicIndex == 1 || topic.PrerequisiteTopicId == null)
        {
            return (true, "Topic đầu tiên luôn mở khóa");
        }
        
        // Kiểm tra topic trước đó (prerequisite) đã hoàn thành chưa
        var prerequisiteTopicId = topic.PrerequisiteTopicId.Value;
        var isPrerequisiteCompleted = await IsTopicCompletedAsync(userId, prerequisiteTopicId);
        
        if (!isPrerequisiteCompleted)
        {
            var prerequisiteTopic = topic.PrerequisiteTopic;
            var prerequisiteTitle = prerequisiteTopic?.Title ?? $"Topic {prerequisiteTopicId}";
            
            // Lấy số activities đã hoàn thành của prerequisite topic
            var completedCount = await _context.UserActivityProgresses
                .CountAsync(p => p.UserId == userId 
                    && p.TopicId == prerequisiteTopicId 
                    && p.IsCompleted
                    && RequiredActivityIds.Contains(p.ActivityId));
            
            return (false, $"Bạn cần hoàn thành chủ đề \"{prerequisiteTitle}\" trước ({completedCount}/{RequiredActivityIds.Count} hoạt động)");
        }
        
        return (true, "Topic đã được mở khóa");
    }
}

