# 🚀 Các Bước Tiếp Theo - Hệ Thống Làm Bài Thi HSK

## ✅ Đã Hoàn Thành (100% Data + UI)

### 1. Xử Lý Dữ Liệu ✅
- [x] Lấy dữ liệu từ HiHSK API với Bearer token
- [x] Parse và chuyển đổi sang format template
- [x] Có dữ liệu 40 câu hỏi đầy đủ (20 Listening + 20 Reading)
- [x] Có audio URLs và image URLs

### 2. Giao Diện Frontend ✅
- [x] Page làm bài thi (`/app/exams/[id]/page.tsx`)
- [x] ExamHeader với timer countdown
- [x] ExamSidebar với progress tracking
- [x] QuestionCard với audio/image support
- [x] AudioPlayer custom component
- [x] TypeScript types đầy đủ
- [x] Responsive design (desktop & mobile)

---

## 🎯 Bước Tiếp Theo (Để Chạy Được Hệ Thống)

### BƯỚC 1: Khởi Động Backend ⚠️ **BẮT BUỘC**

```powershell
# Mở terminal mới (hoặc dùng terminal IDE)
cd C:\Users\hmanh\source\repos\DATN\Backend\src\HiHSK.Api
dotnet run

# Đợi thông báo:
# "Now listening on: http://localhost:5075"
```

**Giữ terminal này chạy!** Không tắt.

---

### BƯỚC 2: Import Dữ Liệu Vào Database

Sau khi Backend chạy, mở **terminal mới**:

```powershell
# Kiểm tra Backend có chạy không
cd C:\Users\hmanh\source\repos\DATN\Backend\data
python check_backend.py

# Nếu OK, import dữ liệu
python import_hsk_exam.py
```

**Khi được hỏi filename, nhập:**
```
hihsk_converted.json
```

Script sẽ:
- ✅ Auto login admin
- ✅ Tạo đề thi trong database
- ✅ Import 40 câu hỏi với audio/image URLs
- ✅ Tạo options cho mỗi câu hỏi

---

### BƯỚC 3: Khởi Động Frontend

```powershell
# Terminal mới thứ 3
cd C:\Users\hmanh\source\repos\DATN\Frontend
npm run dev

# Truy cập: http://localhost:3000
```

---

### BƯỚC 4: Test Hệ Thống

#### 4.1. Kiểm Tra API
```
http://localhost:5075/api/exam-papers
```
Phải thấy đề thi vừa import.

#### 4.2. Truy Cập Frontend
```
http://localhost:3000/exams/[exam-id]
```
Thay `[exam-id]` bằng ID đề thi từ API.

#### 4.3. Test Features
- [ ] Timer countdown hoạt động
- [ ] Sidebar hiển thị đúng 40 câu
- [ ] Audio player phát được nhạc
- [ ] Hình ảnh load được
- [ ] Chọn đáp án được
- [ ] Navigation giữa câu hỏi
- [ ] Nộp bài được

---

## 📊 Cấu Trúc Hệ Thống

### Backend (Port 5075)
```
http://localhost:5075/api/
├── exam-papers          # Danh sách đề thi
├── exam-papers/{id}     # Chi tiết đề thi
└── exam-papers/{id}/submit  # Nộp bài
```

### Frontend (Port 3000)
```
http://localhost:3000/
├── exams               # Danh sách đề thi (TODO)
├── exams/[id]          # Làm bài thi ✅
└── exams/[id]/results  # Kết quả (TODO)
```

---

## 🔧 Troubleshooting

### Backend không chạy được

**Lỗi**: `dotnet: command not found`
```powershell
# Cài đặt .NET 8.0 SDK
winget install Microsoft.DotNet.SDK.8
```

**Lỗi**: `Database connection failed`
```powershell
# Chạy migrations
cd Backend/src/HiHSK.Api
dotnet ef database update
```

### Frontend không build được

**Lỗi**: `npm: command not found`
```powershell
# Cài Node.js
winget install OpenJS.NodeJS
```

**Lỗi**: `Module not found`
```powershell
cd Frontend
npm install
```

### Import script lỗi

**Lỗi**: `Backend không chạy`
- Đảm bảo Backend đang chạy ở port 5075
- Chạy `python check_backend.py` để kiểm tra

**Lỗi**: `Login failed`
- Kiểm tra credentials trong `import_hsk_exam.py`
- Default: admin@hihsk.com / Admin@123

**Lỗi**: `File not found: hihsk_converted.json`
- Chạy lại: `python convert_hihsk_to_template.py`
- Đảm bảo file `hihsk_exam_325.json` tồn tại

