using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface ICourseService
{
    Task<List<CourseListDto>> GetCoursesByHSKLevelAsync(int? hskLevel, string? userId);
    Task<CourseDto?> GetCourseByIdAsync(int id, string? userId);
    Task<int> CalculateCourseProgressAsync(int courseId, string userId);
}











































