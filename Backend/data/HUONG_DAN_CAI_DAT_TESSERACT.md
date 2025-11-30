# Hướng dẫn cài đặt Tesseract OCR trên Windows

## Bước 1: Tải Tesseract OCR

**Link tải (Windows):**
- https://github.com/UB-Mannheim/tesseract/wiki
- Chọn phiên bản mới nhất (ví dụ: `tesseract-ocr-w64-setup-5.x.x.exe`)

**Hoặc:**
- https://github.com/tesseract-ocr/tesseract/releases
- Tìm file installer cho Windows

## Bước 2: Cài đặt

1. **Chạy file installer** (.exe)
2. **Chọn đường dẫn cài đặt:**
   - Mặc định: `C:\Program Files\Tesseract-OCR`
   - Hoặc chọn đường dẫn khác (ghi nhớ đường dẫn này)

3. **Quan trọng:** Trong quá trình cài đặt, chọn cài đặt **language data**:
   - ✅ **Chinese (Simplified)** - `chi_sim`
   - ✅ **English** - `eng`
   - (Có thể chọn thêm các ngôn ngữ khác nếu cần)

4. **Hoàn tất cài đặt**

## Bước 3: Kiểm tra cài đặt

Mở **Command Prompt** hoặc **PowerShell** và chạy:

```bash
tesseract --version
```

Nếu hiển thị version (ví dụ: `tesseract 5.x.x`) thì đã cài đặt thành công!

## Bước 4: Cấu hình trong Python (Nếu cần)

Nếu Tesseract không được thêm vào PATH, cấu hình trong script:

```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Bước 5: Cài đặt language pack tiếng Trung (Nếu chưa có)

1. Tải file `chi_sim.traineddata` từ:
   - https://github.com/tesseract-ocr/tessdata
   - Hoặc: https://github.com/tesseract-ocr/tessdata/blob/main/chi_sim.traineddata

2. Copy file vào thư mục `tessdata`:
   - Thường ở: `C:\Program Files\Tesseract-OCR\tessdata`
   - Hoặc: `C:\Users\<YourUsername>\AppData\Local\Programs\Tesseract-OCR\tessdata`

## Bước 6: Test OCR

Sau khi cài đặt xong, chạy:

```bash
python test_ocr_simple.py
```

Hoặc:

```bash
python extract_text_from_images_ocr.py
```

## Lưu ý

- Nếu gặp lỗi "tesseract is not installed", kiểm tra lại đường dẫn
- Đảm bảo đã cài đặt language pack tiếng Trung (`chi_sim`)
- Có thể cần restart terminal sau khi cài đặt

## Nếu không muốn cài đặt Tesseract

Có thể sử dụng **Manual input** thay thế:
1. Mở file `hsk1bo1_images_viewer.html` trong trình duyệt
2. Xem từng image và ghi lại nội dung
3. Điền vào file `hsk1bo1_exam_data_template.json`

