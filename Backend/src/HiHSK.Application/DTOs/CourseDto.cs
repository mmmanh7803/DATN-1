namespace HiHSK.Application.DTOs;

public class CourseDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Level { get; set; }
    public int? HSKLevel { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public int ProgressPercentage { get; set; }
    public bool IsEnrolled { get; set; }
}

public class CourseListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int? HSKLevel { get; set; }
    public int TotalLessons { get; set; }
    public int ProgressPercentage { get; set; }
}











































