using System;
using System.Linq;
using Google.Apis.Auth;
using HiHSK.Api.Models;
using HiHSK.Api.Services;
using HiHSK.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtTokenService _jwtTokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtTokenService jwtTokenService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _configuration = configuration;
    }

    /// <summary>
    /// Đăng ký tài khoản mới
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Log để debug
        Console.WriteLine($"Register request received: Email={request?.Email}, Password length={request?.Password?.Length}");
        
        if (request == null)
        {
            return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = new[] { "Request body không được để trống" } });
        }

        // Kiểm tra và log ModelState errors
        if (!ModelState.IsValid)
        {
            var modelErrors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => $"{x.Key}: {e.ErrorMessage}"))
                .ToList();
            
            Console.WriteLine($"ModelState invalid. Errors: {string.Join(", ", modelErrors)}");
            
            return BadRequest(new { 
                message = "Dữ liệu không hợp lệ", 
                errors = modelErrors,
                fieldErrors = new
                {
                    email = modelErrors.Where(e => e.Contains("Email", StringComparison.OrdinalIgnoreCase)).ToList(),
                    password = modelErrors.Where(e => e.Contains("Password", StringComparison.OrdinalIgnoreCase) || e.Contains("Mật khẩu", StringComparison.OrdinalIgnoreCase)).ToList()
                }
            });
        }

        // Kiểm tra email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email đã được sử dụng" });
        }

        // Tạo user mới
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true // Có thể set false nếu cần xác thực email
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            var errorMessage = string.Join(". ", errors);
            
            Console.WriteLine($"User creation failed. Errors: {errorMessage}");
            
            // Phân loại lỗi theo field
            var passwordErrors = result.Errors
                .Where(e => e.Code.Contains("Password", StringComparison.OrdinalIgnoreCase) || 
                           e.Description.Contains("password", StringComparison.OrdinalIgnoreCase) || 
                           e.Description.Contains("mật khẩu", StringComparison.OrdinalIgnoreCase))
                .Select(e => e.Description)
                .ToList();
            
            var emailErrors = result.Errors
                .Where(e => e.Code.Contains("Email", StringComparison.OrdinalIgnoreCase) || 
                           e.Description.Contains("email", StringComparison.OrdinalIgnoreCase))
                .Select(e => e.Description)
                .ToList();
            
            return BadRequest(new { 
                message = errorMessage, 
                errors = errors,
                fieldErrors = new {
                    password = passwordErrors,
                    email = emailErrors
                }
            });
        }
        
        Console.WriteLine($"User created successfully: {user.Email}");

        // Tạo token và trả về
        var token = _jwtTokenService.GenerateToken(user);
        var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60");
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes).ToString("o");

        return Ok(new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName
            }
        });
    }

    /// <summary>
    /// Đăng nhập
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });
        }

        // Tìm user theo email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
        }

        // Kiểm tra password
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return Unauthorized(new { message = "Tài khoản đã bị khóa do đăng nhập sai nhiều lần" });
            }
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
        }

        // Tạo token và trả về
        var token = _jwtTokenService.GenerateToken(user);
        var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60");
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes).ToString("o");

        return Ok(new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName
            }
        });
    }

    /// <summary>
    /// Đăng nhập bằng Google
    /// </summary>
    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });
        }

        try
        {
            // Xác thực Google ID Token
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _configuration["GoogleAuth:ClientId"] }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

            if (payload == null)
            {
                return Unauthorized(new { message = "Token Google không hợp lệ" });
            }

            // Tìm hoặc tạo user với email từ Google
            var user = await _userManager.FindByEmailAsync(payload.Email);

            if (user == null)
            {
                // Tạo user mới nếu chưa tồn tại
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    EmailConfirmed = true // Google đã xác thực email
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    var errors = createResult.Errors.Select(e => e.Description).ToList();
                    return BadRequest(new { message = "Không thể tạo tài khoản", errors });
                }

                Console.WriteLine($"Created new user from Google: {user.Email}");
            }

            // Tạo JWT token
            var token = _jwtTokenService.GenerateToken(user);
            var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60");
            var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes).ToString("o");

            return Ok(new AuthResponse
            {
                Token = token,
                Expiration = expiration,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName
                }
            });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { message = "Token Google không hợp lệ hoặc đã hết hạn" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Google login error: {ex.Message}");
            return StatusCode(500, new { message = "Lỗi khi đăng nhập bằng Google", error = ex.Message });
        }
    }
}

