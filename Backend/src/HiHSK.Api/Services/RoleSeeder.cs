using HiHSK.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HiHSK.Api.Services;

/// <summary>
/// Service để khởi tạo các roles và admin user mặc định
/// </summary>
public static class RoleSeeder
{
    public const string AdminRole = "Admin";
    public const string UserRole = "User";

    /// <summary>
    /// Seed các roles mặc định vào database
    /// </summary>
    public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        // Tạo role Admin nếu chưa tồn tại
        if (!await roleManager.RoleExistsAsync(AdminRole))
        {
            await roleManager.CreateAsync(new IdentityRole(AdminRole));
        }

        // Tạo role User nếu chưa tồn tại
        if (!await roleManager.RoleExistsAsync(UserRole))
        {
            await roleManager.CreateAsync(new IdentityRole(UserRole));
        }
    }

    /// <summary>
    /// Seed admin user mặc định
    /// </summary>
    public static async Task SeedAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration)
    {
        // Lấy thông tin admin từ configuration hoặc dùng giá trị mặc định
        var adminEmail = configuration["AdminSettings:Email"] ?? "admin@hihsk.com";
        var adminPassword = configuration["AdminSettings:Password"] ?? "Admin@123456";

        // Kiểm tra admin user đã tồn tại chưa
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            // Tạo admin user mới
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);

            if (result.Succeeded)
            {
                // Gán role Admin cho user
                await userManager.AddToRoleAsync(adminUser, AdminRole);
                Console.WriteLine($"[RoleSeeder] Đã tạo admin user: {adminEmail}");
            }
            else
            {
                Console.WriteLine($"[RoleSeeder] Lỗi khi tạo admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }
        else
        {
            // Reset password theo cấu hình (đảm bảo sync với appsettings)
            var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
            var resetResult = await userManager.ResetPasswordAsync(adminUser, token, adminPassword);
            if (resetResult.Succeeded)
            {
                Console.WriteLine($"[RoleSeeder] Đã reset password cho admin user: {adminEmail}");
            }
            else
            {
                Console.WriteLine($"[RoleSeeder] Lỗi reset password: {string.Join(", ", resetResult.Errors.Select(e => e.Description))}");
            }

            // Đảm bảo admin user có role Admin
            if (!await userManager.IsInRoleAsync(adminUser, AdminRole))
            {
                await userManager.AddToRoleAsync(adminUser, AdminRole);
                Console.WriteLine($"[RoleSeeder] Đã gán role Admin cho user: {adminEmail}");
            }
        }
    }

    /// <summary>
    /// Chạy tất cả các seed
    /// </summary>
    public static async Task SeedAllAsync(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration)
    {
        await SeedRolesAsync(roleManager);
        await SeedAdminUserAsync(userManager, configuration);
    }
}

