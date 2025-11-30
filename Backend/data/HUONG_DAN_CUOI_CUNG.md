# Hướng dẫn cuối cùng: Tìm API Endpoint HSK Exam

## Từ Console logs bạn gửi

Tôi thấy trong Console:
- `Fd 'exam'` - Code đang xử lý dữ liệu exam
- `Proxy(Array)[[Handler]]` với `Array(5)` - Có dữ liệu mảng được load
- `'exam'` - Log về exam

**Điều này cho thấy dữ liệu exam ĐÃ được load, nhưng cần tìm API request trong Network tab.**

## Cách tìm API request

### Bước 1: Mở đúng tab

1. **Đóng Console tab** (nếu đang mở)
2. **Mở Network tab** trong DevTools
3. **Quan trọng**: Click icon 🚫 (Clear) để xóa request cũ

### Bước 2: Lọc request

1. Ở thanh filter phía trên Network tab
2. Click dropdown và chọn **XHR** hoặc **Fetch**
3. Chỉ hiển thị các request AJAX/API

### Bước 3: Reload và tìm

1. **Reload trang** (F5)
2. **Đợi 2-3 giây** để các API request được gọi
3. **Scroll xuống** danh sách request
4. **Tìm request có:**
   - Domain: `api.hihsk.com` hoặc `hihsk.com/api`
   - Type: `xhr` hoặc `fetch`
   - Name chứa: `exam`, `test`, `343`, `question`

### Bước 4: Nếu không thấy request

Có thể API được gọi khi:
- **Click vào nút "Bắt đầu"** hoặc tương tác với trang
- **Scroll trang**
- **Sau khi đợi một khoảng thời gian**

**Thử:**
1. Click vào các nút trên trang exam
2. Scroll trang
3. Đợi thêm 5-10 giây
4. Xem lại Network tab

### Bước 5: Copy Request URL

Khi tìm thấy request đúng:
1. **Click vào request**
2. Xem tab **Headers**
3. Tìm **Request URL** (dòng đầu tiên)
4. **Copy URL đầy đủ** và gửi cho tôi

## Ví dụ Request đúng

```
Name: exam-hsk1-test-343
Type: xhr
Status: 200 hoặc 4xx/5xx
Domain: api.hihsk.com
Request URL: https://api.hihsk.com/api/exam/hsk1/test/343
Method: GET hoặc POST
```

## Nếu vẫn không tìm thấy

Có thể:
1. **API được gọi từ code khác**: Kiểm tra các file JS khác
2. **Cần đăng nhập**: Đảm bảo đã đăng nhập vào website
3. **Token hết hạn**: Lấy token mới từ cookies
4. **Dữ liệu được nhúng trong code**: Kiểm tra các file JS đã tải

## Checklist

Trước khi gửi request cho tôi:

- [ ] Đã mở **Network tab** (không phải Console tab)
- [ ] Đã lọc theo **XHR/Fetch**
- [ ] Đã **reload trang** và đợi vài giây
- [ ] Đã **tương tác với trang** (click, scroll)
- [ ] Request có domain **api.hihsk.com**
- [ ] Request KHÔNG phải từ **google-analytics.com**

## Sau khi tìm được

Gửi cho tôi:
- **Request URL** (đầy đủ)
- **Request Method** (GET hoặc POST)
- **Status Code** (200, 404, 500, etc.)

Tôi sẽ cập nhật script để fetch dữ liệu từ API endpoint đó.

