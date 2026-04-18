# Đặc tả Kỹ thuật: Ứng dụng Portal Helper

## 1. Tổng quan dự án
- **Nền tảng:** Ứng dụng di động (React Native).
- **Mục tiêu cốt lõi:** Một hệ thống quản lý học tập thông minh giúp sinh viên tự động hóa việc xếp lịch học không trùng lặp và hỗ trợ theo dõi tiến độ học tập trực tiếp.
- **Đối tượng người dùng:** Sinh viên đại học cần một công cụ tối ưu hóa quá trình đăng ký tín chỉ và quản lý lịch trình cá nhân.

## 2. Các phân hệ chính (Modules) & Logic nghiệp vụ

### A. Bộ máy tự động xếp lịch (Giải quyết bài toán thỏa mãn ràng buộc)
- **Dữ liệu đầu vào:** File danh sách các lớp đang mở (định dạng dự kiến: JSON/CSV). Mỗi bản ghi bao gồm: `Tên môn học`, `Mã lớp`, `Khung thời gian` (Thứ, Tiết bắt đầu, Tiết kết thúc), và `Giảng viên`.
- **Ràng buộc từ sinh viên (User Constraints):**
    - **Danh sách môn bắt buộc:** Các môn học sinh viên chỉ định muốn đăng ký.
    - **Khoảng thời gian mong muốn:** Các khung giờ ưu tiên (ví dụ: chỉ muốn học buổi sáng).
    - **Khoảng thời gian cấm (Hard Constraints):** Khung giờ sinh viên bận việc cá nhân, tuyệt đối không được xếp lịch vào.
- **Thuật toán xử lý:** - Hệ thống thực hiện duyệt tổ hợp để tìm ra tất cả các cách ghép lớp sao cho **không có môn nào bị trùng thời gian** và phải chứa đủ các môn trong "Danh sách môn bắt buộc".
    - Tiếp tục lọc danh sách kết quả này qua các bộ lọc "Thời gian mong muốn" và "Thời gian cấm".
- **Đầu ra:** Trả về một danh sách các cấu hình `Lịch học` hợp lệ để sinh viên xem xét và lựa chọn.

### B. Quản lý lịch học chính
- **Thiết lập:** Sau khi sinh viên chọn được một cấu hình ưng ý, hệ thống lưu nó làm `Lịch học chính` trong trạng thái của ứng dụng (State/Local Storage).
- **Xuất dữ liệu:** Cung cấp tính năng tải Lịch học chính về máy (dưới dạng hình ảnh hoặc file PDF).

### C. Dashboard Hỗ trợ học tập (Giao diện nhận thức ngữ cảnh)
- **Hiển thị theo thời gian thực:** Màn hình Dashboard tự động tính toán dựa trên đồng hồ của hệ thống.
- **Logic phân luồng:** - `Môn hiện tại`: Lớp học đang diễn ra ngay lúc này.
    - `Môn trước đó`: Lớp học vừa mới kết thúc.
    - `Môn tiếp theo`: Lớp học sắp diễn ra trong ngày.
- **Công cụ tương tác tại lớp:** Bên trong mỗi thẻ môn học (section), sinh viên có thể thao tác:
    - **Ghi chú (Notes):** Trình soạn thảo văn bản ngắn cho từng buổi.
    - **Tích lũy điểm cộng:** Nút bấm tăng/giảm số lượng điểm phát biểu.
    - **Đánh vắng (Attendance):** Đánh dấu và đếm số buổi đã nghỉ học.

### D. Hệ thống tính điểm GPA tự động
- **Thiết lập quy tắc:** Tại mỗi môn học, sinh viên tự định nghĩa trọng số điểm theo quy chế của giảng viên (Ví dụ: Chuyên cần 10%, Giữa kỳ 30%, Cuối kỳ 60%, Điểm cộng quy đổi ra sao).
- **Tính toán thời gian thực:** Khi sinh viên nhập điểm số thành phần hoặc thêm điểm cộng, hệ thống sẽ lập tức cập nhật và hiển thị điểm tổng kết môn học, cũng như điểm GPA tổng quát hiện tại.

## 3. Yêu cầu về mặt Kiến trúc
- **Framework:** React Native.
- **Quản lý Trạng thái (State Management):** Cần một giải pháp quản lý state linh hoạt và mạnh mẽ (như Redux, Zustand hoặc Context) vì dữ liệu Dashboard và GPA cần phản ứng ngay lập tức với các thay đổi.
- **Xử lý Dữ liệu:** Yêu cầu logic chính xác cao trong việc parse (phân tích) file dữ liệu tải lên và các thuật toán so sánh khung giờ (để phát hiện trùng lặp).
