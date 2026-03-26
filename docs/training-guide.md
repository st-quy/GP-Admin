# GreenPREP - Hướng dẫn đào tạo

## Mục lục

1. [Giới thiệu hệ thống](#1-giới-thiệu-hệ-thống)
2. [Hướng dẫn dành cho Giảng viên](#2-hướng-dẫn-dành-cho-giảng-viên)
3. [Hướng dẫn dành cho Sinh viên](#3-hướng-dẫn-dành-cho-sinh-viên)
4. [Câu hỏi thường gặp (FAQ)](#4-câu-hỏi-thường-gặp-faq)

---

## 1. Giới thiệu hệ thống

GreenPREP là nền tảng luyện thi APTIS trực tuyến gồm 2 ứng dụng chính:

- **GP-Admin** (dành cho Giảng viên/Admin): Quản lý lớp học, phiên thi, ngân hàng câu hỏi, chấm điểm
- **GP-Student** (dành cho Sinh viên): Tham gia phiên thi, làm bài thi, xem kết quả

### Các kỹ năng được đánh giá

| Kỹ năng | Mô tả |
|---------|-------|
| Speaking | Ghi âm trả lời câu hỏi nói (3 phần) |
| Listening | Nghe audio và trả lời câu hỏi |
| Reading | Đọc đoạn văn và trả lời câu hỏi |
| Grammar & Vocabulary | Trắc nghiệm ngữ pháp và từ vựng |
| Writing | Viết bài luận theo chủ đề |

---

## 2. Hướng dẫn dành cho Giảng viên

### 2.1 Đăng nhập

1. Truy cập hệ thống GP-Admin
2. Nhập email và mật khẩu được cấp
3. Nhấn **Đăng nhập**
4. Nếu quên mật khẩu, nhấn **Quên mật khẩu** và làm theo hướng dẫn qua email

### 2.2 Quản lý lớp học

#### Tạo lớp mới
1. Vào trang **Quản lý lớp học**
2. Nhấn nút **Tạo lớp**
3. Điền tên lớp trong form hiện ra
4. Nhấn **Xác nhận**

#### Import lớp từ Excel
1. Nhấn **Export Template** để tải mẫu Excel
2. Điền thông tin lớp vào file mẫu
3. Nhấn **Import** và chọn file Excel đã điền
4. Xem trước dữ liệu trong modal preview
5. Nhấn **Xác nhận** để import

#### Chỉnh sửa / Xóa lớp
- Nhấn icon **Sửa** để chỉnh sửa thông tin lớp
- Nhấn icon **Xóa** để xóa lớp (chỉ xóa được khi lớp chưa có phiên thi nào)

### 2.3 Quản lý phiên thi (Session)

#### Tạo phiên thi
1. Vào **Chi tiết lớp** bằng cách nhấn vào tên lớp
2. Nhấn **Tạo phiên thi**
3. Điền thông tin: tên phiên, đề thi, thời gian bắt đầu/kết thúc
4. Nhấn **Xác nhận**

#### Quản lý phiên thi
- Xem danh sách sinh viên tham gia trong tab **Participant List**
- Xem và xử lý yêu cầu tham gia trong tab **Pending Requests**:
  - Nhấn **Approve** để chấp nhận
  - Nhấn **Reject** để từ chối
- Nhấn **Publish Scores** để công bố điểm (hệ thống sẽ gửi email thông báo cho sinh viên)

### 2.4 Ngân hàng câu hỏi (Question Bank)

#### Xem câu hỏi
1. Vào trang **Question Bank**
2. Chọn tab kỹ năng: Speaking, Listening, Reading, Grammar, Writing
3. Tìm kiếm theo tên section
4. Nhấn vào section để xem chi tiết câu hỏi

#### Tạo câu hỏi mới
1. Nhấn **Tạo mới** và chọn kỹ năng
2. Điền thông tin section (tên, mô tả, độ khó)
3. Thêm từng câu hỏi theo loại tương ứng
4. Nhấn **Lưu**

#### Chỉnh sửa / Xóa
- Nhấn icon **Sửa** để chỉnh sửa section
- Nhấn icon **Xóa** để xóa section (có xác nhận trước khi xóa)

### 2.5 Quản lý đề thi (Exam)

#### Tạo đề thi
1. Vào trang **Exam**
2. Nhấn **Tạo đề thi**
3. Chọn các section câu hỏi cho từng kỹ năng
4. Điền thông tin đề thi (tên, thời lượng, mô tả)
5. Lưu dưới dạng **Draft** hoặc **Submit** để gửi duyệt

#### Quy trình duyệt đề thi
1. **Draft** → Giảng viên tạo và chỉnh sửa
2. **Submitted** → Gửi cho Admin duyệt
3. **Approved** → Đã được duyệt, có thể sử dụng cho phiên thi
4. **Rejected** → Bị từ chối, cần chỉnh sửa lại

### 2.6 Chấm điểm (Grading)

1. Vào **Chi tiết phiên thi** → Chọn sinh viên cần chấm
2. Hệ thống hiển thị 2 tab:
   - **Speaking**: Nghe lại bài ghi âm của sinh viên, nhập điểm và nhận xét
   - **Writing**: Đọc bài viết của sinh viên, nhập điểm và nhận xét
3. Nhập điểm cho từng câu hỏi
4. Thêm nhận xét (comment) nếu cần
5. Nhấn **Lưu** để lưu kết quả chấm
6. Chuyển sang sinh viên tiếp theo

### 2.7 Dashboard (Admin)

Dashboard hiển thị tổng quan:
- Tổng số sinh viên trong lớp
- Trạng thái phiên thi hiện tại
- Tổng số phiên thi
- Tỷ lệ hoàn thành
- Biểu đồ phân bố trạng thái phiên thi
- Hoạt động gần đây

---

## 3. Hướng dẫn dành cho Sinh viên

### 3.1 Đăng nhập & tham gia phiên thi

1. Truy cập hệ thống GP-Student
2. Đăng nhập bằng tài khoản được cấp
3. Nhập **Session Key** do giảng viên cung cấp để tham gia phiên thi
4. Chờ giảng viên phê duyệt yêu cầu tham gia

### 3.2 Làm bài thi

Bài thi gồm 5 phần, thực hiện theo thứ tự:

#### Phần 1: Speaking (Nói)
1. Đọc hướng dẫn ở trang giới thiệu
2. Kiểm tra microphone
3. Thực hiện lần lượt 3 phần:
   - **Part 1**: Trả lời câu hỏi ngắn
   - **Part 2**: Mô tả/so sánh
   - **Part 3**: Thảo luận chủ đề
4. Nhấn nút ghi âm để bắt đầu, nhấn dừng khi hoàn thành
5. Chú ý thời gian hiển thị trên màn hình

#### Phần 2: Listening (Nghe)
1. Đọc hướng dẫn
2. Kiểm tra tai nghe
3. Nghe audio và trả lời câu hỏi
4. Có thể nghe lại audio (tùy cài đặt)

#### Phần 3: Grammar & Vocabulary (Ngữ pháp & Từ vựng)
1. Đọc hướng dẫn
2. Trả lời câu hỏi trắc nghiệm
3. Sử dụng thanh điều hướng câu hỏi để di chuyển giữa các câu

#### Phần 4: Reading (Đọc)
1. Đọc hướng dẫn
2. Đọc đoạn văn và trả lời câu hỏi
3. Các dạng câu hỏi:
   - Chọn từ điền vào chỗ trống (dropdown)
   - Nối cặp (matching)
   - Sắp xếp thứ tự (ordering)

#### Phần 5: Writing (Viết)
1. Đọc hướng dẫn và đề bài
2. Viết bài trong ô soạn thảo
3. Theo dõi số từ đã viết
4. Chú ý thời gian

### 3.3 Nộp bài

1. Sau khi hoàn thành tất cả 5 phần, hệ thống hiển thị trang tổng kết
2. Kiểm tra lại các phần đã hoàn thành
3. Nhấn **Nộp bài** để gửi bài thi
4. Chờ giảng viên chấm điểm và công bố kết quả qua email

### 3.4 Xem kết quả

- Khi giảng viên công bố điểm, sinh viên nhận email thông báo
- Đăng nhập hệ thống để xem chi tiết điểm từng kỹ năng

---

## 4. Câu hỏi thường gặp (FAQ)

### Đăng nhập

**Q: Tôi quên mật khẩu, phải làm sao?**
A: Nhấn "Quên mật khẩu" ở trang đăng nhập, nhập email và làm theo hướng dẫn trong email.

**Q: Tôi không đăng nhập được?**
A: Kiểm tra lại email/mật khẩu. Nếu vẫn không được, liên hệ Admin để kiểm tra trạng thái tài khoản.

### Phiên thi

**Q: Sinh viên không thấy phiên thi?**
A: Kiểm tra Session Key có chính xác không. Đảm bảo phiên thi đã được tạo và ở trạng thái "Ongoing".

**Q: Sinh viên đã gửi yêu cầu nhưng chưa vào được phiên thi?**
A: Giảng viên cần vào tab "Pending Requests" để phê duyệt yêu cầu.

### Bài thi

**Q: Microphone không hoạt động trong phần Speaking?**
A: Kiểm tra quyền truy cập microphone trong trình duyệt. Đảm bảo đã cho phép website sử dụng microphone.

**Q: Bài thi bị gián đoạn do mất mạng?**
A: Hệ thống lưu câu trả lời tạm thời. Khi kết nối lại, bài thi sẽ được khôi phục từ điểm dừng.

**Q: Không nghe được audio trong phần Listening?**
A: Kiểm tra tai nghe và âm lượng. Thử refresh trang. Đảm bảo trình duyệt cho phép phát audio.

### Chấm điểm

**Q: Làm sao để chấm điểm Speaking?**
A: Vào chi tiết phiên thi → Chọn sinh viên → Tab Speaking → Nghe ghi âm → Nhập điểm và nhận xét.

**Q: Điểm đã publish có thể sửa lại không?**
A: Sau khi publish, điểm sẽ được gửi email cho sinh viên. Liên hệ Admin nếu cần điều chỉnh.
