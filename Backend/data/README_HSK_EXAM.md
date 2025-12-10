# 📚 HƯỚNG DẪN NHANH: XỬ LÝ DỮ LIỆU ĐỀ THI HSK

## ⚡ Quick Start (10 phút)

### Bước 1: Chạy Backend
```powershell
cd Backend/src/HiHSK.Api
dotnet run
```
✅ API chạy tại: `http://localhost:5075`

### Bước 2: Đảm Bảo Có Tài Khoản Admin
- Email: `admin@hihsk.com`
- Password: `Admin@123`

Nếu chưa có, đăng ký qua Frontend và thêm role Admin trong database.

### Bước 3: Import Đề Thi
```powershell
cd Backend/data
python import_hsk_exam.py
```
Chọn option `1` để import đề mẫu.

### Bước 4: Kiểm Tra
```powershell
# Test API
curl http://localhost:5075/api/exampapers/hsk/level/2
```

## 📁 Files Quan Trọng

| File | Mục đích |
|------|----------|
| `ExamPapersController.cs` | API quản lý đề thi |
| `hsk_exam_template.json` | Template cấu trúc đề thi |
| `import_hsk_exam.py` | Script import dữ liệu |
| `HSK_EXAM_IMPORT_GUIDE.md` | Hướng dẫn chi tiết |

## 🎯 Cấu Trúc Database

```
ExamPapers (Đề thi)
├── Id, Title, ExamType, Level
├── DurationMinutes, TotalQuestions
└── TotalPoints, PassingScore

ExamPaperQuestions (Link câu hỏi vào đề)
├── ExamPaperId
├── QuestionId
└── QuestionOrder

Questions (Câu hỏi)
├── Id, QuestionText, QuestionType
├── AudioUrl (cho Listening)
└── Points, DifficultyLevel

QuestionOptions (Đáp án)
├── QuestionId
├── OptionLabel (A/B/C/D)
├── OptionText
└── IsCorrect
```

## 🔧 API Endpoints

### Public APIs
```
GET  /api/exampapers                    - Tất cả đề thi
GET  /api/exampapers/by-type/HSK        - Đề thi HSK
GET  /api/exampapers/hsk/level/2        - Đề HSK cấp 2
GET  /api/exampapers/{id}               - Chi tiết đề thi
GET  /api/exampapers/{id}/take          - Lấy đề để làm (cần login)
```

### Admin APIs (Cần Bearer Token)
```
POST   /api/exampapers                  - Tạo đề mới
PUT    /api/exampapers/{id}             - Cập nhật đề
DELETE /api/exampapers/{id}             - Xóa đề (soft delete)
POST   /api/exampapers/{id}/questions   - Thêm câu hỏi vào đề
DELETE /api/exampapers/{id}/questions/{qId} - Xóa câu khỏi đề
```

## 📊 Cấu Trúc Đề Thi HSK 2

```
HSK 2 (70 câu - 55 phút)
│
├── 📢 NGHE (35 câu - 25 phút)
│   ├── Part 1: Nghe từ, chọn ảnh (10 câu)
│   ├── Part 2: Nghe câu, chọn ảnh (10 câu)
│   ├── Part 3: Nghe hội thoại (10 câu)
│   └── Part 4: Nghe đoạn văn (5 câu)
│
└── 📖 ĐỌC (35 câu - 30 phút)
    ├── Part 1: Ghép từ với ảnh (5 câu)
    ├── Part 2: Điền từ vào chỗ trống (10 câu)
    ├── Part 3: Nối nửa câu (10 câu)
    └── Part 4: Đọc hiểu đoạn văn (10 câu)
```

## 🎨 Tạo Đề Thi Mới

### 1. Copy Template
```powershell
cp hsk_exam_template.json hsk2_exam_2.json
```

### 2. Chỉnh Sửa Nội Dung
- Thay đổi title: "HSK 2 - Đề thi số 2"
- Cập nhật các câu hỏi, đáp án
- Thêm audioUrl cho câu hỏi Listening

### 3. Import
```powershell
python import_hsk_exam.py
# Chọn option 2
# Nhập: hsk2_exam_2.json
```

## 📝 Ví Dụ: Cấu Trúc Câu Hỏi

