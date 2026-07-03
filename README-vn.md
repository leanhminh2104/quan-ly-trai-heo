# Hệ Thống Quản Lý Trại Lợn Thông Minh (PFMS)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fleanhminh2104%2Fquan-ly-trai-heo&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,DATABASE_URL,DIRECT_URL)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-beta-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

Nền tảng quản lý trang trại chăn nuôi lợn toàn diện chuẩn SaaS. Được trang bị kiến trúc đa trại (Multi-tenant), Phân quyền truy cập (RBAC), quản lý sức khỏe vật nuôi, theo dõi kho bãi, và báo cáo tài chính chuyên sâu.

Được xây dựng cho **dalymmo.com** và **leanhminh.io.vn** bởi **LAMDev**.

## Ngôn ngữ

- Tiếng Anh (Mặc định): [README.md](./README.md)
- Tiếng Việt: file này

## Mục Lục

- [Phiên Bản Cập Nhật](#phiên-bản-cập-nhật)
- [Tính Năng Nổi Bật](#tính-năng-nổi-bật)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Cài Đặt Nhanh](#cài-đặt-nhanh)
- [Biến Môi Trường (ENV)](#biến-môi-trường-env)
- [Triển Khai Lên Vercel](#triển-khai-lên-vercel)
- [Đóng Góp Cốt Lõi](#đóng-góp-cốt-lõi)
- [Bảo Mật](#bảo-mật)
- [Ủng Hộ (Donate)](#ủng-hộ-donate)
- [Bản Quyền](#bản-quyền)

## Phiên Bản Cập Nhật

| Trường | Giá trị |
| --- | --- |
| Phiên bản ứng dụng | `0.1.0` |
| Kênh phát hành | `beta` |
| Nhánh chính | `main` |
| Lần cập nhật cuối | `03-07-2026` |
| Lịch sử cập nhật chi tiết | [CHANGELOG.md](./CHANGELOG.md) |

## Tính Năng Nổi Bật

### Vận Hành Cốt Lõi
- **Theo dõi Đàn Lợn**: Quản lý vòng đời khép kín từ lúc sơ sinh đến khi xuất chuồng.
- **Sơ đồ Chuồng Trại**: Mô phỏng sơ đồ chuồng, giám sát phân khu và sức chứa thực tế.
- **Chu kỳ Sinh Sản**: Tự động hóa lịch trình phối giống, siêu âm, đẻ và cai sữa.
- **Quản lý Sức Khỏe**: Lên lịch tiêm phòng và ghi chép phác đồ điều trị.
- **Kiểm soát Kho**: Theo dõi lượng xuất/nhập cám, thuốc, vật tư và vaccine.
- **Tài chính**: Ghi nhận dòng tiền thu/chi, hóa đơn chứng từ.

### Bảo Mật & Đa Trại (SaaS)
- **Đa Trại (Multi-farm)**: Cách ly dữ liệu tuyệt đối giữa các trại bằng `farmId`.
- **Phân Quyền (RBAC)**: Ma trận quyền hạn chi tiết (Chủ trại, Quản lý, Bác sĩ, Nhân viên).
- **Nhật Ký Hệ Thống (Audit Logs)**: Ghi vết mọi thao tác chỉnh sửa/xóa.
- **Xóa Mềm (Soft Deletes)**: Chống xóa nhầm dữ liệu kinh doanh quan trọng.

## Kiến Trúc Hệ Thống

```text
quan-ly-chuong-lon/
|- prisma/       # Khai báo schema cơ sở dữ liệu
|- src/
|  |- actions/   # Server actions (Xử lý backend Next.js 15)
|  |- app/       # Giao diện & định tuyến App Router
|  |- components/# UI components (Dựa trên shadcn/ui)
|  |- hooks/     # Các hàm Hook dùng chung
|  |- lib/       # Thư viện core (Auth, RBAC, Database)
|  |- types/     # Kiểu dữ liệu TypeScript
|  |- validators/# Zod schema kiểm tra dữ liệu đầu vào
```

## Cài Đặt Nhanh

### Yêu Cầu

- Node.js `18+` (Khuyến nghị 20+)
- npm
- Cơ sở dữ liệu PostgreSQL (Khuyến nghị dùng Supabase)

### Cài Đặt

```bash
git clone https://github.com/leanhminh2104/quan-ly-trai-heo.git
cd quan-ly-trai-heo
npm install
```

### Thiết lập Database

```bash
npx prisma db push
npx prisma generate
```

### Chạy Local

```bash
npm run dev
```

URL truy cập: `http://localhost:3000`

## Biến Môi Trường (ENV)

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Cấu hình các biến bắt buộc:

```env
# Supabase Database URL (Dành cho Transaction pooler)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Supabase Direct URL (Dành cho Prisma Migration)
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

## Triển Khai Lên Vercel

1. Push code của bạn lên GitHub.
2. Thêm mới dự án (Import repository) trên Vercel.
3. Nhập đầy đủ các biến môi trường (ENV) vào cấu hình Vercel.
4. Bấm Deploy.
5. Vercel sẽ tự động build Next.js và cài đặt Prisma.

## Ủng Hộ (Donate)

Nếu dự án mang lại giá trị cho bạn, hãy ủng hộ nhà phát triển duy trì hệ thống.

| Phương Thức | Thông Tin |
| --- | --- |
| Ngân hàng | MB Bank |
| Số tài khoản | `2104200637` |
| Chủ tài khoản | `LE VAN ANH MINH` |
| QR Code | ![MB QR](https://img.vietqr.io/image/MB-2104200637-qr_only.png) |

## Đóng Góp Cốt Lõi

Chúng tôi luôn hoan nghênh những đóng góp từ cộng đồng.

- Vui lòng đọc [CONTRIBUTING.md](./CONTRIBUTING.md) trước khi tạo Pull Request.
- Viết rõ mô tả những thay đổi bạn thực hiện.

## Bảo Mật

Thông tin chi tiết về chính sách báo cáo lỗ hổng, tham khảo [SECURITY.md](./SECURITY.md).

## Bản Quyền

- Copyright (c) 2026 **dalymmo.com** và **leanhminh.io.vn** - **LAMDev**
- Phát triển và bảo trì độc quyền bởi **LAMDev**
- Website chính thức: **dalymmo.com** & **leanhminh.io.vn**

Source code tuân thủ giấy phép MIT. Xem chi tiết tại [LICENSE](./LICENSE).
