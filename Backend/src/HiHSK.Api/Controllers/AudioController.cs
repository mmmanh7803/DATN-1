using HiHSK.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiHSK.Api.Controllers;

/// <summary>
/// Controller để generate audio bằng Text-to-Speech
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AudioController : ControllerBase
{
    private readonly TTSService _ttsService;
    private readonly ILogger<AudioController> _logger;

    public AudioController(TTSService ttsService, ILogger<AudioController> logger)
    {
        _ttsService = ttsService;
        _logger = logger;
    }

    /// <summary>
    /// Proxy audio từ Google TTS để tránh lỗi CORS
    /// Có caching để tối ưu performance
    /// </summary>
    /// <param name="text">Text cần phát âm (chữ Hán)</param>
    /// <param name="lang">Ngôn ngữ (mặc định: zh-CN)</param>
    /// <returns>Audio stream</returns>
    [HttpGet("proxy")]
    [AllowAnonymous]
    public async Task<IActionResult> ProxyAudio([FromQuery] string text, [FromQuery] string lang = "zh-CN")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            _logger.LogWarning("ProxyAudio được gọi với text rỗng");
            return BadRequest(new { message = "Text không được để trống" });
        }

        try
        {
            _logger.LogInformation("ProxyAudio request: text={Text}, lang={Lang}", text, lang);

            var (audioStream, contentType) = await _ttsService.GetAudioStreamAsync(text, lang);

            if (audioStream == null || audioStream.Length == 0)
            {
                _logger.LogError("Không thể lấy audio cho text: {Text}, lang: {Lang}", text, lang);
                return StatusCode(500, new { message = "Không thể tải audio từ Google TTS" });
            }

            // Set CORS headers
            Response.Headers.Add("Access-Control-Allow-Origin", "*");
            Response.Headers.Add("Access-Control-Allow-Methods", "GET");
            Response.Headers.Add("Cache-Control", "public, max-age=43200"); // Cache 12 giờ (giống với memory cache)

            _logger.LogInformation("Trả về audio thành công: size={Size} bytes, text={Text}", audioStream.Length, text);

            // Trả về FileStreamResult với "audio/mpeg"
            return new FileStreamResult(audioStream, "audio/mpeg");
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Timeout khi lấy audio cho text: {Text}", text);
            return StatusCode(408, new { message = "Request timeout", error = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error khi lấy audio cho text: {Text}", text);
            return StatusCode(502, new { message = "Lỗi khi kết nối đến Google TTS", error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi lấy audio cho text: {Text}", text);
            return StatusCode(500, new { message = "Lỗi khi tải audio", error = ex.Message });
        }
    }


    [HttpGet("tts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTTS([FromQuery] string text, [FromQuery] string lang = "zh-CN")
    {
        // Redirect đến proxy endpoint
        return await ProxyAudio(text, lang);
    }
}

