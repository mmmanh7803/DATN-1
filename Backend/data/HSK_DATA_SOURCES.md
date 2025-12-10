# 📚 Nguồn Dữ Liệu Đề Thi HSK Chất Lượng Cao

## 🎯 Tổng Quan

Dưới đây là các nguồn đề thi HSK có chất lượng tốt, dễ lấy dữ liệu.

---

## ⭐ Nguồn Khuyến Nghị

### 1. **HSKMock.com** - Đề Thi Thử Miễn Phí
**URL:** https://hskmock.com/

**Ưu điểm:**
- ✅ Đề thi theo chuẩn chính thức
- ✅ Có audio cho Listening
- ✅ Có đáp án chi tiết
- ✅ Miễn phí

**Cách lấy dữ liệu:**
```
1. Đăng ký tài khoản miễn phí
2. Làm bài thi thử
3. Dùng DevTools tìm API endpoints
4. Có thể có API trả về JSON
```

**API Pattern:**
```
https://hskmock.com/api/tests/{test_id}
https://hskmock.com/api/questions/{level}
```

---

### 2. **HSK Academy** - Tài Nguyên Mở
**URL:** https://www.hsk.academy/

**Ưu điểm:**
- ✅ Nhiều đề thi thực tế
- ✅ Có giải thích chi tiết
- ✅ Cộng đồng lớn

**Dữ liệu:**
- Có thể cào dữ liệu từ trang
- Hoặc liên hệ xin dữ liệu JSON

---

### 3. **GitHub - HSK Test Resources**

#### Repo 1: `hsknotes/hsk-data`
**URL:** https://github.com/hsknotes/hsk-data

**Nội dung:**
- JSON files với từ vựng HSK
- Có thể mở rộng thêm câu hỏi

#### Repo 2: `pepebecker/hsk-flashcards`
**URL:** https://github.com/pepebecker/hsk-flashcards

**Nội dung:**
- Flashcards dạng JSON
- Có Pinyin và nghĩa

#### Repo 3: Tự tạo từ PDF
- Download PDF đề thi chính thức
- Dùng OCR để extract
- Xem hướng dẫn bên dưới

---

### 4. **CCTV Chinese - Đề Thi Chính Thức**
**URL:** http://www.chinesetest.cn/

**Ưu điểm:**
- ✅ Trang chính thức của HSK
- ✅ Đề thi chuẩn 100%
- ✅ Có demo tests

**Nhược điểm:**
- ❌ Khó cào dữ liệu
- ❌ Có thể cần tài khoản

---

### 5. **Đề Thi PDF + OCR** ⭐⭐⭐ (Khuyến nghị)

**Nguồn PDF:**
- Google: "HSK 2 test PDF download"
- Archive.org: https://archive.org/
- Scribd: https://www.scribd.com/

**Quy trình:**
```
1. Download PDF đề thi HSK 2
2. Dùng OCR để extract text
3. Manual entry cho đáp án
4. Format thành JSON
```

**Tools OCR:**
- Adobe Acrobat DC
- Google Cloud Vision API
- Tesseract OCR
- Online: https://www.onlineocr.net/

---

## 🛠️ Hướng Dẫn Chi Tiết Từng Nguồn

### A. HSKMock.com - Tìm API

#### Bước 1: Đăng nhập và làm bài
```
1. Tạo tài khoản tại https://hskmock.com/
2. Chọn "HSK 2 Mock Test"
3. Bắt đầu làm bài
```

#### Bước 2: Tìm API trong DevTools
```
1. F12 → Network → XHR
2. Làm bài và xem requests
3. Tìm requests dạng:
   - /api/tests/...
   - /api/questions/...
   - /api/exam/...
```

#### Bước 3: Copy cURL và chuyển thành Python
```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_TOKEN',
    'User-Agent': 'Mozilla/5.0...'
}

response = requests.get(
    'https://hskmock.com/api/tests/hsk2',
    headers=headers
)

data = response.json()
```

---

### B. Sử Dụng PDF + OCR

#### Bước 1: Tìm PDF Đề Thi

**Google Search:**
```
"HSK 2 actual test" filetype:pdf
"HSK 二级真题" filetype:pdf
```

**Websites:**
- https://www.hskhsk.com/
- https://mandarinbean.com/
- https://www.digmandarin.com/

#### Bước 2: Extract Text Bằng OCR

**Python Script:**
```python
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# Convert PDF to images
pages = convert_from_path('hsk2_test.pdf', 300)

# OCR each page
for i, page in enumerate(pages):
    text = pytesseract.image_to_string(page, lang='chi_sim+eng')
    print(f"Page {i+1}:")
    print(text)
    print("\n" + "="*60 + "\n")
```

#### Bước 3: Parse Text Thành JSON

**Manual hoặc Script:**
- Đọc text đã extract
- Nhận dạng pattern câu hỏi
- Tạo JSON theo template

