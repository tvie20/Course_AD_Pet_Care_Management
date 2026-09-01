-- =============================================
-- 1. BẢNG HOADON (Tập trung vào Tìm kiếm và Báo cáo)
-- =============================================
Use PetCareX;
GO
-- 1.1. Tìm lịch sử khám bệnh của Thú cưng (Gộp cũ: IX_HOADON_MaTC_Covering + TimNhanhHoaDon)
-- Tác dụng: Tìm hóa đơn theo MaTC, tự động sắp xếp theo ngày giảm dần/tăng dần.
-- Key là (MaTC, ThoiGian) giúp SQL lọc MaTC xong là lấy được ngay khoảng thời gian mong muốn.
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOADON_MaTC_ThoiGian_Include_NV' AND object_id = OBJECT_ID('HOADON'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOADON_MaTC_ThoiGian_Include_NV
    ON HOADON (MaTC, ThoiGianLapHD) 
    INCLUDE (HMaNV); 
    PRINT N'- [HOADON] Da tao Index tim lich su Thu cung (IX_HOADON_MaTC_ThoiGian_Include_NV).';
END

-- 1.2. Báo cáo doanh thu & Thống kê theo thời gian (Gộp cũ: ThoiGian_Cover + BaoCaoDoanhThu)
-- Tác dụng: "Cân" hết các query dạng "Doanh thu tháng này", "Hóa đơn từ ngày A đến ngày B".
-- Đưa hết các cột tiền nong (TongTien, KhuyenMai) vào INCLUDE để tính SUM cực nhanh.
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOADON_ThoiGian_FullCovering' AND object_id = OBJECT_ID('HOADON'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOADON_ThoiGian_FullCovering
    ON HOADON (ThoiGianLapHD)
    INCLUDE (MaTC, HMaNV, KhuyenMai, TongTien);
    PRINT N'- [HOADON] Da tao Index bao cao Doanh thu (IX_HOADON_ThoiGian_FullCovering).';
END
GO

-- =============================================
-- 2. BẢNG CHITIETHOADON
-- =============================================

-- 2.1. Covering Index cho chi tiết (Xử lý bảng to nhất hệ thống)
-- Tác dụng: Khi join từ Hóa đơn sang, SQL lấy luôn MaSP và SoLuong từ Index này
-- mà không cần tốn công đọc dữ liệu từ bảng gốc (tránh Key Lookup).
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CTHD_MaHD_Include_SP_SL' AND object_id = OBJECT_ID('CHITIETHOADON'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_CTHD_MaHD_Include_SP_SL
    ON CHITIETHOADON (MaHD)
    INCLUDE (MaSP, SoLuong);
    PRINT N'- [CHITIETHOADON] Da tao Covering Index (IX_CTHD_MaHD_Include_SP_SL).';
END
GO

-- =============================================
-- 3. BẢNG THUCUNG
-- =============================================

-- 3.1. Tìm thú cưng của Khách hàng (Gộp cũ: IX_THUCUNG_MaKH + TimChuSoHuu)
-- Tác dụng: Vào màn hình "Thông tin khách hàng", hiện list thú cưng ngay lập tức.
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_THUCUNG_MaKH_Include_MaTC' AND object_id = OBJECT_ID('THUCUNG'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_THUCUNG_MaKH_Include_MaTC 
    ON THUCUNG (MaKH) 
    INCLUDE (MaTC);
    PRINT N'- [THUCUNG] Da tao Index tim Thu cung theo Chu so huu (IX_THUCUNG_MaKH_Include_MaTC).';
END

-- 3.2. Thống kê Phân loại và Giống (Query T07)
-- Tác dụng: Hỗ trợ query GROUP BY Loai, Giong.
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_THUCUNG_Loai_Giong' AND object_id = OBJECT_ID('THUCUNG'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_THUCUNG_Loai_Giong 
    ON THUCUNG (Loai, Giong) 
    INCLUDE (MaTC);
    PRINT N'- [THUCUNG] Da tao Index thong ke Loai/Giong (IX_THUCUNG_Loai_Giong).';
END

-- =============================================
-- 4. BẢNG TAIKHOANHOIVIEN
-- =============================================

-- 4.1. Lọc hội viên đăng ký mới
-- Tác dụng: Dùng cho màn hình Dashboard, xem lượng đăng ký mới trong ngày/tuần.
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TAIKHOANHOIVIEN_NgayDangKy_Include_MaKH' AND object_id = OBJECT_ID('TAIKHOANHOIVIEN'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_TAIKHOANHOIVIEN_NgayDangKy_Include_MaKH
    ON TAIKHOANHOIVIEN (NgayDangKy) 
    INCLUDE (MaKH);
    PRINT N'- [TAIKHOANHOIVIEN] Da tao Index loc Ngay dang ky (IX_TAIKHOANHOIVIEN_NgayDangKy_Include_MaKH).';
END
GO

-- =============================================
-- 5. Tối ưu các truy vấn đặc biệt
-- =============================================
-- =============================================
-- THỐNG KÊ KHÁCH HÀNG ĐÃ LÂU KHÔNG QUAY LẠI
-- =============================================

-- 1. DỌN DẸP INDEX CŨ (ĐỂ TRÁNH TRÙNG LẶP/XUNG ĐỘT)
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOADON_Fix_MissingIndex')
    DROP INDEX IX_HOADON_Fix_MissingIndex ON HOADON;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PHIEUDAT_Fix_Performance')
    DROP INDEX IX_PHIEUDAT_Fix_Performance ON PHIEUDAT;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HOADON_TraCuuNgay')
    DROP INDEX IX_HOADON_TraCuuNgay ON HOADON;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PHIEUDAT_TraCuuNhanh')
    DROP INDEX IX_PHIEUDAT_TraCuuNhanh ON PHIEUDAT;
