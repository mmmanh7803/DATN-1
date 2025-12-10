# 📚 Hướng Dẫn Xử Lý Dữ Liệu Đề Thi HSK

## 🎯 Tổng Quan

Hệ thống hỗ trợ import đề thi HSK 2 kỹ năng (Nghe + Đọc) vào database thông qua API.

### Cấu Trúc Đề Thi HSK 2 Kỹ Năng

```
HSK Cấp 2 (70 câu - 55 phút)
├── Phần 1: Nghe (35 câu - 25 phút)
│   ├── Part 1: Nghe và chọn ảnh (câu 1-10)
│   ├── Part 2: Nghe câu và chọn ảnh (câu 11-20)
│   ├── Part 3: Nghe hội thoại (câu 21-30)
│   └── Part 4: Nghe đoạn văn (câu 31-35)
└── Phần 2: Đọc (35 câu - 30 phút)
    ├── Part 1: Ghép từ với hình ảnh (câu 36-40)
    ├── Part 2: Chọn từ điền vào chỗ trống (câu 41-50)
    ├── Part 3: Nối hai nửa câu (câu 51-60)
    └── Part 4: Đọc hiểu đoạn văn (câu 61-70)
```

## 📋 Các Bước Xử Lý

### Bước 1: Chuẩn Bị Dữ Liệu

#### 1.1. Tạo File JSON Theo Template

Sử dụng file `hsk_exam_template.json` làm mẫu:

```json
{
  "exam": {
    "title": "HSK 2 - Đề thi số 1",
    "examType": "HSK",
    "level": 2,
    "description": "Mô tả đề thi",
    "durationMinutes": 55,
    "totalQuestions": 70,
    "totalPoints": 100,
    "passingScore": 60
  },
  "sections": [...]
}
```

#### 1.2. Cấu Trúc Câu Hỏi

Mỗi câu hỏi cần có:

```json
{
  "questionOrder": 1,
  "questionType": "LISTENING" hoặc "READING",
  "questionText": "Nội dung câu hỏi",
  "audioUrl": "URL file audio (chỉ cho LISTENING)",
  "audioScript": "Transcript (optional)",
  "points": 1,
  "difficultyLevel": 2,
  "options": [
    {
      "optionLabel": "A",
      "optionText": "Đáp án A",
      "isCorrect": true,
      "explanation": "Giải thích (optional)"
    }
  ]
}
```

### Bước 2: Chạy Backend API

```powershell
cd Backend/src/HiHSK.Api
dotnet run
```

Đảm bảo API chạy tại: `http://localhost:5075`

### Bước 3: Tạo Tài Khoản Admin (Nếu Chưa Có)

```sql
-- Chạy SQL để tạo admin hoặc đăng ký qua API
INSERT INTO AspNetUsers (UserName, Email, EmailConfirmed, ...)
VALUES ('admin@hihsk.com', 'admin@hihsk.com', 1, ...);

INSERT INTO AspNetUserRoles (UserId, RoleId)
SELECT u.Id, r.Id
FROM AspNetUsers u, AspNetRoles r
WHERE u.Email = 'admin@hihsk.com' AND r.Name = 'Admin';
```

Hoặc đăng ký qua Frontend và gán role Admin trong database.

### Bước 4: Import Dữ Liệu

```powershell
cd Backend/data
python import_hsk_exam.py
```

Script sẽ:
1. ✅ Đăng nhập admin
2. ✅ Tạo ExamPaper
3. ✅ Tạo Questions với Options
4. ✅ Link Questions vào ExamPaper
5. ✅ Hiển thị tiến độ và kết quả

### Bước 5: Kiểm Tra Dữ Liệu

#### 5.1. Kiểm Tra Database

```sql
-- Xem đề thi đã tạo
SELECT * FROM ExamPapers;

-- Xem câu hỏi trong đề thi
SELECT ep.Title, epq.QuestionOrder, q.QuestionText
FROM ExamPapers ep
JOIN ExamPaperQuestions epq ON ep.Id = epq.ExamPaperId
JOIN Questions q ON epq.QuestionId = q.Id
WHERE ep.Id = 1
ORDER BY epq.QuestionOrder;

-- Xem options
SELECT q.QuestionText, qo.OptionLabel, qo.OptionText, qo.IsCorrect
FROM Questions q
JOIN QuestionOptions qo ON q.Id = qo.QuestionId
WHERE q.Id = 1;
```

#### 5.2. Test API

```bash
# Lấy danh sách đề thi HSK
curl http://localhost:5075/api/exampapers/by-type/HSK

# Lấy đề thi HSK cấp 2
curl http://localhost:5075/api/exampapers/hsk/level/2

# Lấy chi tiết đề thi
curl http://localhost:5075/api/exampapers/1
```

