# 🐾 PetCareX - Hệ thống Quản lý Trung tâm Chăm sóc Thú cưng

## GIỚI THIỆU DỰ ÁN (About The Project)

Đây là đồ án xây dựng hệ thống quản lý chuỗi trung tâm chăm sóc thú cưng **PetCareX**, hỗ trợ số hóa các nghiệp vụ như đặt lịch khám bệnh/tiêm vaccine, bán hàng và chương trình thành viên, đồng thời tập trung vào tối ưu hóa CSDL với stored procedures, triggers, index và partition.

## THÀNH VIÊN NHÓM (Team Members)

| Họ và tên | MSSV |
|-----------|------| 
| Kiều Đỗ Song Tinh | 23120373 |
| Văn Công Tính | 23120374 |
| Cao Thị Tú Vi | 23120402 |
| Dương Trần Anh Tú | 23120417 |

## CÁC TÍNH NĂNG CHÍNH (Key Features)

### Vai trò người dùng (User Roles)
- **Khách hàng (Customer):** Đăng ký hội viên, quản lý thú cưng, đặt lịch dịch vụ, mua hàng trực tuyến, tích điểm loyalty, xem lịch sử hóa đơn và đánh giá dịch vụ.
- **Bác sĩ thú y (Doctor):** Xem lịch khám trong ngày, lập phiếu khám bệnh, chẩn đoán, kê đơn thuốc, quản lý lịch tiêm vaccine và lịch tái khám.
- **Nhân viên tiếp tân / bán hàng (Staff):** Tiếp nhận lịch hẹn, xử lý điểm bán hàng (POS), quản lý kho tồn, xuất hóa đơn, xem đánh giá dịch vụ.
- **Quản trị viên (Administrator):** Quản lý toàn bộ hệ thống, nhân sự, chi nhánh, xem báo cáo doanh thu và tình hình hội viên.

### Phân hệ nghiệp vụ

**Khách hàng:**
- Quản lý hồ sơ thú cưng (họ tên, loài, giống, ngày sinh, giới tính, tình trạng sức khoẻ)
- Đặt lịch dịch vụ: khám bệnh, tiêm vaccine (lẻ hoặc theo gói 6 tháng/12 tháng)
- Mua hàng online: thức ăn, thuốc, phụ kiện
- Xem và quản lý hóa đơn, lịch sử dịch vụ
- Chương trình tích điểm loyalty (1 điểm = 50.000 VNĐ), quy đổi tại thanh toán
- Xem và gửi đánh giá dịch vụ (điểm chất lượng, thái độ nhân viên, mức hài lòng, bình luận)

**Bác sĩ thú y:**
- Dashboard lịch làm việc và phiếu khám trong ngày
- Lập phiếu khám bệnh: ghi nhận triệu chứng, chẩn đoán, kê đơn thuốc, đặt lịch tái khám
- Quản lý phiếu tiêm vaccine: loại vaccine, liều lượng, ngày tiêm, hiệu lực

**Nhân viên:**
- Tiếp nhận và xử lý lịch hẹn dịch vụ
- Điểm bán hàng (POS): tạo hóa đơn mua hàng trực tiếp, tìm kiếm sản phẩm
- Quản lý kho tồn theo chi nhánh, cảnh báo hàng dưới ngưỡng tối thiểu
- Tra cứu thú cưng, quản lý hóa đơn và báo cáo ca làm việc

**Quản trị viên:**
- Quản lý nhân sự (thêm/xóa/cập nhật lương, phân công chi nhánh)
- Quản lý tài nguyên hệ thống (dịch vụ, mặt hàng, chi nhánh)
- Xem báo cáo doanh thu toàn hệ thống và từng chi nhánh theo ngày/tháng/quý/năm
- Thống kê tình hình hội viên (Cơ bản/Thân thiết/VIP)

### Chương trình thành viên (Membership)

| Hạng | Điều kiện nâng hạng | Điều kiện giữ hạng |
|------|--------------------|--------------------|
| 🥉 Cơ bản | Mặc định | — |
| 🥈 Thân thiết | Chi tiêu ≥ 5.000.000 VNĐ/năm | ≥ 3.000.000 VNĐ/năm |
| 💎 VIP | Chi tiêu ≥ 12.000.000 VNĐ/năm | ≥ 8.000.000 VNĐ/năm |

## ĐIỂM NHẤN KỸ THUẬT: Thiết kế & Tối ưu CSDL

Trọng tâm học thuật của đồ án là thiết kế cơ sở dữ liệu quan hệ theo chuẩn và ứng dụng các kỹ thuật tối ưu hiệu suất cấp độ DBMS:

### Phân tích tần suất và Stored Procedures
- Xác định tần suất giao dịch của từng chức năng nghiệp vụ (cao/thấp) làm cơ sở đề xuất giải pháp tối ưu.
- Đóng gói các thao tác nghiệp vụ phức tạp vào Stored Procedures: đặt lịch hẹn, kết thúc khám bệnh, hủy lịch, xử lý hóa đơn, tích điểm thành viên.

### Kiểm soát toàn vẹn dữ liệu bằng Triggers
- Triggers `AFTER INSERT / UPDATE / DELETE` ngăn chặn sửa đổi dữ liệu sau khi phiếu dịch vụ đã hoàn tất hoặc bị hủy (data freezing).
- Đảm bảo tự động cập nhật tồn kho khi phát sinh giao dịch bán hàng hoặc kê đơn thuốc.

