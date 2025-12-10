# Quy trình nghiệp vụ dự án HiHSK

## 1. Đăng ký, đăng nhập, xác thực
- Người dùng đăng ký/đăng nhập (email, Google) → nhận JWT.
- Mọi request API kèm JWT qua header `Authorization: Bearer <token>`.
- Sau đăng nhập, client lấy hồ sơ và trạng thái học để hiển thị tiến độ.

## 2. Khóa học, bài học, chủ đề từ vựng
- Người dùng duyệt danh sách khóa học → vào chi tiết khóa → mở bài học.
- Bài học gồm: từ vựng, ngữ pháp, đọc hiểu, quiz kiểm tra.
- Chủ đề từ vựng (topic) nhóm các từ của bài học để luyện theo hoạt động.
- Quy tắc mở khóa: bài học/chủ đề sau chỉ mở khi hoàn thành trước đó (API trả 403 nếu chưa đủ điều kiện).

## 3. Hoạt động học từ vựng (topic)
- Nguồn dữ liệu: danh sách từ của topic (chữ Hán, pinyin, nghĩa, audio, image…).
- Các hoạt động chính:
  - Flashcard: lật thẻ, đánh dấu đã nhớ; lưu tiến độ.
  - Quick Memorize: luyện nhanh, theo dõi số từ đã hoàn thành.
  - Image Quiz: chọn hình đúng cho từ.
  - Fill in the Blank: 2 tab (Chọn đáp án / Nghe và điền).
  - Pronunciation: nghe + ghi âm, chấm điểm, lưu điểm phát âm.
  - Vocabulary Practice (Coin Flip): hiển thị hình đúng/sai ngẫu nhiên, người học chọn đúng/sai.
  - Progress: tổng hợp tiến độ tất cả hoạt động của topic.
- Hoàn thành hoạt động → gọi API đánh dấu completion → cập nhật tiến trình/mở khóa.

## 4. Tiến trình & SRS
- Hệ thống lưu `UserWordProgress` và `ActivityProgress`.
- SRS Service quyết định trạng thái từ (New/Learning/Mastered) dựa trên kết quả luyện.
- Hoàn thành hoạt động/bài học → tiến trình cập nhật; có thể mở khóa mục tiếp theo.

## 5. Đề thi HSK
- Người dùng chọn đề (theo level) → vào màn hình làm bài → nộp bài.
- Khi nộp: gửi danh sách đáp án, chấm điểm trên server → trả kết quả, lessonCompleted/nextLessonUnlocked nếu áp dụng.
- Có trang xem lại và xem kết quả chi tiết.

## 6. Quản trị (Admin)
- Đăng nhập với vai trò admin.
- Quản lý khóa học, bài học, câu hỏi, từ vựng, media; seed/import/export dữ liệu.
- AI hỗ trợ: sinh ví dụ, phân loại từ, gợi ý nội dung.
- Thống kê & báo cáo: tiến độ người dùng, hoạt động học, kỳ thi.

## 7. Audio/TTS & proxy
- Phát audio qua `AudioController` (proxy).
- TTS Service tạo audio phát âm khi cần; client dùng `getProxyAudioUrl` để lấy URL an toàn.

## 8. Luồng chung front–back
- Frontend gọi API qua các service trong `Frontend/lib/services/*`, endpoint khai báo tại `Frontend/lib/api-endpoints.ts`.
- Backend .NET 8 nhận request, xác thực JWT, thực thi nghiệp vụ (Service + Repository), trả DTO.
- Lỗi/thiếu dữ liệu → trả mã lỗi phù hợp (400/403/404/500); frontend hiển thị Toast.

