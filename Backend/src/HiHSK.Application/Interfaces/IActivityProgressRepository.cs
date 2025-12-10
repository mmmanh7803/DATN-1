using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface IActivityProgressRepository
{
    /// <summary>
    /// Lấy tiến độ activity của user cho một part cụ thể
    /// </summary>
    Task<List<UserActivityProgress>> GetUserActivityProgressByPartAsync(
        string userId, 
        int hskLevel, 
        int partNumber);
    
    /// <summary>
    /// Lấy tiến độ activity của user cho một topic cụ thể
    /// </summary>
    Task<List<UserActivityProgress>> GetUserActivityProgressByTopicAsync(
        string userId, 
        int topicId);
    
    /// <summary>
    /// Đánh dấu một activity đã hoàn thành
    /// </summary>
    Task<UserActivityProgress> MarkActivityCompletedAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId,
        string activityId,
        int? score = null);
    
    /// <summary>
    /// Kiểm tra xem một activity đã hoàn thành chưa
    /// </summary>
    Task<bool> IsActivityCompletedAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId,
        string activityId);
    
    /// <summary>
    /// Đếm số activities đã hoàn thành
    /// </summary>
    Task<int> CountCompletedActivitiesAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId);
    
    /// <summary>
    /// Lấy activity progress theo ID
    /// </summary>
    Task<UserActivityProgress?> GetActivityProgressByIdAsync(int id);
    
    /// <summary>
    /// Kiểm tra và tự động đánh dấu activity "vocabulary" nếu tất cả từ đã học
    /// </summary>
    Task<bool> CheckAndMarkVocabularyCompletedAsync(
        string userId,
        int hskLevel,
        int partNumber,
        List<int> wordIds);
    
    Task<bool> CheckAndMarkVocabularyCompletedByTopicAsync(
        string userId,
        int topicId,
        List<int> wordIds);
    
    /// <summary>
    /// Kiểm tra xem topic đã hoàn thành chưa (tất cả activities bắt buộc đã completed)
    /// </summary>
    Task<bool> IsTopicCompletedAsync(string userId, int topicId);
    
    /// <summary>
    /// Lấy danh sách activity IDs bắt buộc để hoàn thành topic
    /// </summary>
    List<string> GetRequiredActivityIds();
    
    /// <summary>
    /// Kiểm tra và mở khóa topic tiếp theo nếu topic hiện tại đã hoàn thành
    /// </summary>
    Task<(bool unlocked, int? nextTopicId)> CheckAndUnlockNextTopicAsync(string userId, int completedTopicId);
    
    /// <summary>
    /// Kiểm tra xem user có thể truy cập topic không
    /// </summary>
    Task<(bool canAccess, string reason)> CanAccessTopicAsync(string userId, int topicId);
}

