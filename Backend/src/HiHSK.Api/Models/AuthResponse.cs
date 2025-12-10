namespace HiHSK.Api.Models;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Expiration { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public List<string> Roles { get; set; } = new();
}

