# Hướng dẫn lấy nội dung câu hỏi và đáp án đúng

## Tình hình hiện tại

Đã có:
- ✅ 88 audio segments
- ✅ 37 images
- ✅ Cấu trúc exam cơ bản
- ✅ Mapping images với câu hỏi (dựa trên naming)

**Thiếu:**
- ❌ Nội dung câu hỏi (text)
- ❌ Đáp án đúng

## Các cách để lấy nội dung câu hỏi và đáp án

### Cách 1: Tìm file JSON/XML chứa exam data ⭐ (Khuyến nghị)

**Đã thử:**
- Các file phổ biến: `questions.json`, `exam.json`, `data.json`, etc.
- Các thư mục: `bo1/`, `bo2/`, thư mục cha

**Có thể thử thêm:**
```bash
# Thử các pattern khác
python find_exam_questions_data.py
```

**Hoặc thủ công:**
- Kiểm tra các thư mục khác trong `chinesetest.online`
- Tìm trong source code của trang web
- Kiểm tra các file backup hoặc archive

### Cách 2: Extract text từ images bằng OCR ⭐⭐

**Cài đặt:**
```bash
pip install pytesseract pillow
```

**Tải Tesseract OCR:**
- Windows: https://github.com/UB-Mannheim/tesseract/wiki
- Hoặc: https://github.com/tesseract-ocr/tesseract

**Sử dụng:**
```bash
python extract_text_from_images_ocr.py
```

**Lưu ý:**
- OCR có thể không chính xác 100%
- Cần cấu hình Tesseract với language pack tiếng Trung
- Một số images có thể không chứa text (chỉ hình ảnh)

### Cách 3: Tìm trong trang web hihsk.com

**Kiểm tra:**
1. Mở trang exam trong trình duyệt
2. Mở DevTools (F12) > Network tab
3. Tìm request chứa exam data
4. Copy Request URL và fetch bằng script

**Hoặc:**
- Kiểm tra source code của trang
- Tìm trong các file JavaScript
- Kiểm tra localStorage/sessionStorage

### Cách 4: Phân tích cấu trúc từ images

**Dựa trên naming convention:**
- `1.jpg` → Câu hỏi số 1
- `6a.jpg`, `6b.jpg`, `6c.jpg` → Câu hỏi 6 với 3 lựa chọn

**Đã tạo:**
- `hsk1bo1_questions_structure.json` - Cấu trúc câu hỏi

**Cần thêm:**
- Nội dung text (từ OCR hoặc manual)
- Đáp án đúng (từ file answers hoặc phân tích)

### Cách 5: Manual input

**Nếu không tìm được tự động:**
1. Mở từng image trong trình duyệt
2. Ghi lại nội dung câu hỏi và đáp án
3. Tạo file JSON thủ công

**Template:**
```json
{
  "questions": [
    {
      "question_number": 1,
      "question_text": "Nội dung câu hỏi",
      "options": {
        "A": "Lựa chọn A",
        "B": "Lựa chọn B",
        "C": "Lựa chọn C"
      },
      "correct_answer": "A",
      "image_url": "https://...",
      "audio_segment": 0
    }
  ]
}
```

### Cách 6: Sử dụng API (nếu có)

**Nếu tìm được API endpoint:**
1. Fetch dữ liệu từ API
2. Parse JSON response
3. Lưu vào file

**Script sẵn có:**
- `scrape_hsk_exam_final.py` - Thử các API endpoints

## Scripts đã tạo

1. **find_exam_questions_data.py** - Tìm file exam data
2. **extract_text_from_images_ocr.py** - Extract text từ images
3. **create_exam_structure.py** - Tạo cấu trúc exam
4. **hsk1bo1_questions_structure.json** - Cấu trúc câu hỏi đã tạo

## Kế hoạch hành động

### Bước 1: Thử OCR (Nếu có thể)
```bash
pip install pytesseract pillow
python extract_text_from_images_ocr.py
```

### Bước 2: Kiểm tra trang web hihsk.com
- Tìm API endpoint trong Network tab
- Hoặc tìm trong source code

### Bước 3: Manual input (Nếu cần)
- Mở images và ghi lại nội dung
- Tạo file JSON thủ công

### Bước 4: Tạo file exam data hoàn chỉnh
- Kết hợp: audio, images, text, answers
- Lưu vào file JSON để sử dụng

## Lưu ý

- OCR có thể không chính xác, cần kiểm tra lại
- Một số images có thể chỉ là hình ảnh, không có text
- Đáp án đúng có thể cần tìm từ file riêng hoặc manual
- Có thể cần kết hợp nhiều cách để có đủ dữ liệu

## Kết luận

Hiện tại đã có:
- ✅ Cấu trúc exam
- ✅ Audio và images
- ✅ Mapping cơ bản

Cần thêm:
- ❌ Nội dung text (từ OCR hoặc manual)
- ❌ Đáp án đúng (từ file hoặc manual)

**Khuyến nghị:** Thử OCR trước, nếu không được thì manual input.

