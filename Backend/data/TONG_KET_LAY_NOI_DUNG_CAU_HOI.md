# Tổng kết: Cách lấy nội dung câu hỏi và đáp án đúng

## Tình hình hiện tại

### ✅ Đã có:
- 88 audio segments (file .ts)
- 37 images (file .jpg)
- Cấu trúc exam cơ bản
- Mapping images với câu hỏi
- Template để điền dữ liệu

### ❌ Còn thiếu:
- Nội dung câu hỏi (text)
- Đáp án đúng

## Các cách để lấy nội dung câu hỏi và đáp án

### Cách 1: Extract text từ images bằng OCR ⭐⭐⭐

**Ưu điểm:**
- Tự động hóa
- Nhanh nếu images có text rõ

**Nhược điểm:**
- Cần cài đặt Tesseract OCR
- Có thể không chính xác 100%
- Một số images có thể không có text

**Cài đặt:**
```bash
pip install pytesseract pillow
# Tải Tesseract OCR: https://github.com/tesseract-ocr/tesseract
```

**Sử dụng:**
```bash
python extract_text_from_images_ocr.py
```

**Kết quả:** File `hsk1bo1_extracted_text.json`

---

### Cách 2: Manual input từ images ⭐⭐ (Khuyến nghị nếu OCR không được)

**Ưu điểm:**
- Chính xác 100%
- Không cần cài đặt thêm
- Có thể kiểm tra ngay

**Nhược điểm:**
- Mất thời gian
- Cần xem từng image

**Cách làm:**
1. Mở file `hsk1bo1_images_viewer.html` trong trình duyệt
2. Xem từng image và ghi lại:
   - Nội dung câu hỏi
   - Nội dung các lựa chọn (A, B, C)
   - Đáp án đúng
3. Điền vào file `hsk1bo1_exam_data_template.json`

**Files hỗ trợ:**
- `hsk1bo1_images_viewer.html` - HTML viewer để xem tất cả images
- `hsk1bo1_images_list.json` - Danh sách tất cả images với URL
- `hsk1bo1_exam_data_template.json` - Template để điền dữ liệu

---

### Cách 3: Tìm file JSON/XML chứa exam data ⭐

**Đã thử:**
- Các file phổ biến: `questions.json`, `exam.json`, `data.json`
- Các thư mục: `bo1/`, `bo2/`, thư mục cha

**Có thể thử thêm:**
- Kiểm tra các thư mục khác
- Tìm trong source code của trang web
- Kiểm tra các file backup

**Script:**
```bash
python find_exam_questions_data.py
```

---

### Cách 4: Tìm trong trang web hihsk.com ⭐⭐

**Cách làm:**
1. Mở trang exam trong trình duyệt
2. Mở DevTools (F12) > Network tab
3. Tìm request chứa exam data
4. Copy Request URL và fetch bằng script

**Hoặc:**
- Kiểm tra source code của trang
- Tìm trong các file JavaScript
- Kiểm tra localStorage/sessionStorage

---

### Cách 5: Sử dụng API (nếu tìm được) ⭐

**Nếu tìm được API endpoint:**
1. Fetch dữ liệu từ API
2. Parse JSON response
3. Lưu vào file

**Script:**
```bash
python scrape_hsk_exam_final.py
```

---

## Files đã tạo

### Scripts:
1. **find_exam_questions_data.py** - Tìm file exam data
2. **extract_text_from_images_ocr.py** - Extract text từ images (OCR)
3. **create_exam_data_template.py** - Tạo template exam data
4. **view_images_for_manual_input.py** - Tạo HTML viewer cho images

### Data files:
1. **hsk1bo1_questions_structure.json** - Cấu trúc câu hỏi
2. **hsk1bo1_exam_data_template.json** - Template để điền dữ liệu
3. **hsk1bo1_images_list.json** - Danh sách images
4. **hsk1bo1_images_viewer.html** - HTML viewer để xem images

---

## Kế hoạch hành động (Khuyến nghị)

### Bước 1: Thử OCR (Nếu có thể)
```bash
pip install pytesseract pillow
python extract_text_from_images_ocr.py
```
→ Kiểm tra file `hsk1bo1_extracted_text.json`

### Bước 2: Nếu OCR không được → Manual input
1. Mở `hsk1bo1_images_viewer.html` trong trình duyệt
2. Xem từng image
3. Điền vào `hsk1bo1_exam_data_template.json`

### Bước 3: Kiểm tra trang web hihsk.com
- Tìm API endpoint trong Network tab
- Hoặc tìm trong source code

### Bước 4: Tạo file exam data hoàn chỉnh
- Kết hợp: audio, images, text, answers
- Lưu vào file JSON để sử dụng

---

## Template cấu trúc exam data

```json
{
  "exam_info": {
    "hsk_level": 1,
    "bo_number": 1,
    "exam_name": "HSK1 Bộ 1",
    "total_questions": 17
  },
  "questions": [
    {
      "question_number": 1,
      "question_text": "Nội dung câu hỏi",
      "question_text_pinyin": "Pinyin",
      "question_text_meaning": "Nghĩa tiếng Việt",
      "options": {
        "A": {
          "text": "Lựa chọn A",
          "text_pinyin": "Pinyin A",
          "text_meaning": "Nghĩa A"
        },
        "B": {...},
        "C": {...}
      },
      "correct_answer": "A",
      "explanation": "Giải thích",
      "image_url": "https://...",
      "audio_segment_index": 0
    }
  ]
}
```

---

## Lưu ý

- OCR có thể không chính xác, cần kiểm tra lại
- Một số images có thể chỉ là hình ảnh, không có text
- Đáp án đúng có thể cần tìm từ file riêng hoặc manual
- Có thể cần kết hợp nhiều cách để có đủ dữ liệu

---

## Kết luận

**Cách tốt nhất:** 
1. Thử OCR trước (nếu có thể cài đặt)
2. Nếu không được → Manual input từ HTML viewer
3. Kết hợp với tìm kiếm trong trang web hihsk.com

**Files quan trọng:**
- `hsk1bo1_images_viewer.html` - Xem tất cả images
- `hsk1bo1_exam_data_template.json` - Template để điền dữ liệu

