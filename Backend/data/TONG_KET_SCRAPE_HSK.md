# Tổng kết: Cào dữ liệu HSK Exam

## Trạng thái hiện tại

✅ **Đã thành công:**
- Lấy được token authentication
- Fetch được HTML trang exam từ URL: `https://hihsk.com/exam/hsk1/test/343?isListen=true&isRead=true`
- Extract được Nuxt.js data structure
- Lưu HTML và JSON data vào file

❌ **Chưa thành công:**
- Không tìm thấy API endpoint để lấy câu hỏi exam
- Tất cả các endpoint thử đều trả về 404
- Trang hiển thị lỗi "Không thể tải dữ liệu đề thi"

## Các file đã tạo

1. **quick_scrape_hsk.py** - Script chính để fetch HTML với cookies
2. **fetch_exam_questions_api.py** - Script tìm API endpoint lấy câu hỏi
3. **find_and_fetch_exam_api.py** - Script thử nhiều API endpoints
4. **hsk_exam_343.html** - HTML trang exam đã fetch
5. **hsk_exam_343_data.json** - JSON data từ Nuxt.js

## Vấn đề

Dữ liệu câu hỏi exam **không có trong HTML ban đầu**, mà được load qua **JavaScript/AJAX** sau khi trang load. Cần tìm API endpoint thực tế từ Network tab trong DevTools.

## Cách tìm API endpoint thực tế

### Bước 1: Mở trang exam
1. Đăng nhập vào https://hihsk.com
2. Mở: https://hihsk.com/exam/hsk1/test/343?isListen=true&isRead=true
3. Đợi trang load hoàn toàn (kể cả khi có lỗi)

### Bước 2: Mở DevTools Network tab
1. Mở DevTools (F12)
2. Vào tab **Network**
3. **Quan trọng**: Click icon 🚫 để xóa các request cũ
4. Reload trang (F5) hoặc đợi trang tự load

### Bước 3: Tìm API request
Trong Network tab, lọc và tìm:
- **Filter**: Chọn `XHR` hoặc `Fetch` hoặc `JS`
- **Tìm request có**:
  - Name chứa: `exam`, `test`, `343`, `question`, `hsk1`
  - Status: `200` (thành công) hoặc `4xx/5xx` (lỗi nhưng vẫn có URL)

### Bước 4: Copy thông tin API
Click vào request tìm được:

**Tab Headers:**
- **Request URL**: Copy URL này (ví dụ: `https://api.hihsk.com/api/...`)
- **Request Method**: GET hoặc POST
- **Request Headers**: Copy các headers quan trọng:
  - `Authorization` (nếu có)
  - `Content-Type`
  - `X-Requested-With`
  - Các headers khác

**Tab Payload/Query String Parameters:**
- Copy các parameters nếu có

**Tab Response:**
- Xem cấu trúc dữ liệu trả về

### Bước 5: Cập nhật script
Sau khi có thông tin, cập nhật `fetch_exam_questions_api.py`:

```python
# Thêm endpoint mới
endpoints = [
    "https://api.hihsk.com/api/...",  # URL bạn tìm được
]

# Thêm headers nếu cần
HEADERS = {
    'Authorization': 'Bearer ...',  # Nếu có
    'X-Requested-With': 'XMLHttpRequest',
    # ... các headers khác
}

# Nếu là POST, thêm payload
payload = {
    # ... parameters bạn tìm được
}
```

## Các pattern API có thể có

Dựa trên cấu trúc thông thường:
- `GET /api/exam/{test_id}`
- `GET /api/exam/{test_id}/questions`
- `GET /api/test/{test_id}/start`
- `POST /api/exam/{test_id}/questions` (với body)
- `GET /api/exam/hsk1/{test_id}?isListen=true&isRead=true`

## Lưu ý quan trọng

1. **Token có thể hết hạn**: Token JWT thường có thời hạn, nếu không hoạt động, cần lấy token mới
2. **API có thể cần POST**: Một số API cần POST request với body thay vì GET
3. **CORS/Headers**: API có thể yêu cầu headers đặc biệt
4. **Rate limiting**: Tránh gọi API quá nhiều lần

## Scripts sẵn có

Sau khi tìm được API endpoint, bạn có thể:
1. Cập nhật `fetch_exam_questions_api.py` với endpoint mới
2. Hoặc tạo script mới dựa trên thông tin tìm được

## Kết luận

Hiện tại đã có:
- ✅ Token authentication
- ✅ HTML trang exam
- ✅ Scripts để fetch và parse

Cần thêm:
- ❌ API endpoint thực tế để lấy câu hỏi
- ❌ Cấu trúc dữ liệu câu hỏi

**Bước tiếp theo**: Kiểm tra Network tab trong DevTools để tìm API endpoint thực tế.

