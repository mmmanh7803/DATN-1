using System.ComponentModel.DataAnnotations;

namespace HiHSK.Api.Models;

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}

