using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class UserProgressRepository : IUserProgressRepository
{
    private readonly ApplicationDbContext _context;

    public UserProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserLessonStatus?> GetUserLessonStatusAsync(string userId, int lessonId)
    {
        return await _context.UserLessonStatuses
            .FirstOrDefaultAsync(uls => uls.UserId == userId && uls.LessonId == lessonId);
    }

    public async Task<UserLessonStatus> CreateOrUpdateUserLessonStatusAsync(
        string userId, 
        int lessonId, 
        string status, 
        int progressPercentage)
    {
        var existingStatus = await GetUserLessonStatusAsync(userId, lessonId);

        if (existingStatus == null)
        {
            existingStatus = new UserLessonStatus
            {
                UserId = userId,
                LessonId = lessonId,
                Status = status,
                ProgressPercentage = progressPercentage,
                StartedAt = DateTime.UtcNow,
                LastAccessedAt = DateTime.UtcNow
            };

            if (status == "Completed")
            {
                existingStatus.CompletedAt = DateTime.UtcNow;
            }

            _context.UserLessonStatuses.Add(existingStatus);
        }
        else
        {
            existingStatus.Status = status;
            existingStatus.ProgressPercentage = progressPercentage;
            existingStatus.LastAccessedAt = DateTime.UtcNow;

            if (status == "Completed" && existingStatus.CompletedAt == null)
            {
                existingStatus.CompletedAt = DateTime.UtcNow;
            }

            if (existingStatus.StartedAt == null)
            {
                existingStatus.StartedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return existingStatus;
    }

    public async Task<UserLessonProgress> CreateUserLessonProgressAsync(UserLessonProgress progress)
    {
        progress.CompletedAt = DateTime.UtcNow;
        _context.UserLessonProgresses.Add(progress);
        await _context.SaveChangesAsync();
        return progress;
    }

    public async Task<UserCourseStatus?> GetUserCourseStatusAsync(string userId, int courseId)
    {
        return await _context.UserCourseStatuses
            .FirstOrDefaultAsync(ucs => ucs.UserId == userId && ucs.CourseId == courseId);
    }

    public async Task<UserCourseStatus> CreateOrUpdateUserCourseStatusAsync(
        string userId, 
        int courseId, 
        string status, 
        int progressPercentage)
    {
        var existingStatus = await GetUserCourseStatusAsync(userId, courseId);

        if (existingStatus == null)
        {
            existingStatus = new UserCourseStatus
            {
                UserId = userId,
                CourseId = courseId,
                Status = status,
                ProgressPercentage = progressPercentage,
                StartedAt = DateTime.UtcNow
            };

            if (status == "Completed")
            {
                existingStatus.CompletedAt = DateTime.UtcNow;
            }

            _context.UserCourseStatuses.Add(existingStatus);
        }
        else
        {
            existingStatus.Status = status;
            existingStatus.ProgressPercentage = progressPercentage;

            if (status == "Completed" && existingStatus.CompletedAt == null)
            {
                existingStatus.CompletedAt = DateTime.UtcNow;
            }

            if (existingStatus.StartedAt == null)
            {
                existingStatus.StartedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return existingStatus;
    }

    public async Task<int> GetCompletedLessonsCountAsync(string userId, int courseId)
    {
        return await _context.UserLessonStatuses
            .CountAsync(uls => uls.UserId == userId 
                && uls.Lesson!.CourseId == courseId 
                && uls.Status == "Completed");
    }

    public async Task<int> GetTotalLessonsCountAsync(int courseId)
    {
        return await _context.Lessons
            .CountAsync(l => l.CourseId == courseId && l.IsActive);
    }
}











































