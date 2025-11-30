using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/words")]
public class WordsController : ControllerBase
{
    private readonly IVocabularyRepository _vocabularyRepository;

    public WordsController(IVocabularyRepository vocabularyRepository)
    {
        _vocabularyRepository = vocabularyRepository;
    }

    /// <summary>
    /// Lấy thông tin chi tiết từ vựng theo slug (ID hoặc Character)
    /// </summary>
    /// <param name="slug">ID (số) hoặc Character (chữ Hán) của từ vựng</param>
    /// <returns>Thông tin chi tiết từ vựng</returns>
    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<WordDto>> GetWordBySlug(string slug)
    {
        try
        {
            Domain.Entities.Word? word = null;

            // Kiểm tra xem slug có phải là số (ID) không
            if (int.TryParse(slug, out int wordId))
            {
                // Tìm theo ID
                word = await _vocabularyRepository.GetWordByIdAsync(wordId);
            }
            else
            {
                // Tìm theo Character
                word = await _vocabularyRepository.GetWordByCharacterAsync(slug);
            }

            if (word == null)
            {
                return NotFound(new { message = $"Không tìm thấy từ vựng với slug: {slug}" });
            }

            // Map Word entity sang WordDto
            var wordDto = new WordDto
            {
                Id = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ImageUrl = word.ImageUrl,
                ExampleSentence = word.ExampleSentence,
                HSKLevel = word.HSKLevel,
                StrokeCount = word.StrokeCount,
                PartOfSpeech = word.PartOfSpeech,
                PartOfSpeechVi = word.PartOfSpeechVi,
                PartOfSpeechEn = word.PartOfSpeechEn,
                GrammarNote = word.GrammarNote,
                Structure = word.Structure,
                Examples = word.WordExamples?.Select(e => new WordExampleDto
                {
                    Id = e.Id,
                    Character = e.Character,
                    Pinyin = e.Pinyin,
                    Meaning = e.Meaning,
                    AudioUrl = e.AudioUrl,
                    SortOrder = e.SortOrder
                }).OrderBy(e => e.SortOrder).ToList() ?? new List<WordExampleDto>()
            };

            return Ok(wordDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thông tin từ vựng", error = ex.Message });
        }
    }
}