GO

-- 2. ĐẢM BẢO CỘT TÍNH TOÁN ĐÃ CÓ (BẮT BUỘC)
-- Nếu chưa có cột _Date, script này sẽ tự tạo
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PHIEUDAT') AND name = 'NgayDat_Date')
BEGIN
    ALTER TABLE PHIEUDAT ADD NgayDat_Date AS CAST(ThoiGianDat AS DATE) PERSISTED;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('HOADON') AND name = 'NgayLapHD_Date')
BEGIN
    ALTER TABLE HOADON ADD NgayLapHD_Date AS CAST(ThoiGianLapHD AS DATE) PERSISTED;
END
GO

-- 3. TẠO INDEX 
-- Key: NgayLapHD_Date (Để lọc nhanh phạm vi ngày)
-- Include: MaHD (Để Join bảng Thanh toán), HMaNV (Để Join bảng Lịch sử công tác)
CREATE NONCLUSTERED INDEX [IX_HOADON_MissingIndex_Fix]
ON [dbo].[HOADON] ([NgayLapHD_Date])
INCLUDE ([MaHD], [HMaNV]);
GO

-- Key: NgayDat_Date (Để lọc nhanh phạm vi ngày trong subquery NOT EXISTS)
-- Include: MaCN (Để lọc theo chi nhánh)
CREATE NONCLUSTERED INDEX [IX_PHIEUDAT_MissingIndex_Fix]
ON [dbo].[PHIEUDAT] ([NgayDat_Date])
INCLUDE ([MaCN]);
GO

-- Index cho bảng THONGTINTHANHTOAN (Để khớp với MaHD từ bảng Hóa đơn)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TTTT_MaKH_MaHD')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TTTT_MaKH_MaHD]
    ON [dbo].[THONGTINTHANHTOAN] ([MaKH])
    INCLUDE ([MaHD]);
END
GO

-- =============================================
-- TOP 10 VACXIN SỬ DỤNG NHIỀU NHẤT
-- =============================================
-- 1. DỌN DẸP INDEX CŨ (ĐỂ TRÁNH XUNG ĐỘT VÀ LỖI TÊN)
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TIEMPHONG_Fix')
    DROP INDEX IX_TIEMPHONG_Fix ON TIEMPHONG;
    
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TIEMPHONG_Raw_Compressed')
    DROP INDEX IX_TIEMPHONG_Raw_Compressed ON TIEMPHONG;
GO

-- 2. THIẾT LẬP PARTITION (CHIA NHỎ DỮ LIỆU THEO NĂM)
IF NOT EXISTS (SELECT * FROM sys.partition_functions WHERE name = 'PF_ThoiGian')
BEGIN
    CREATE PARTITION FUNCTION PF_ThoiGian (DATETIME)
    AS RANGE RIGHT FOR VALUES ('2022-01-01', '2023-01-01', '2024-01-01', '2025-01-01', '2026-01-01');
END

IF NOT EXISTS (SELECT * FROM sys.partition_schemes WHERE name = 'PS_ThoiGian')
BEGIN
    CREATE PARTITION SCHEME PS_ThoiGian
    AS PARTITION PF_ThoiGian
    ALL TO ([PRIMARY]);
END
GO

-- 3. TÁI CẤU TRÚC BẢNG TIEMPHONG
-- 3.1. Tạo cột tính toán "Bẫy" (Khớp với WHERE CAST(...) trong Procedure)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('TIEMPHONG') AND name = 'NgayTiem_Date')
BEGIN
    ALTER TABLE TIEMPHONG ADD NgayTiem_Date AS CAST(ThoiGianTiem AS DATE) PERSISTED;
END
GO

-- 3.2. Cài đặt Partition lên Khóa Chính
DECLARE @pkName NVARCHAR(128);
SELECT @pkName = name FROM sys.indexes WHERE object_id = OBJECT_ID('TIEMPHONG') AND is_primary_key = 1;

IF @pkName IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX) = 'ALTER TABLE TIEMPHONG DROP CONSTRAINT ' + @pkName;
    EXEC(@sql);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TIEMPHONG') AND is_primary_key = 1)
BEGIN
    ALTER TABLE TIEMPHONG 
    ADD CONSTRAINT PK_TIEMPHONG_Partition 
    PRIMARY KEY CLUSTERED (TMaGD, ThoiGianTiem)
    ON PS_ThoiGian(ThoiGianTiem);
END
GO

-- 4. TẠO INDEX
-- [INDEX 1]: "The Solver"
-- Có Compression để giảm chi phí Seek xuống thấp nhất.
CREATE NONCLUSTERED INDEX [IX_TIEMPHONG_Fix]
ON [dbo].[TIEMPHONG] ([NgayTiem_Date]) -- Key: Cột tính toán
INCLUDE ([VMaSP], [BMaNV])             -- Include: Dữ liệu cần thiết
WITH (
    DATA_COMPRESSION = PAGE,
    FILLFACTOR = 90
)
ON PS_ThoiGian(ThoiGianTiem);
GO

-- [INDEX 2]: "The Backup" (Giải quyết trường hợp SQL muốn quét theo thời gian gốc)
CREATE NONCLUSTERED INDEX [IX_TIEMPHONG_Raw_Compressed]
ON [dbo].[TIEMPHONG] ([ThoiGianTiem])  -- Key: Cột gốc
INCLUDE ([VMaSP], [BMaNV])
WITH (
    DATA_COMPRESSION = PAGE,
    FILLFACTOR = 90
)
ON PS_ThoiGian(ThoiGianTiem);
GO

select* from KHACHHANG

select * from taikhoanhoivien where TenDangNhap = 'atu21'