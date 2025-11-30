# Hướng dẫn xử lý đề thi HSK H10901

## Tổng quan

Đã xử lý thành công 2 file PDF:
- **H10901.pdf** - Đề thi chính (answer sheet)
- **H10901 听力材料.pdf** - Tài liệu nghe (listening script)

## Kết quả

### Đề thi chính (H10901.pdf)
- **10 trang** - Answer sheet với số câu hỏi và đáp án A, B, C, D
- File text: `h10901_exam_text.txt`

### Tài liệu nghe (H10901 听力材料.pdf)
- **3 trang** - Script đầy đủ của đề thi nghe
- **20 câu hỏi** đã được parse thành công:
  - Phần 1: 5 câu (câu 1-5)
  - Phần 2: 5 câu (câu 6-10)
  - Phần 3: 5 câu (câu 11-15)
  - Phần 4: 5 câu (câu 16-20)

## Files đã tạo

### Text files
- `h10901_exam_text.json` - Text từ đề thi chính (JSON)
- `h10901_exam_text.txt` - Text từ đề thi chính (Plain text)
- `h10901_listening_text.json` - Text từ tài liệu nghe (JSON)
- `h10901_listening_text.txt` - Text từ tài liệu nghe (Plain text)

### Parsed data
- `h10901_questions_parsed.json` - 20 câu hỏi đã parse
- `h10901_exam_structure.json` - Cấu trúc đề thi hoàn chỉnh
- `h10901_summary.json` - Tổng kết

## Cấu trúc dữ liệu

### Câu hỏi (h10901_questions_parsed.json)

Mỗi câu hỏi có cấu trúc:

```json
{
  "number": 1,
  "part": 1,
  "type": "listening_simple",
  "script": "打电话"
}
```

**Các loại câu hỏi:**
- `listening_simple` - Phần 1: Nghe và chọn hình ảnh
- `listening_sentence` - Phần 2: Nghe câu đơn
- `listening_dialogue` - Phần 3: Nghe hội thoại
- `listening_question` - Phần 4: Nghe và trả lời câu hỏi

**Ví dụ câu hỏi phần 3 (hội thoại):**
```json
{
  "number": 11,
  "part": 3,
  "type": "listening_dialogue",
  "script": "男：你看见我的小猫了吗？女：在那儿，在椅子上。",
  "dialogue": {
    "male": "你看见我的小猫了吗？",
    "female": "在那儿，在椅子上。"
  }
}
```

**Ví dụ câu hỏi phần 4 (có câu hỏi):**
```json
{
  "number": 16,
  "part": 4,
  "type": "listening_question",
  "script": "我的电脑在他的桌子上。",
  "question": "那是谁的电脑？"
}
```

## Bước tiếp theo

### 1. Thêm đáp án đúng
Cần xem file `h10901_exam_text.txt` để lấy đáp án đúng từ answer sheet và thêm vào mỗi câu hỏi:

```json
{
  "number": 1,
  "correct_answer": "A",
  "options": {
    "A": "...",
    "B": "...",
    "C": "..."
  }
}
```

### 2. Thêm audio links
Nếu có file audio, thêm vào mỗi câu hỏi:

```json
{
  "audio_url": "https://.../h10901_q1.mp3",
  "audio_duration": 5.2
}
```

### 3. Thêm options (đáp án)
Cần xem đề thi gốc để lấy các đáp án A, B, C, D cho mỗi câu hỏi.

### 4. Import vào database
Sử dụng cấu trúc trong `h10901_exam_structure.json` để import vào database.

## Lưu ý

1. **CID encoding**: File PDF có một số ký tự CID (như `(cid:708)`) đã được xử lý và thay thế bằng ký tự tiếng Trung tương ứng.

2. **Answer sheet**: File `H10901.pdf` là answer sheet, không chứa nội dung câu hỏi đầy đủ, chỉ có số câu và đáp án.

3. **Listening script**: File `H10901 听力材料.pdf` chứa script đầy đủ, đã được parse thành công.

## Scripts sử dụng

1. `process_h10901_pdfs.py` - Extract text từ PDF
2. `parse_h10901_questions.py` - Parse câu hỏi từ text

## Chạy lại

Nếu cần xử lý lại:

```bash
cd Backend/data
python process_h10901_pdfs.py
python parse_h10901_questions.py
```

