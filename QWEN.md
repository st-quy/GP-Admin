[BUG] Teacher - Authentication - Forgot password


# BUG_AUTH_003

*Ô input email chưa xử lý validate maxLength*

*Chưa thực hiện validate maxLength cho trường email*

*Hệ thống giới hạn ký tự hoặc báo lỗi quá độ dài*


# BUG_AUTH_004

*Ô input email chưa tự động trim() khoảng trắng đầu/cuối*

 

*Chưa tự động trim() khoảng trắng đầu/cuối.*

*Hệ thống tự xóa khoảng trắng và đăng nhập thành công*

 

# BUG_AUTH_005

*Nhập đúng email đã đăng ký nhưng báo lỗi: 'Error sending reset email: data and salt arguments required'!*

*Chưa thể reset password*

*Hệ thống gửi link reset mật khẩu thành công*



# BUG_AUTH_007

*Không hiển thị thông báo ""Password reset link sent to your email" khi bấm vào nút "Reset password"*

1. Truy cập đường link "Forgot password"
2. Nhập email
3. Nhấn nút "Reset password"

*Hiển thị thông báo "Password reset link sent to your email" khi bấm vào nút "Reset password"*

*Hệ thống có gửi email để reset password nhưng không hiển thị thông báo "Password reset link sent to your email"*

 

 

 

 

 

