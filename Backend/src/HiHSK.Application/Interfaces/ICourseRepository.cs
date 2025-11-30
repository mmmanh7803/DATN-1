using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface ICourseRepository
{
    Task<List<Course>> GetCoursesByHSKLevelAsync(int? hskLevel);
    Task<Course?> GetCourseByIdAsync(int id);
    Task<Course?> GetCourseWithLessonsAsync(int id);
    Task<bool> CourseExistsAsync(int id);
}











