### Câu Hỏi Listening
```json
{
  "questionOrder": 1,
  "questionType": "LISTENING",
  "questionText": "Nghe và chọn ảnh đúng",
  "audioUrl": "https://cdn.hihsk.com/audio/hsk2/q1.mp3",
  "audioScript": "打电话",
  "points": 1,
  "difficultyLevel": 2,
  "options": [
    {"optionLabel": "A", "optionText": "Hình A", "isCorrect": true},
    {"optionLabel": "B", "optionText": "Hình B", "isCorrect": false},
    {"optionLabel": "C", "optionText": "Hình C", "isCorrect": false},
    {"optionLabel": "D", "optionText": "Hình D", "isCorrect": false}
  ]
}
```

### Câu Hỏi Reading
```json
{
  "questionOrder": 41,
  "questionType": "READING",
  "questionText": "我___喜欢吃米饭。",
  "points": 1,
  "difficultyLevel": 2,
  "options": [
    {"optionLabel": "A", "optionText": "很", "isCorrect": true},
    {"optionLabel": "B", "optionText": "都", "isCorrect": false},
    {"optionLabel": "C", "optionText": "也", "isCorrect": false},
    {"optionLabel": "D", "optionText": "还", "isCorrect": false}
  ]
}
```

## 🚨 Lưu Ý Quan Trọng

### ✅ Đúng
- Mỗi câu có đúng 1 đáp án đúng (`isCorrect: true`)
- QuestionOrder liên tục: 1, 2, 3, ...
- QuestionType: "LISTENING" hoặc "READING"
- OptionLabel: A, B, C, D

### ❌ Sai
- Nhiều hơn 1 đáp án đúng
- QuestionOrder bị nhảy: 1, 3, 5, ...
- QuestionType: "listening" (phải viết hoa)
- Thiếu options hoặc < 2 options

## 🐛 Troubleshooting

### ❌ Import thất bại
```
Kiểm tra:
1. Backend đang chạy? (curl http://localhost:5075/api/test)
2. Admin có tồn tại? (kiểm tra database)
3. File JSON đúng format? (dùng JSON validator)
```

### ❌ "Không thể tạo câu hỏi"
```
Nguyên nhân:
- Admin controller chưa có endpoint create-quiz
- Options không đầy đủ
- QuestionType sai format

Giải pháp:
- Kiểm tra AdminController có CreateQuiz endpoint
- Đảm bảo mỗi câu có >= 2 options
- QuestionType viết hoa: LISTENING, READING
```

### ❌ "401 Unauthorized"
```
Nguyên nhân:
- Token hết hạn
- Admin không có quyền

Giải pháp:
- Chạy lại script để login mới
- Kiểm tra role Admin trong database
```

## 📊 Kiểm Tra Kết Quả

### Database Query
```sql
-- Xem đề thi
SELECT * FROM ExamPapers WHERE ExamType = 'HSK' AND Level = 2;

-- Xem số câu hỏi
SELECT ep.Title, COUNT(*) as QuestionCount
FROM ExamPapers ep
JOIN ExamPaperQuestions epq ON ep.Id = epq.ExamPaperId
GROUP BY ep.Id, ep.Title;

-- Xem câu hỏi Listening
SELECT q.QuestionText, q.AudioUrl
FROM Questions q
WHERE q.QuestionType = 'LISTENING'
LIMIT 5;
```

### API Test
```bash
# Lấy danh sách HSK 2
curl http://localhost:5075/api/exampapers/hsk/level/2

# Lấy chi tiết đề 1
curl http://localhost:5075/api/exampapers/1 | jq

# Count questions
curl http://localhost:5075/api/exampapers/1 | jq '.data.Questions | length'
```

## 🎯 Bước Tiếp Theo

Sau khi import xong dữ liệu đề thi:

### 1. Frontend - Tạo UI
- [ ] Trang danh sách đề thi
- [ ] Trang làm bài thi
- [ ] Trang xem kết quả
- [ ] Phân tích theo 2 kỹ năng

### 2. Backend - Tạo API
- [ ] Submit bài thi
- [ ] Chấm điểm tự động
- [ ] Phân tích kết quả (ExamResultAnalysis)
- [ ] Lưu lịch sử làm bài

### 3. Nâng Cao
- [ ] Upload audio files
- [ ] Image hosting cho options
- [ ] Real-time scoring
- [ ] Leaderboard

## 📞 Cần Hỗ Trợ?

Đọc thêm:
- `HSK_EXAM_IMPORT_GUIDE.md` - Hướng dẫn chi tiết
- `hsk_exam_template.json` - Template đầy đủ
- Backend logs - Xem lỗi chi tiết

**Chúc bạn thành công! 🚀**

