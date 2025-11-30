using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class CourseRepository : ICourseRepository
{
    private readonly ApplicationDbContext _context;

    public CourseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> GetCoursesByHSKLevelAsync(int? hskLevel)
    {
        var query = _context.Courses
            .Include(c => c.Category)
            .Where(c => c.IsActive && c.Category.Name == "HSK Curriculum");

        if (hskLevel.HasValue)
        {
            query = query.Where(c => c.HSKLevel == hskLevel.Value);
        }

        return await query
            .OrderBy(c => c.HSKLevel)
            .ThenBy(c => c.SortOrder)
            .ToListAsync();
    }

    public async Task<Course?> GetCourseByIdAsync(int id)
    {
        return await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
    }

    public async Task<Course?> GetCourseWithLessonsAsync(int id)
    {
        return await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Lessons.Where(l => l.IsActive).OrderBy(l => l.LessonIndex))
            .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
    }

    public async Task<bool> CourseExistsAsync(int id)
    {
        return await _context.Courses
            .AnyAsync(c => c.Id == id && c.IsActive);
    }
}











