## 🎨 Tùy Chỉnh Template

### Tạo Đề Thi HSK 1

```json
{
  "exam": {
    "title": "HSK 1 - Đề thi số 1",
    "examType": "HSK",
    "level": 1,
    "durationMinutes": 40,
    "totalQuestions": 40,
    "totalPoints": 100,
    "passingScore": 60
  }
}
```

### Tạo Đề Thi THPT

```json
{
  "exam": {
    "title": "Đề thi THPT 2024",
    "examType": "THPT",
    "level": null,
    "durationMinutes": 60,
    "totalQuestions": 50,
    "totalPoints": 100,
    "passingScore": 50
  }
}
```

## 📊 Scoring & Analysis

Hệ thống tự động phân tích kết quả theo 2 kỹ năng:

```
ExamResultAnalysis
├── Listening (50 điểm)
│   ├── Correct Count
│   ├── Wrong Count
│   └── Strengths/Weaknesses
└── Reading (50 điểm)
    ├── Correct Count
    ├── Wrong Count
    └── Strengths/Weaknesses
```

## 🚀 Bulk Import

Import nhiều đề thi cùng lúc:

```python
# Tạo nhiều file: hsk2_exam_1.json, hsk2_exam_2.json, ...
# Chạy script với option 3
python import_hsk_exam.py
# Chọn 3: Import tất cả file
```

## 📝 Checklist Import Đề Thi

- [ ] Backend API đang chạy
- [ ] Tài khoản Admin tồn tại
- [ ] File JSON đúng format
- [ ] Audio files đã upload (nếu có)
- [ ] Câu hỏi có đủ 4 options (A, B, C, D)
- [ ] Mỗi câu có đúng 1 đáp án đúng
- [ ] QuestionOrder liên tục (1, 2, 3, ...)

## 🐛 Troubleshooting

### ❌ Lỗi: "Không thể đăng nhập"

**Nguyên nhân:**
- Backend chưa chạy
- Tài khoản admin không tồn tại
- Mật khẩu sai

**Giải pháp:**
```powershell
# 1. Check Backend
curl http://localhost:5075/api/test

# 2. Tạo admin (nếu chưa có)
# Đăng ký qua Frontend hoặc SQL

# 3. Cập nhật mật khẩu trong script
ADMIN_PASSWORD = "YourPassword"
```

### ❌ Lỗi: "Tạo câu hỏi thất bại"

**Nguyên nhân:**
- Options không đủ
- QuestionType không đúng
- Thiếu trường bắt buộc

**Giải pháp:**
- Kiểm tra file JSON có đầy đủ các trường
- QuestionType phải là: LISTENING hoặc READING
- Mỗi câu phải có ít nhất 2 options

### ❌ Lỗi: "File không tồn tại"

**Giải pháp:**
```powershell
# Kiểm tra đường dẫn
cd Backend/data
ls hsk_exam_template.json

# Hoặc dùng đường dẫn tuyệt đối
python import_hsk_exam.py
# Nhập: C:\Users\...\hsk_exam_template.json
```

## 📚 Tài Liệu Tham Khảo

### Cấu Trúc Đề Thi HSK Chính Thức

- HSK 1: 40 câu (20 Nghe + 20 Đọc) - 40 phút
- HSK 2: 60 câu (35 Nghe + 25 Đọc) - 55 phút
- HSK 3: 80 câu (40 Nghe + 30 Đọc + 10 Viết) - 90 phút

### API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/exampapers` | GET | Lấy tất cả đề thi |
| `/api/exampapers/by-type/{type}` | GET | Lấy theo loại (HSK/THPT) |
| `/api/exampapers/hsk/level/{level}` | GET | Lấy HSK theo cấp độ |
| `/api/exampapers/{id}` | GET | Chi tiết đề thi |
| `/api/exampapers/{id}/take` | GET | Lấy đề để làm bài |
| `/api/exampapers` | POST | Tạo đề mới (Admin) |
| `/api/exampapers/{id}` | PUT | Cập nhật (Admin) |
| `/api/exampapers/{id}` | DELETE | Xóa (Admin) |

## 🎉 Kết Quả Mong Đợi

Sau khi import thành công:

```
✅ ExamPaper được tạo với ID
✅ 70 Questions (35 Listening + 35 Reading)
✅ 280 QuestionOptions (70 câu × 4 options)
✅ 70 ExamPaperQuestions (link Questions vào Exam)
✅ Dữ liệu sẵn sàng cho Frontend
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs Backend
2. Kiểm tra file JSON format
3. Test API endpoints với Postman/curl
4. Xem database để verify dữ liệu

**Chúc bạn import thành công! 🚀**