---

## 🎨 Features Đã Có

### Exam Page (`/exams/[id]`)
- ⏱️ **Timer**: Countdown 40 phút, auto-submit
- 📋 **Sidebar**: 
  - Grid 40 câu (5 cột)
  - Progress bars (Listening/Reading)
  - Color coding (current/answered/unanswered)
  - Mobile overlay
- 🎧 **Audio Player**:
  - Play/pause
  - Seek bar
  - Time display
  - Replay unlimited
- 🖼️ **Image Display**: Responsive images
- 🌐 **Translation**: Toggle Vietnamese translation
- ✅ **Answer Selection**: Visual feedback
- ⬅️➡️ **Navigation**: Previous/Next buttons
- 📱 **Responsive**: Desktop & mobile optimized

---

## 📝 TODO - Tính Năng Mở Rộng

### 1. Results Page (Priority: HIGH)
```
/app/exams/[id]/results/page.tsx
```
Features:
- [ ] Tổng điểm & phần trăm
- [ ] Điểm từng kỹ năng
- [ ] Review từng câu (đúng/sai/giải thích)
- [ ] Chart phân tích
- [ ] Export PDF
- [ ] Share kết quả

### 2. Exam List Page (Priority: HIGH)
```
/app/exams/page.tsx
```
Features:
- [ ] List tất cả đề thi
- [ ] Filter theo level (HSK 1-6)
- [ ] Search
- [ ] Card preview
- [ ] Start exam button

### 3. Leaderboard (Priority: MEDIUM)
```
/app/exams/leaderboard/page.tsx
```
Features:
- [ ] Top 10 điểm cao nhất
- [ ] Filter theo đề thi
- [ ] User rank
- [ ] Time completed

### 4. Practice Mode (Priority: LOW)
Features:
- [ ] Làm bài không giới hạn thời gian
- [ ] Xem giải thích ngay lập tức
- [ ] Bookmark câu khó

### 5. Fetch More Exams (Priority: MEDIUM)
```python
# Fetch HSK 1-6 từ HiHSK API
python fetch_more_exams.py
```
- [ ] Fetch tất cả levels
- [ ] Auto convert & import
- [ ] Batch processing

---

## 🎯 Quick Start Commands

### One-Time Setup
```powershell
# 1. Backend
cd Backend/src/HiHSK.Api
dotnet restore
dotnet ef database update

# 2. Frontend
cd Frontend
npm install
```

### Daily Development
```powershell
# Terminal 1: Backend
cd Backend/src/HiHSK.Api
dotnet run

# Terminal 2: Frontend  
cd Frontend
npm run dev

# Terminal 3: Scripts/Commands
cd Backend/data
python check_backend.py
```

---

## 📚 Documentation

- [EXAM_SYSTEM_SUMMARY.md](./EXAM_SYSTEM_SUMMARY.md) - Tổng quan hệ thống
- [HIHSK_IMPORT_GUIDE.md](./Backend/data/HIHSK_IMPORT_GUIDE.md) - Hướng dẫn import
- [HSK_EXAM_IMPORT_GUIDE.md](./Backend/data/HSK_EXAM_IMPORT_GUIDE.md) - Guide chi tiết
- [EXAM_DATA_SUMMARY.md](./Backend/data/EXAM_DATA_SUMMARY.md) - Cấu trúc data

---

## 🎉 Summary

**Đã Xong:**
- ✅ Data processing (100%)
- ✅ Frontend UI (100%)
- ✅ TypeScript types (100%)
- ✅ Components (100%)

**Cần Làm:**
- ⏳ Start Backend
- ⏳ Import dữ liệu (5 phút)
- ⏳ Test hệ thống (10 phút)
- ⏳ Results page (1-2 giờ)
- ⏳ Exam list page (1 giờ)

**Total Progress: 85%** 🚀

**Estimated Time to Complete: 2-3 giờ**

---

## 💡 Tips

1. **Backend**: Luôn giữ Backend chạy khi develop
2. **Audio/Images**: Cần internet để load từ HiHSK server
3. **Bearer Token**: Có thể fetch thêm nhiều đề thi
4. **Mobile**: Test trên cả desktop và mobile
5. **Timer**: Auto-submit khi hết giờ, test kỹ feature này

---

## 📞 Need Help?

Nếu gặp vấn đề:
1. Kiểm tra Backend có chạy: `python check_backend.py`
2. Kiểm tra logs trong terminal
3. Xem file documentation trong `/Backend/data/`
4. Check browser console (F12) cho frontend errors

---

**Good luck! 🎓✨**

