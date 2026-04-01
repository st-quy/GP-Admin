# GreenPREP - Thu thập Feedback & Ghi nhận Issues

## Mục lục

1. [Mục đích](#1-mục-đích)
2. [Quy trình thu thập feedback](#2-quy-trình-thu-thập-feedback)
3. [Form Feedback - Giảng viên](#3-form-feedback---giảng-viên)
4. [Form Feedback - Sinh viên](#4-form-feedback---sinh-viên)
5. [Mẫu ghi nhận Issues](#5-mẫu-ghi-nhận-issues)
6. [Tổng hợp & Báo cáo](#6-tổng-hợp--báo-cáo)

---

## 1. Mục đích

- Đánh giá hiệu quả buổi đào tạo sử dụng hệ thống GreenPREP
- Thu thập ý kiến từ giảng viên và sinh viên để cải thiện sản phẩm
- Phát hiện và ghi nhận lỗi (bugs), vấn đề UX/UI
- Xác định các tính năng cần bổ sung hoặc cải thiện

---

## 2. Quy trình thu thập feedback

### Trước buổi đào tạo
- [ ] Chuẩn bị form feedback (in hoặc online)
- [ ] Chuẩn bị tài khoản cho người tham gia
- [ ] Kiểm tra hệ thống hoạt động ổn định
- [ ] Chuẩn bị phiên thi mẫu để demo

### Trong buổi đào tạo
- [ ] Hướng dẫn các chức năng chính
- [ ] Cho người tham gia thực hành trực tiếp
- [ ] Ghi nhận các vấn đề phát sinh ngay tại chỗ
- [ ] Quan sát và ghi chú các thao tác người dùng gặp khó khăn

### Sau buổi đào tạo
- [ ] Phát form feedback cho người tham gia
- [ ] Thu thập và tổng hợp feedback
- [ ] Phân loại issues theo mức độ ưu tiên
- [ ] Tạo ticket trên Jira cho các issues cần xử lý
- [ ] Báo cáo kết quả cho team phát triển

---

## 3. Form Feedback - Giảng viên

### Thông tin chung
- **Họ tên**: _______________
- **Bộ môn**: _______________
- **Ngày đào tạo**: _______________

### Đánh giá tổng quan (1-5: Rất kém → Rất tốt)

| Tiêu chí | 1 | 2 | 3 | 4 | 5 |
|----------|---|---|---|---|---|
| Giao diện dễ sử dụng | | | | | |
| Tốc độ hệ thống | | | | | |
| Chức năng quản lý lớp học | | | | | |
| Chức năng tạo phiên thi | | | | | |
| Chức năng chấm điểm Speaking | | | | | |
| Chức năng chấm điểm Writing | | | | | |
| Quản lý ngân hàng câu hỏi | | | | | |
| Quản lý đề thi | | | | | |
| Dashboard & báo cáo | | | | | |
| Tài liệu hướng dẫn | | | | | |

### Câu hỏi mở

1. **Chức năng nào bạn thấy hữu ích nhất?**

   _____________________________________________________________

2. **Chức năng nào bạn gặp khó khăn khi sử dụng?**

   _____________________________________________________________

3. **Bạn có gặp lỗi nào trong quá trình sử dụng không? (Mô tả chi tiết)**

   _____________________________________________________________

4. **Bạn mong muốn bổ sung tính năng nào?**

   _____________________________________________________________

5. **Ý kiến khác:**

   _____________________________________________________________

---

## 4. Form Feedback - Sinh viên

### Thông tin chung
- **Họ tên**: _______________
- **Lớp**: _______________
- **Ngày đào tạo**: _______________

### Đánh giá tổng quan (1-5: Rất kém → Rất tốt)

| Tiêu chí | 1 | 2 | 3 | 4 | 5 |
|----------|---|---|---|---|---|
| Giao diện dễ sử dụng | | | | | |
| Hướng dẫn làm bài rõ ràng | | | | | |
| Phần thi Speaking (ghi âm) | | | | | |
| Phần thi Listening (nghe) | | | | | |
| Phần thi Reading (đọc) | | | | | |
| Phần thi Grammar (ngữ pháp) | | | | | |
| Phần thi Writing (viết) | | | | | |
| Tốc độ tải trang | | | | | |
| Xem kết quả điểm | | | | | |

### Câu hỏi mở

1. **Bạn gặp khó khăn gì khi làm bài thi?**

   _____________________________________________________________

2. **Phần thi nào bạn thấy giao diện chưa rõ ràng?**

   _____________________________________________________________

3. **Bạn có gặp lỗi nào không? (Mô tả chi tiết)**

   _____________________________________________________________

4. **Bạn muốn cải thiện điều gì?**

   _____________________________________________________________

---

## 5. Mẫu ghi nhận Issues

Sử dụng bảng sau để ghi nhận các issues phát hiện trong buổi đào tạo:

### Issue Log

| # | Ngày | Người báo cáo | Mô tả issue | Bước tái hiện | Mức độ | Trạng thái | Ghi chú |
|---|------|---------------|-------------|---------------|--------|------------|---------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

### Phân loại mức độ

| Mức độ | Mô tả | Ví dụ |
|--------|-------|-------|
| **Critical** | Không thể sử dụng chức năng chính | Không đăng nhập được, không nộp bài được |
| **High** | Ảnh hưởng nghiêm trọng đến trải nghiệm | Ghi âm bị lỗi, mất dữ liệu bài thi |
| **Medium** | Gây bất tiện nhưng có thể workaround | Giao diện hiển thị sai, tốc độ chậm |
| **Low** | Vấn đề nhỏ, không ảnh hưởng nhiều | Lỗi chính tả, alignment UI nhỏ |

### Phân loại loại issue

| Loại | Mô tả |
|------|-------|
| **Bug** | Lỗi phần mềm, chức năng không hoạt động đúng |
| **UX/UI** | Vấn đề về giao diện, trải nghiệm người dùng |
| **Performance** | Vấn đề về tốc độ, hiệu suất |
| **Feature Request** | Yêu cầu tính năng mới |
| **Documentation** | Thiếu hoặc sai hướng dẫn |

---

## 6. Tổng hợp & Báo cáo

### Mẫu báo cáo tổng hợp

```
# Báo cáo đào tạo GreenPREP
- Ngày: [DD/MM/YYYY]
- Địa điểm: [...]
- Số giảng viên tham gia: [...]
- Số sinh viên tham gia: [...]

## Kết quả đánh giá
- Điểm trung bình giảng viên: [X/5]
- Điểm trung bình sinh viên: [X/5]

## Thống kê Issues
- Critical: [X] issues
- High: [X] issues
- Medium: [X] issues
- Low: [X] issues

## Top Issues cần xử lý
1. [Issue #X] - [Mô tả ngắn]
2. [Issue #X] - [Mô tả ngắn]
3. [Issue #X] - [Mô tả ngắn]

## Feedback nổi bật
- Tích cực: [...]
- Cần cải thiện: [...]

## Kế hoạch hành động
1. [Action item] - Người phụ trách - Deadline
2. [Action item] - Người phụ trách - Deadline
```

### Quy trình xử lý sau báo cáo

1. Tổng hợp tất cả feedback và issues
2. Phân loại và ưu tiên issues
3. Tạo Jira tickets cho issues cần fix (prefix: APTIS-xxx)
4. Assign cho developer phụ trách
5. Theo dõi tiến độ xử lý
6. Thông báo kết quả cho người báo cáo
