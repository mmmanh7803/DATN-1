# 🚀 Hướng Dẫn Import Dữ Liệu Đề Thi HiHSK

## 📋 Tổng Quan

Hướng dẫn này giúp bạn import dữ liệu đề thi từ HiHSK API vào database của dự án.

## 🔄 Quy Trình

### Bước 1: Lấy Dữ Liệu Từ HiHSK API ✅

**Đã hoàn thành!** File `hihsk_exam_325.json` đã có dữ liệu đầy đủ.

```powershell
# File đã có sẵn với 3095 dòng dữ liệu
C:\Users\hmanh\source\repos\DATN\Backend\data\hihsk_exam_325.json
```

### Bước 2: Chuyển Đổi Sang Format Template ✅

**Đã hoàn thành!** Đã chạy script chuyển đổi thành công.

```powershell
# Script đã tạo file output
python convert_hihsk_to_template.py

# Output: hihsk_converted.json
# - Listening: 20 câu
# - Reading: 20 câu
# - Tổng: 40 câu
```

### Bước 3: Import Vào Database 🔜

Sử dụng script import sẵn có:

```powershell
# Di chuyển vào thư mục data
cd C:\Users\hmanh\source\repos\DATN\Backend\data

# Chạy script import
python import_hsk_exam.py

# Khi được hỏi, chọn file: hihsk_converted.json
```

## 📊 Cấu Trúc Dữ Liệu

### Thông Tin Đề Thi

```json
{
  "exam": {
    "title": "HSK 1 - Bài 5",
    "examType": "HSK",
    "level": 1,
    "description": "Đề thi HSK cấp 1 - 2 kỹ năng",
    "durationMinutes": 40,
    "totalQuestions": 40,
    "totalPoints": 40,
    "passingScore": 60
  }
}
```

### Cấu Trúc Câu Hỏi Listening

```json
{
  "questionOrder": 1,
  "questionType": "LISTENING",
  "questionText": "很冷",
  "audioUrl": "https://api.hihsk.com/storage/mp3/Xi96ckC6HMy61725982315.mp3",
  "imageUrl": "https://api.hihsk.com/storage/images/orw5CkkvoHxs1725982315.jpg",
  "translation": "Rất lạnh.",
  "options": [
    {
      "optionLabel": "Đúng",
      "optionText": "Đúng",
      "isCorrect": true
    },
    {
      "optionLabel": "Sai",
      "optionText": "Sai",
      "isCorrect": false
    }
  ]
}
```

### Cấu Trúc Câu Hỏi Reading

```json
{
  "questionOrder": 21,
  "questionType": "READING",
  "questionText": "看书",
  "imageUrl": "https://api.hihsk.com/storage/images/...",
  "translation": "Đọc sách",
  "options": [...]
}
```

## 🎯 Các Loại Câu Hỏi

### Part 1-4: Listening (20 câu)

| Part | Type | Mô Tả | Số Câu |
|------|------|-------|--------|
| 1 | 1 | Nghe và chọn Đúng/Sai với hình ảnh | 5 |
| 2 | 2 | Nghe và chọn Đúng/Sai | 5 |
| 3 | 3 | Nghe và ghép hình ảnh | 5 |
| 4 | 4 | Nghe và chọn đáp án | 5 |

### Part 5-8: Reading (20 câu)

| Part | Type | Mô Tả | Số Câu |
|------|------|-------|--------|
| 5 | 5 | Đọc và ghép từ với hình ảnh | 5 |
| 6 | 6 | Đọc và sắp xếp câu | 5 |
| 7 | 7 | Đọc và trả lời câu hỏi | 5 |
| 8 | 8 | Điền từ vào chỗ trống | 5 |

## 🔧 Troubleshooting

### Lỗi: Backend chưa chạy

```powershell
# Khởi động Backend
cd C:\Users\hmanh\source\repos\DATN\Backend\src\HiHSK.Api
dotnet run
```

### Lỗi: Database connection

Kiểm tra file `appsettings.json` - đảm bảo connection string đúng.

### Lỗi: Authentication

Script `import_hsk_exam.py` đã có auto-login với admin credentials.

## 📝 Ghi Chú

- ✅ Dữ liệu có đầy đủ audio URLs
- ✅ Dữ liệu có đầy đủ image URLs  
- ✅ Dữ liệu có translation tiếng Việt
- ✅ Dữ liệu có đáp án đúng
- ⚠️ Audio và images từ HiHSK server - cần internet để phát

## 🎉 Sau Khi Import

### 1. Kiểm Tra Dữ Liệu

Truy cập: `http://localhost:5000/api/exam-papers`

### 2. Test Frontend

```powershell
cd C:\Users\hmanh\source\repos\DATN\Frontend
npm run dev
```

Truy cập: `http://localhost:3000/exams/[id]`

### 3. Features

- ✅ Countdown timer 40 phút
- ✅ Sidebar danh sách câu hỏi
- ✅ Audio player cho Listening
- ✅ Hiển thị hình ảnh
- ✅ Dịch tiếng Việt (toggle)
- ✅ Navigation giữa các câu
- ✅ Theo dõi tiến độ
- ✅ Nộp bài và xem kết quả

## 🎨 Giao Diện

Giao diện được thiết kế dựa trên trang HiHSK gốc:
- Header: Timer, Back, Submit
- Sidebar: Danh sách câu hỏi (Listening/Reading)
- Main: Hiển thị câu hỏi với audio/image
- Responsive: Desktop & Mobile

## 🚀 Next Steps

1. **Import dữ liệu**: Chạy `import_hsk_exam.py`
2. **Test UI**: Truy cập `/exams/[id]` 
3. **Thêm đề thi**: Fetch thêm từ HiHSK API với Bearer token
4. **Tạo trang kết quả**: `/exams/[id]/results`
5. **Tạo leaderboard**: Bảng xếp hạng điểm số

## 📚 Tài Liệu Tham Khảo

- [HSK Exam Import Guide](./HSK_EXAM_IMPORT_GUIDE.md)
- [Exam Data Summary](./EXAM_DATA_SUMMARY.md)
- [API Documentation](../../Backend/src/HiHSK.Api/README.md)

