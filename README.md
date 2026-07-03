# 🐷 Hệ Thống Quản Lý Trại Lợn Thông Minh (PFMS)

Chào mừng bạn đến với mã nguồn của **Hệ Thống Quản Lý Trại Lợn Thông Minh (PFMS)**. 
Tài liệu này sẽ hướng dẫn bạn từng bước từ con số 0 để cài đặt Database và khởi chạy dự án thành công.

---

## Bước 1: Tạo Database trên Supabase (Miễn phí)

Hệ thống sử dụng **Supabase** (PostgreSQL) làm cơ sở dữ liệu chính.
1. Truy cập [https://supabase.com/](https://supabase.com/) và đăng nhập/đăng ký tài khoản (bằng GitHub hoặc Email).
2. Nhấn nút **New Project**.
3. Điền thông tin dự án:
   - **Name**: `pfms-db` (hoặc tên bất kỳ bạn thích)
   - **Database Password**: Đặt mật khẩu an toàn và **hãy lưu lại mật khẩu này** (bạn sẽ cần nó ở Bước 2).
   - **Region**: Chọn `Singapore` (để tốc độ về Việt Nam nhanh nhất).
4. Nhấn **Create new project** và đợi khoảng 1-2 phút để Supabase khởi tạo server.

---

## Bước 2: Cấu hình file biến môi trường (`.env`)

1. Mở code của dự án trong VSCode.
2. Tìm file `.env` ở thư mục gốc (hoặc copy từ `.env.example` sang `.env`).
3. Quay lại trang quản trị của dự án Supabase vừa tạo, vào menu **Settings (bánh răng)** -> **API**.
4. Bạn copy thông tin và điền vào file `.env` như sau:

```env
# 1. Lấy ở mục Project URL
NEXT_PUBLIC_SUPABASE_URL=https://<mã-project-của-bạn>.supabase.co

# 2. Lấy ở mục Project API keys -> anon (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...<đoạn-mã-rất-dài>

# 3. Vào Settings -> Database -> Connection string -> Chọn URI 
# Copy URL đó và THAY THẾ chữ [YOUR-PASSWORD] bằng mật khẩu bạn đã tạo ở Bước 1
DATABASE_URL="postgresql://postgres.[mã-project]:[mật-khẩu-của-bạn]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

---

## Bước 3: Đẩy cấu trúc Bảng lên Database (Prisma)

Hệ thống sử dụng Prisma để quản lý cấu trúc bảng (Schema). Khi Database mới tạo chưa có gì, bạn cần đẩy cấu trúc lên.

Mở Terminal (Command Prompt / PowerShell) trong thư mục code, chạy lệnh sau:
```bash
npx prisma db push
```
*(Lệnh này sẽ tự động đọc file `prisma/schema.prisma` và tạo toàn bộ 40+ bảng dữ liệu trên Supabase của bạn)*

---

## Bước 4: Khởi chạy dự án & Cài đặt hệ thống lần đầu

Sau khi đã có Database đầy đủ bảng, bạn tiến hành chạy giao diện Web:

1. Chạy lệnh:
```bash
npm run dev
```
2. Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)
3. Hệ thống sẽ **tự động nhận diện** Database của bạn đang trống (chưa có tài khoản nào) và tự động chuyển hướng bạn đến trang **Cài đặt hệ thống (Setup Wizard)**.
4. Tại trang `/setup`, bạn hãy nhập thông tin để tạo **Tài khoản Quản trị cao nhất (Owner)** và thông tin **Trang trại đầu tiên**.
5. Nhấn Hoàn tất, hệ thống sẽ đưa bạn vào thẳng màn hình Tổng quan (Dashboard) và bạn có thể bắt đầu sử dụng!

---

🎉 **CHÚC MỪNG BẠN ĐÃ CÀI ĐẶT THÀNH CÔNG!**
Bản quyền thuộc dalymmo.com