### Chiến lược lập chỉ mục (Indexing)
- Non-Clustered Indexes kết hợp `INCLUDE` để tránh Key Lookup, tối ưu Execution Plan cho các truy vấn tần suất cao như: lịch sử khám bệnh theo thú cưng, lịch làm việc theo chi nhánh, tìm kiếm mặt hàng theo loại.
- Tạo và so sánh hiệu quả có/không có index (chụp hình và giải thích kết quả Execution Plan).

### Phân vùng dữ liệu (Partitioning)
- Horizontal Partitioning trên các bảng dữ liệu lớn theo năm (dữ liệu xếp hạng thành viên, lịch sử giao dịch) để cô lập truy vấn phân tích và tăng tốc độ báo cáo.

### Mô phỏng kịch bản sử dụng (Use Case Simulation)
- Mô tả 5–8 kịch bản sử dụng thực tế có liên quan trong hệ thống.
- Phân tích tần suất, áp dụng lý thuyết phân tích dữ liệu mức vật lý để đề xuất và so sánh hiệu quả giải pháp.
- Dữ liệu tự phát sinh: **≥ 70.000 dòng/bảng** để kiểm chứng các đề xuất chỉ mục.

## CÔNG NGHỆ SỬ DỤNG (Tech Stack)
* **Frontend:** Next.js, React, TypeScript, Tailwind CSS.
* **Backend:** Next.js API Routes, Node.js.
* **Database:** **SQL Server** — RDBMS chính, xử lý logic nghiệp vụ thông qua:
  - Stored Procedures
  - Triggers
  - Non-Clustered Indexes (với INCLUDE)
  - Horizontal Partitioning
  - Transactions & Concurrency Control

* **Quản lý mã nguồn:** GitHub.

## CẤU TRÚC THƯ MỤC (Folder Structure)

```
Course_AD_Pet_Care_Management/
├── app/                        # Next.js App Router
│   ├── administrator/          # Phân hệ Quản trị viên
│   │   ├── resources/          # Quản lý tài nguyên hệ thống
│   │   ├── revenue/            # Báo cáo doanh thu
│   │   └── setting/            # Cấu hình hệ thống
│   ├── customer/               # Phân hệ Khách hàng
│   │   ├── appointments/       # Đặt lịch hẹn dịch vụ
│   │   ├── cart/               # Giỏ hàng
│   │   ├── checkout/           # Thanh toán
│   │   ├── history/            # Lịch sử dịch vụ
│   │   ├── invoices/           # Hóa đơn
│   │   ├── pets/               # Quản lý thú cưng
│   │   ├── profile/            # Hồ sơ cá nhân
│   │   ├── reviews/            # Đánh giá dịch vụ
│   │   └── shop/               # Cửa hàng trực tuyến
│   ├── doctor/                 # Phân hệ Bác sĩ thú y
│   │   ├── examination/        # Lập phiếu khám bệnh
│   │   ├── profile/            # Hồ sơ bác sĩ
│   │   └── vaccination/        # Quản lý tiêm vaccine
│   ├── staff/                  # Phân hệ Nhân viên
│   │   ├── inventory/          # Quản lý kho tồn
│   │   ├── invoices/           # Hóa đơn
│   │   ├── pets/               # Tra cứu thú cưng
│   │   ├── pos/                # Điểm bán hàng (POS)
│   │   ├── profile/            # Hồ sơ nhân viên
│   │   ├── reception/          # Tiếp nhận lịch hẹn
│   │   ├── reports/            # Báo cáo ca làm việc
│   │   └── reviews/            # Xem đánh giá
│   ├── login/                  # Trang đăng nhập
│   ├── register/               # Trang đăng ký
│   ├── globals.css             # CSS toàn cục
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Trang chủ (Landing page)
├── components/                 # Shared components
│   ├── ui/                     # Radix UI base components
│   ├── hero-section.tsx        # Banner trang chủ
│   ├── services-section.tsx    # Giới thiệu dịch vụ
│   ├── branches-section.tsx    # Danh sách chi nhánh
│   ├── membership-section.tsx  # Chương trình thành viên
│   ├── public-header.tsx       # Header trang công khai
│   └── public-footer.tsx       # Footer trang công khai
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities & helpers
├── public/                     # Static assets
├── styles/                     # Additional styles
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Quản lý dependencies
└── .gitignore                  # Các file không đưa lên Git
```

## HƯỚNG DẪN CÀI ĐẶT (Getting Started)

### Yêu cầu hệ thống
- Node.js (phiên bản 18.x trở lên)
- npm (phiên bản 9.x trở lên) hoặc pnpm
- Microsoft SQL Server 2019 hoặc mới hơn

### Thiết lập Cơ sở dữ liệu
1. Mở SQL Server Management Studio (SSMS) và kết nối vào instance SQL Server.
2. Thực thi script khởi tạo cơ sở dữ liệu và bảng.
3. Lần lượt thực thi các script chức năng:
   - Triggers
   - Partition Function & Partition Scheme
   - Non-Clustered Indexes
   - Stored Procedures
4. Nạp dữ liệu mẫu (tự phát sinh ≥ 70.000 dòng/bảng cho các bảng cần minh hoạ index).

### Cài đặt và Khởi chạy Frontend

```bash
# Clone repository
git clone <repository-url>
cd Course_AD_Pet_Care_Management

# Cài đặt dependencies
npm install

# Khởi chạy môi trường phát triển
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## DEMO
Link demo: **[demo-petcareX](https://youtu.be/nG8b1DOb--k)**