---

### C. GitHub Repositories

#### Clone và Xem Dữ Liệu
```bash
git clone https://github.com/hsknotes/hsk-data
cd hsk-data
ls *.json
```

#### Chuyển Đổi Sang Format Template
```python
import json

# Đọc dữ liệu từ GitHub repo
with open('hsk2_words.json', 'r') as f:
    words = json.load(f)

# Tạo câu hỏi từ từ vựng
questions = []
for i, word in enumerate(words, 1):
    question = {
        "questionOrder": i,
        "questionType": "READING",
        "questionText": f"'{word['character']}' nghĩa là gì?",
        "points": 1,
        "options": [
            {"optionLabel": "A", "optionText": word['meaning'], "isCorrect": True},
            {"optionLabel": "B", "optionText": "...", "isCorrect": False},
            {"optionLabel": "C", "optionText": "...", "isCorrect": False},
            {"optionLabel": "D", "optionText": "...", "isCorrect": False}
        ]
    }
    questions.append(question)
```

---

## 📊 So Sánh Các Nguồn

| Nguồn | Chất lượng | Độ khó lấy | Có Audio | Miễn phí |
|-------|-----------|-----------|----------|----------|
| **HSKMock.com** | ⭐⭐⭐⭐⭐ | Trung bình | ✅ | ✅ |
| **HSK Academy** | ⭐⭐⭐⭐ | Khó | ✅ | ✅ |
| **GitHub Repos** | ⭐⭐⭐ | Dễ | ❌ | ✅ |
| **PDF + OCR** | ⭐⭐⭐⭐⭐ | Trung bình | ❌ | ✅ |
| **CCTV Official** | ⭐⭐⭐⭐⭐ | Khó | ✅ | Giới hạn |

---

## 🎯 Khuyến Nghị Cụ Thể

### Cho Dự Án Của Bạn:

#### **Option A: HSKMock.com API** ⭐⭐⭐
```
1. Đăng ký tài khoản
2. Tìm API endpoints
3. Viết script Python gọi API
4. Import vào database
```

**Ước tính thời gian:** 2-3 giờ

#### **Option B: Download PDF + Manual Entry** ⭐⭐⭐⭐⭐
```
1. Tìm PDF đề thi chất lượng cao
2. Manual entry 70 câu vào template
3. Tự upload audio (nếu cần)
4. Import vào database
```

**Ước tính thời gian:** 4-6 giờ  
**Ưu điểm:** Chất lượng cao nhất, kiểm soát 100%

#### **Option C: GitHub + Tự Tạo Câu Hỏi** ⭐⭐⭐⭐
```
1. Clone repo từ vựng HSK 2
2. Dùng AI (ChatGPT) tạo câu hỏi từ từ vựng
3. Review và sửa lại
4. Import vào database
```

**Ước tính thời gian:** 3-4 giờ

---

## 🤖 Sử Dụng AI Để Tạo Đề Thi

### ChatGPT/Claude Prompt:

```
Tôi cần tạo đề thi HSK 2 với 70 câu hỏi (35 Listening + 35 Reading).

Yêu cầu:
- Theo chuẩn HSK 2 chính thức
- Từ vựng trong danh sách 300 từ HSK 1-2
- Format JSON như sau:
{
  "questionOrder": 1,
  "questionType": "LISTENING",
  "questionText": "...",
  "audioScript": "...",
  "points": 1,
  "options": [...]
}

Hãy tạo 10 câu đầu tiên.
```

---

## 🔗 Links Hữu Ích

### Đề Thi HSK Chính Thức
- http://www.chinesetest.cn/
- https://www.hsk.academy/
- https://hskmock.com/

### Từ Vựng HSK
- https://github.com/hsknotes/hsk-data
- https://www.hskhsk.com/word-lists.html

### Tools Hỗ Trợ
- OCR: https://www.onlineocr.net/
- Text-to-Speech: https://ttsmaker.com/
- JSON Editor: https://jsoneditoronline.org/

---

## 📝 Template Sẵn Sàng

Tôi đã tạo sẵn file `hsk_exam_template.json` với cấu trúc chuẩn.

Bạn chỉ cần:
1. Copy template
2. Điền nội dung câu hỏi
3. Import vào database

---

## 🎉 Bước Tiếp Theo

### 1. Thử HSKMock.com Trước
```powershell
# Tạo script mới
cd Backend/data
# Đăng nhập HSKMock.com và tìm API
```

### 2. Nếu Không Được → Dùng PDF
```
1. Download PDF đề thi HSK 2
2. Manual entry vào template
3. Import
```

### 3. Hoặc Dùng AI
```
1. Prompt ChatGPT tạo câu hỏi
2. Review và adjust
3. Import
```

---

**Bạn muốn thử nguồn nào trước? Tôi có thể hướng dẫn chi tiết! 🚀**

