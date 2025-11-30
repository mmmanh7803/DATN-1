using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Application.Services;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;
    private readonly IUserProgressRepository _userProgressRepository;

    public CourseService(
        ICourseRepository courseRepository,
        IUserProgressRepository userProgressRepository)
    {
        _courseRepository = courseRepository;
        _userProgressRepository = userProgressRepository;
    }

    public async Task<List<CourseListDto>> GetCoursesByHSKLevelAsync(int? hskLevel, string? userId)
    {
        var courses = await _courseRepository.GetCoursesByHSKLevelAsync(hskLevel);

        var result = new List<CourseListDto>();

        foreach (var course in courses)
        {
            var totalLessons = await _userProgressRepository.GetTotalLessonsCountAsync(course.Id);
            var progressPercentage = 0;

            if (userId != null)
            {
                progressPercentage = await CalculateCourseProgressAsync(course.Id, userId);
            }

            result.Add(new CourseListDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                ImageUrl = course.ImageUrl,
                HSKLevel = course.HSKLevel,
                TotalLessons = totalLessons,
                ProgressPercentage = progressPercentage
            });
        }

        return result;
    }

    public async Task<CourseDto?> GetCourseByIdAsync(int id, string? userId)
    {
        var course = await _courseRepository.GetCourseWithLessonsAsync(id);
        if (course == null)
            return null;

        var totalLessons = course.Lessons.Count;
        var completedLessons = 0;
        var progressPercentage = 0;
        var isEnrolled = false;

        if (userId != null)
        {
            completedLessons = await _userProgressRepository.GetCompletedLessonsCountAsync(userId, id);
            progressPercentage = await CalculateCourseProgressAsync(id, userId);
            
            var userCourseStatus = await _userProgressRepository.GetUserCourseStatusAsync(userId, id);
            isEnrolled = userCourseStatus != null;
        }

        return new CourseDto
        {
            Id = course.Id,
            CategoryId = course.CategoryId,
            CategoryName = course.Category.DisplayName,
            Title = course.Title,
            Description = course.Description,
            ImageUrl = course.ImageUrl,
            Level = course.Level,
            HSKLevel = course.HSKLevel,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessons,
            ProgressPercentage = progressPercentage,
            IsEnrolled = isEnrolled
        };
    }

    public async Task<int> CalculateCourseProgressAsync(int courseId, string userId)
    {
        var totalLessons = await _userProgressRepository.GetTotalLessonsCountAsync(courseId);
        if (totalLessons == 0)
            return 0;

        var completedLessons = await _userProgressRepository.GetCompletedLessonsCountAsync(userId, courseId);
        return (int)Math.Round((double)completedLessons / totalLessons * 100);
    }
}











































