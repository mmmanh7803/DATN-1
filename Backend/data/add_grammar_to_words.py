"""
Script để thêm thông tin ngữ pháp (từ loại) cho từng từ vựng HSK1 chủ đề 1
"""

import json
import sys
import io

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Mapping từ vựng sang từ loại (Part of Speech)
# Dựa trên nghĩa và cách sử dụng trong tiếng Trung
GRAMMAR_MAPPING = {
    "不客气": {
        "partOfSpeech": "短语",
        "partOfSpeechVi": "Cụm từ",
        "partOfSpeechEn": "Phrase",
        "grammarNote": "Dùng để đáp lại lời cảm ơn, có nghĩa là 'không có gì'"
    },
    "对不起": {
        "partOfSpeech": "短语",
        "partOfSpeechVi": "Cụm từ",
        "partOfSpeechEn": "Phrase",
        "grammarNote": "Dùng để xin lỗi, có thể đứng một mình hoặc trước câu"
    },
    "好": {
        "partOfSpeech": "形容词",
        "partOfSpeechVi": "Tính từ",
        "partOfSpeechEn": "Adjective",
        "grammarNote": "Có thể làm vị ngữ hoặc định ngữ. Ví dụ: 很好 (rất tốt)"
    },
    "吗": {
        "partOfSpeech": "助词",
        "partOfSpeechVi": "Trợ từ",
        "partOfSpeechEn": "Particle",
        "grammarNote": "Đặt cuối câu để tạo câu hỏi có/không. Ví dụ: 你好吗？"
    },
    "没关系": {
        "partOfSpeech": "短语",
        "partOfSpeechVi": "Cụm từ",
        "partOfSpeechEn": "Phrase",
        "grammarNote": "Dùng để đáp lại lời xin lỗi, có nghĩa là 'không sao'"
    },
    "哪": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ nghi vấn, dùng để hỏi. Ví dụ: 哪个？(cái nào?)"
    },
    "哪儿": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ nghi vấn, dùng để hỏi địa điểm. Ví dụ: 你在哪儿？"
    },
    "那": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ chỉ định, chỉ vật ở xa. Ví dụ: 那是我的书"
    },
    "呢": {
        "partOfSpeech": "助词",
        "partOfSpeechVi": "Trợ từ",
        "partOfSpeechEn": "Particle",
        "grammarNote": "Đặt cuối câu để hỏi hoặc nhấn mạnh. Ví dụ: 你呢？(còn bạn thì sao?)"
    },
    "你": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ nhân xưng ngôi thứ hai số ít, chỉ người đối thoại"
    },
    "请": {
        "partOfSpeech": "动词",
        "partOfSpeechVi": "Động từ",
        "partOfSpeechEn": "Verb",
        "grammarNote": "Dùng để mời, yêu cầu lịch sự. Thường đứng đầu câu. Ví dụ: 请坐"
    },
    "是": {
        "partOfSpeech": "动词",
        "partOfSpeechVi": "Động từ",
        "partOfSpeechEn": "Verb",
        "grammarNote": "Động từ hệ từ, dùng để nối chủ ngữ và vị ngữ. Ví dụ: 我是学生"
    },
    "喂": {
        "partOfSpeech": "叹词",
        "partOfSpeechVi": "Thán từ",
        "partOfSpeechEn": "Interjection",
        "grammarNote": "Dùng để chào hỏi khi nghe điện thoại hoặc gọi ai đó"
    },
    "谢谢": {
        "partOfSpeech": "动词",
        "partOfSpeechVi": "Động từ",
        "partOfSpeechEn": "Verb",
        "grammarNote": "Động từ, dùng để cảm ơn. Có thể đứng một mình hoặc có tân ngữ"
    },
    "再见": {
        "partOfSpeech": "动词",
        "partOfSpeechVi": "Động từ",
        "partOfSpeechEn": "Verb",
        "grammarNote": "Động từ, dùng để chào tạm biệt. Có nghĩa là 'hẹn gặp lại'"
    },
    "怎么": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ nghi vấn, dùng để hỏi cách thức. Ví dụ: 怎么去？(đi như thế nào?)"
    },
    "怎么样": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ nghi vấn, dùng để hỏi tình trạng, tính chất. Ví dụ: 你怎么样？"
    },
    "这": {
        "partOfSpeech": "代词",
        "partOfSpeechVi": "Đại từ",
        "partOfSpeechEn": "Pronoun",
        "grammarNote": "Đại từ chỉ định, chỉ vật ở gần. Ví dụ: 这是我的书"
    }
}

def main():
    """
    Đọc file JSON, thêm thông tin ngữ pháp và lưu lại
    """
    input_file = "hsk1_topic1_with_images.json"
    output_file = "hsk1_topic1_with_images.json"
    
    # Đọc file hiện tại
    with open(input_file, "r", encoding="utf-8") as f:
        words = json.load(f)
    
    print(f"Đang thêm thông tin ngữ pháp cho {len(words)} từ vựng...")
    
    # Thêm thông tin ngữ pháp cho từng từ
    for word in words:
        character = word.get("character", "")
        
        if character in GRAMMAR_MAPPING:
            grammar_info = GRAMMAR_MAPPING[character]
            word["partOfSpeech"] = grammar_info["partOfSpeech"]
            word["partOfSpeechVi"] = grammar_info["partOfSpeechVi"]
            word["partOfSpeechEn"] = grammar_info["partOfSpeechEn"]
            word["grammarNote"] = grammar_info["grammarNote"]
            print(f"  ✓ {character}: {grammar_info['partOfSpeechVi']}")
        else:
            print(f"  ✗ {character}: Không tìm thấy thông tin ngữ pháp")
    
    # Lưu file đã cập nhật
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Đã cập nhật thông tin ngữ pháp vào file: {output_file}")

if __name__ == "__main__":
    main()

