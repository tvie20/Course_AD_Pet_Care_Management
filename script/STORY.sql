USE PetCareX;
GO

CHECKPOINT; 
DBCC DROPCLEANBUFFERS; 
SET STATISTICS IO ON;

/*
** Truy vấn 01: Thống kê số lượng khách hàng mới
*/
CREATE PROCEDURE sp_T01_KhachHangMoi
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayTiepTheo DATE = DATEADD(DAY, 1, @NgayKetThuc);

    SELECT COUNT(DISTINCT tk.MaKH) AS SoLuongKhachMoi
    FROM TAIKHOANHOIVIEN tk
    JOIN THUCUNG tc ON tk.MaKH = tc.MaKH
    JOIN HOADON hd ON tc.MaTC = hd.MaTC
    JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
    WHERE 
        tk.NgayDangKy >= @NgayBatDau 
        AND tk.NgayDangKy < @NgayTiepTheo
        AND hd.ThoiGianLapHD >= CAST(tk.NgayDangKy AS DATE)
        AND hd.ThoiGianLapHD < DATEADD(DAY, 1, CAST(tk.NgayDangKy AS DATE))
        AND hd.ThoiGianLapHD >= ls.NgayVaoLam 
        AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())
        AND (@MaChiNhanh IS NULL OR ls.MaCN = @MaChiNhanh);
END;
GO

-- EXEC sp_T01_KhachHangMoi 'CN00000001', '2024-01-01', '2024-01-31'

/*
** Truy vấn 02: Thống kê số lượng khách hàng quay lại
*/
CREATE OR ALTER PROCEDURE sp_T02_KhachHangQuayLai
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Moc6ThangTruoc DATE = DATEADD(MONTH, -6, @NgayBatDau);
    DECLARE @NgayTiepTheo DATE = DATEADD(DAY, 1, @NgayKetThuc);

    WITH KhachTrongKy AS (
        SELECT DISTINCT tc.MaKH
        FROM HOADON hd
        JOIN THUCUNG tc ON hd.MaTC = tc.MaTC
        JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
        WHERE 
            hd.ThoiGianLapHD >= @NgayBatDau 
            AND hd.ThoiGianLapHD < @NgayTiepTheo
            AND hd.ThoiGianLapHD >= ls.NgayVaoLam 
            AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())
            AND (@MaChiNhanh IS NULL OR ls.MaCN = @MaChiNhanh)
    )
    SELECT COUNT(DISTINCT ktk.MaKH) AS SoLuongKhachQuayLai
    FROM KhachTrongKy ktk
    WHERE 
        NOT EXISTS (
            SELECT 1 
            FROM HOADON hd_gap
            JOIN THUCUNG tc_gap ON hd_gap.MaTC = tc_gap.MaTC
            WHERE tc_gap.MaKH = ktk.MaKH
              AND hd_gap.ThoiGianLapHD >= @Moc6ThangTruoc
              AND hd_gap.ThoiGianLapHD < @NgayBatDau
        )
        AND EXISTS (
            SELECT 1 
            FROM HOADON hd_old
            JOIN THUCUNG tc_old ON hd_old.MaTC = tc_old.MaTC
            WHERE tc_old.MaKH = ktk.MaKH
              AND hd_old.ThoiGianLapHD < @Moc6ThangTruoc
        );
END;
GO

EXEC sp_T02_KhachHangQuayLai 'CN00000001', '2024-01-01', '2024-01-31'
/*
** Truy vấn 03: Thống kê số lượng khách ngừng hoạt động
*/
CREATE OR ALTER PROCEDURE sp_T03_KhachNgungHoatDong
    @MaChiNhanh CHAR(10) = NULL,     
    @NgayKetThuc DATE,               
    @SoNgayKhongHoatDong INT = 90    
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayBatDauXetDuyet DATE = DATEADD(DAY, -@SoNgayKhongHoatDong, @NgayKetThuc);

    SELECT
        COUNT(kh.MaKH) AS SoLuongKhachNgungHD
    FROM KHACHHANG kh
    WHERE 
        NOT EXISTS (
            SELECT 1 
            FROM PHIEUDAT pd 
            WHERE pd.MaKH = kh.MaKH 
              AND CAST(pd.ThoiGianDat AS DATE) BETWEEN @NgayBatDauXetDuyet AND @NgayKetThuc
              AND (@MaChiNhanh IS NULL OR pd.MaCN = @MaChiNhanh)
        )
        
        AND 
        
        NOT EXISTS (
            SELECT 1 
            FROM THONGTINTHANHTOAN tttt
            JOIN HOADON hd ON tttt.MaHD = hd.MaHD
            LEFT JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
                AND CAST(hd.ThoiGianLapHD AS DATE) >= ls.NgayVaoLam
                AND (ls.NgayChuyen IS NULL OR CAST(hd.ThoiGianLapHD AS DATE) <= ls.NgayChuyen)
            WHERE 
                tttt.MaKH = kh.MaKH
                AND CAST(hd.ThoiGianLapHD AS DATE) BETWEEN @NgayBatDauXetDuyet AND @NgayKetThuc
                AND (@MaChiNhanh IS NULL OR ls.MaCN = @MaChiNhanh)
        )
    ORDER BY SoLuongKhachNgungHD DESC;
END;
GO

EXEC sp_T03_KhachNgungHoatDong 'CN00000001', '2024-01-01', 180

/*
** Truy vấn 04: Thống kê cơ cấu hạng thành viên
*/
CREATE PROCEDURE sp_T04_CoCauHangThanhVien
    @MaChiNhanh CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @MaChiNhanh IS NULL
    BEGIN
        SELECT 
            CapTV AS HangThanhVien,
            COUNT(MaKH) AS SoLuongKhach,
            CAST(COUNT(MaKH) * 100.0 / SUM(COUNT(MaKH)) OVER() AS DECIMAL(5, 2)) AS TyLePhanTram
        FROM KHACHHANG
        GROUP BY CapTV
        ORDER BY SoLuongKhach DESC;
        RETURN;
    END

    SELECT 
        k.CapTV AS HangThanhVien,
        COUNT(DISTINCT k.MaKH) AS SoLuongKhach,
        
        CAST(
            COUNT(DISTINCT k.MaKH) * 100.0 / SUM(COUNT(DISTINCT k.MaKH)) OVER() 
        AS DECIMAL(5, 2)) AS TyLePhanTram

    FROM HOADON hd
    JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
    JOIN THUCUNG tc ON hd.MaTC = tc.MaTC
    JOIN KHACHHANG k ON tc.MaKH = k.MaKH
    
    WHERE 
        ls.MaCN = @MaChiNhanh
        AND hd.ThoiGianLapHD >= ls.NgayVaoLam
        AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())
    
    GROUP BY k.CapTV
    ORDER BY SoLuongKhach DESC;
END;
GO

-- EXEC sp_T04_CoCauHangThanhVien 

/*
** Truy vấn 05: Thống kê điểm thưởng
*/
CREATE PROCEDURE sp_T05_ThongKeDiemThuong
    @MaChiNhanh CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @MaChiNhanh IS NULL
    BEGIN
        SELECT 
            SUM(ISNULL(DiemLoyalty, 0)) AS TongDiemTichLuy,
            CAST(SUM(ISNULL(DiemLoyalty, 0)) AS BIGINT) * 50000 AS GiaTriQuyDoi
        FROM KHACHHANG;
        RETURN;
    END

    SELECT 
        SUM(ISNULL(kh.DiemLoyalty, 0)) AS TongDiemTichLuy,
        CAST(SUM(ISNULL(kh.DiemLoyalty, 0)) AS BIGINT) * 50000 AS GiaTriQuyDoi
    FROM KHACHHANG kh
    WHERE EXISTS (
        SELECT 1 
        FROM HOADON hd
        JOIN THUCUNG tc ON hd.MaTC = tc.MaTC
        JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
        WHERE 
            tc.MaKH = kh.MaKH 
            AND ls.MaCN = @MaChiNhanh
            AND hd.ThoiGianLapHD >= ls.NgayVaoLam
            AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())
    );
END;
GO

-- EXEC sp_T05_ThongKeDiemThuong 
/*
** Truy vấn 06: Thống kê trạng thái hạng thành viên
*/
CREATE PROCEDURE sp_T06_TrangThaiHangThanhVien
    @MaChiNhanh VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MotNamTruoc DATE = DATEADD(DAY, -365, GETDATE());

    SELECT 
        kh.MaKH, 
        kh.HoTenKH, 
        kh.CapTV AS HangHienTai, 
        CAST(ISNULL(ct.TongChiTieu, 0) AS BIGINT) AS TongChiTieuNamQua,
        ctv.ChiTieuGiuHang AS NguongGiuHang,
        
        CASE
            WHEN ISNULL(ct.TongChiTieu, 0) < ctv.ChiTieuGiuHang THEN N'Nguy cơ xuống hạng'
            WHEN ISNULL(ct.TongChiTieu, 0) >= 12000000 AND kh.CapTV != 'VIP' THEN N'Đủ điều kiện lên VIP'
            ELSE N'An toàn / Không đổi'
        END AS TrangThai

    FROM KHACHHANG kh
    JOIN CAPTHANHVIEN ctv ON kh.CapTV = ctv.CapTV 
    LEFT JOIN (
        SELECT 
            tc.MaKH,
            SUM(ISNULL(hd.TongTien, 0) - ISNULL(hd.KhuyenMai, 0)) AS TongChiTieu
        FROM HOADON hd
        JOIN THUCUNG tc ON hd.MaTC = tc.MaTC
        JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
        WHERE 
            hd.ThoiGianLapHD >= @MotNamTruoc
            AND (@MaChiNhanh IS NULL OR (
                ls.MaCN = @MaChiNhanh
                AND hd.ThoiGianLapHD >= ls.NgayVaoLam
                AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())
            ))
        GROUP BY tc.MaKH
    ) AS ct ON kh.MaKH = ct.MaKH
    
    WHERE 
        (ISNULL(ct.TongChiTieu, 0) < ctv.ChiTieuGiuHang)
        OR 
        (ISNULL(ct.TongChiTieu, 0) >= 12000000 AND kh.CapTV != 'VIP')
    
    ORDER BY TongChiTieuNamQua DESC;
END;
GO

-- EXEC sp_T06_TrangThaiHangThanhVien 'CN00000001'
/*
   Truy vấn T07: Phân bổ thú cưng theo Loài/Giống
*/
CREATE PROCEDURE sp_T07_PhanBoThuCung
    @MaChiNhanh CHAR(10) = NULL
AS
BEGIN
    SELECT 
        tc.Loai AS Loai,
        tc.Giong AS Giong,
        COUNT(tc.MaTC) AS SoLuongThuCung
    FROM THUCUNG tc
    WHERE (@MaChiNhanh IS NULL OR EXISTS (
        SELECT 1 
        FROM HOADON hd
        JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
        WHERE hd.MaTC = tc.MaTC 
          AND ls.MaCN = @MaChiNhanh
          AND hd.ThoiGianLapHD BETWEEN ls.NgayVaoLam AND ISNULL(ls.NgayChuyen, GETDATE() + 1)
    ))
    GROUP BY tc.Loai, tc.Giong
    ORDER BY SoLuongThuCung DESC;
END;
GO

-- EXEC sp_T07_PhanBoThuCung 'CN00000001'
/*
   Truy vấn T08: Các bệnh thường gặp
*/
CREATE PROCEDURE sp_T08_BenhThuongGap
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        kb.ChanDoan AS TenBenh,
        COUNT(kb.KMaGD) AS SoCaBenh
    FROM KHAMBENH kb
    JOIN LICHSUCONGTAC ls ON kb.BMaNV = ls.MaNV 
        AND kb.NgayKham >= ls.NgayVaoLam 
        AND kb.NgayKham <= ISNULL(ls.NgayChuyen, GETDATE())
    WHERE 
        kb.NgayKham BETWEEN @NgayBatDau AND @NgayKetThuc
        AND (
            @MaChiNhanh IS NULL 
            OR ls.MaCN = @MaChiNhanh
        )
    GROUP BY kb.ChanDoan
    ORDER BY SoCaBenh DESC;
END;
GO

-- EXEC sp_T08_BenhThuongGap 'CN00000001', '2024-01-01', '2024-01-31'
/*
   Truy vấn T09: Hiệu quả gói vắc-xin
*/
CREATE PROCEDURE sp_T09_ThongKeVacXin
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN tp.MaGT IS NULL THEN N'Tiêm lẻ' 
            ELSE N'Đăng ký gói' 
        END AS HinhThucTiem,
        COUNT(tp.TMaGD) AS TongMuiTiem
    FROM TIEMPHONG tp
    JOIN LICHSUCONGTAC ls ON tp.BMaNV = ls.MaNV
        AND tp.ThoiGianTiem >= ls.NgayVaoLam
        AND tp.ThoiGianTiem <= ISNULL(ls.NgayChuyen, GETDATE())
    WHERE 
        tp.ThoiGianTiem BETWEEN @NgayBatDau AND @NgayKetThuc
        AND (
            @MaChiNhanh IS NULL 
            OR ls.MaCN = @MaChiNhanh
        )
    GROUP BY 
        CASE WHEN tp.MaGT IS NULL THEN N'Tiêm lẻ' ELSE N'Đăng ký gói' END;
END;
GO

EXEC sp_T09_ThongKeVacXin 'CN00000001', '2024-01-01', '2024-01-31'
/*
   Truy vấn T10: Vắc-xin sử dụng nhiều nhất
*/
CREATE OR ALTER PROCEDURE sp_T10_Top10_Vacxin
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 10
        sp.MaSP AS MaVacXin,
        sp.TenSP AS TenVacXin,
        vx.LoaiVacXin,
        COUNT(tp.TMaGD) AS SoLuotSuDung
    FROM TIEMPHONG tp
    JOIN VACXIN vx ON tp.VMaSP = vx.VMaSP
    JOIN SANPHAM sp ON vx.VMaSP = sp.MaSP
    JOIN LICHSUCONGTAC ls ON tp.BMaNV = ls.MaNV 
    WHERE 
        CAST(tp.ThoiGianTiem AS DATE) BETWEEN @NgayBatDau AND @NgayKetThuc
        AND CAST(tp.ThoiGianTiem AS DATE) >= ls.NgayVaoLam
        AND (ls.NgayChuyen IS NULL OR CAST(tp.ThoiGianTiem AS DATE) <= ls.NgayChuyen)
        AND (@MaChiNhanh IS NULL OR ls.MaCN = @MaChiNhanh)

    GROUP BY sp.MaSP, sp.TenSP, vx.LoaiVacXin
    ORDER BY SoLuotSuDung DESC;
END;
GO

-- EXEC sp_T10_Top10_Vacxin NULL, '2024-01-01', '2024-12-31'

/*
   Truy vấn T11: Lịch sử Khám bệnh và Tiêm phòng cho một thú cưng cụ thể
*/
CREATE PROCEDURE sp_T11_HoSoBenhAnThuCung
    @MaThuCung CHAR(10)
AS
BEGIN
    SELECT DISTINCT
        'KHAM-BENH' AS LoaiDichVu,
        kb.KMaGD AS GiaoDich,
        kb.NgayKham AS Ngay,
        kb.ChanDoan AS ChiTiet,
        nv.HoTenNV AS BacSi
    FROM KHAMBENH kb
    JOIN NHANVIEN nv ON kb.BMaNV = nv.MaNV
    JOIN CHITIETHOADON cthd ON kb.KMaGD = cthd.MaGD
    JOIN HOADON hd ON cthd.MaHD = hd.MaHD
    WHERE hd.MaTC = @MaThuCung
    
    UNION ALL
    
    SELECT DISTINCT
        'TIEM-PHONG' AS LoaiDichVu,
        tp.TMaGD AS GiaoDich,
        tp.ThoiGianTiem AS Ngay,
        CONCAT(vx.LoaiVacxin, ' - Lieu: ', tp.LieuLuongTiem) AS ChiTiet,
        nv.HoTenNV AS BacSi
    FROM TIEMPHONG tp
    JOIN NHANVIEN nv ON tp.BMaNV = nv.MaNV
    JOIN VACXIN vx ON tp.VMaSP = vx.VMaSP
    JOIN CHITIETHOADON cthd ON tp.TMaGD = cthd.MaGD
    JOIN HOADON hd ON cthd.MaHD = hd.MaHD
    WHERE hd.MaTC = @MaThuCung
    
    ORDER BY Ngay DESC;
END;
GO

-- EXEC sp_T11_HoSoBenhAnThuCung 'TC00000001'
/*
   Truy vấn T12: Sản phẩm bán chạy nhất
*/
CREATE OR ALTER PROCEDURE sp_T12_SanPhamBanChay
    @MaCN VARCHAR(10) = NULL,
    @TopN INT = 10
AS
BEGIN
    SELECT TOP (@TopN)
        sp.TenSP AS TenSanPham,
        SUM(ct.SoLuong) AS TongSoLuongBan
    FROM SANPHAM sp
    JOIN CHITIETHOADON ct ON sp.MaSP = ct.MaSP
    JOIN HOADON hd ON ct.MaHD = hd.MaHD
    JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
    WHERE (@MaCN IS NULL OR ls.MaCN = @MaCN)
    AND (hd.ThoiGianLapHD >= ls.NgayVaoLam)
    AND (ls.NgayChuyen IS NULL OR hd.ThoiGianLapHD < ls.NgayChuyen)
    GROUP BY sp.TenSP
    ORDER BY TongSoLuongBan DESC
END;
GO

-- EXEC sp_T12_SanPhamBanChay 
/*
   Truy vấn T13: Cảnh báo hết hạn (Vắc-xin & Thuốc)
*/
CREATE PROCEDURE sp_T13_CanhBaoHetHan
    @NguongNgay INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NgayGioiHan DATE = DATEADD(DAY, @NguongNgay, GETDATE());
    DECLARE @HomNay DATE = CAST(GETDATE() AS DATE);

    SELECT 
        Loai,
        Ten,
        HanSuDung,
        SoNgayConLai,
        TonKho,
        CASE 
            WHEN SoNgayConLai < 0 THEN N'Đã hết hạn'
            WHEN SoNgayConLai = 0 THEN N'Hết hạn hôm nay'
            ELSE N'Sắp hết hạn'
        END AS TrangThai
    FROM (
        SELECT 
            'VAC-XIN' AS Loai, 
            sp.TenSP AS Ten, 
            vx.HSD AS HanSuDung,
            DATEDIFF(DAY, @HomNay, vx.HSD) AS SoNgayConLai,
            sp.SLTonKho AS TonKho
        FROM VACXIN vx 
        JOIN SANPHAM sp ON vx.VMaSP = sp.MaSP
        WHERE 
            vx.HSD <= @NgayGioiHan
            AND sp.SLTonKho > 0
        
        UNION ALL
        
        SELECT 
            'THUOC' AS Loai, 
            sp.TenSP AS Ten, 
            t.HSD AS HanSuDung, 
            DATEDIFF(DAY, @HomNay, t.HSD) AS SoNgayConLai,
            sp.SLTonKho AS TonKho
        FROM THUOC t 
        JOIN SANPHAM sp ON t.TMaSP = sp.MaSP
        WHERE 
            t.HSD <= @NgayGioiHan
            AND sp.SLTonKho > 0
    ) AS KetQua
    
    ORDER BY SoNgayConLai ASC;
END;
GO

-- EXEC sp_T13_CanhBaoHetHan

/*
   Truy vấn T14: Mức tồn kho hiện tại
*/
CREATE PROCEDURE sp_T14_TonKhoHienTai
AS
BEGIN
    SELECT MaSP, TenSP, SLTonKho AS SoLuongTon, DonViTinh AS DonVi
    FROM SANPHAM
    ORDER BY SLTonKho DESC;
END;
GO

/*
   Truy vấn T15: Dự báo nhập hàng
*/
CREATE PROCEDURE sp_T15_DuBaoNhapHang
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BaThangTruoc DATE = DATEADD(MONTH, -3, GETDATE());

    SELECT 
        sp.MaSP,
        sp.TenSP,
        sp.DonViTinh,
        sp.SLTonKho AS TonKhoHienTai,
        CAST(ROUND(ISNULL(BangTam.TrungBinhBanThang, 0), 0) AS INT) AS TrungBinhBanThang,
        CAST(CEILING((ISNULL(BangTam.TrungBinhBanThang, 0) * 1.5) - sp.SLTonKho) AS INT) AS SoLuongCanNhap

    FROM SANPHAM sp
    LEFT JOIN (
        SELECT 
            ct.MaSP,
            SUM(ct.SoLuong) / 3.0 AS TrungBinhBanThang
        FROM CHITIETHOADON ct
        JOIN HOADON hd ON ct.MaHD = hd.MaHD
        WHERE hd.ThoiGianLapHD >= @BaThangTruoc
        GROUP BY ct.MaSP
    ) AS BangTam ON sp.MaSP = BangTam.MaSP

    WHERE 
        (ISNULL(BangTam.TrungBinhBanThang, 0) * 1.5) > sp.SLTonKho

    ORDER BY SoLuongCanNhap DESC;
END;
GO

-- EXEC sp_T15_DuBaoNhapHang 
/*
   Truy vấn T16: Báo cáo tổng doanh thu
*/
CREATE PROCEDURE sp_T16_BaoCaoDoanhThu
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayTiepTheo DATE = DATEADD(DAY, 1, @NgayKetThuc);

    SELECT 
        CAST(hd.ThoiGianLapHD AS DATE) AS NgayDoanhThu,
        COUNT(DISTINCT hd.MaHD) AS TongHoaDon,
        SUM(hd.TongTien) AS DoanhThuGop,
        SUM(hd.TongTien - ISNULL(hd.KhuyenMai, 0)) AS DoanhThuRong,
        SUM(ISNULL(hd.KhuyenMai, 0)) AS TongTienKhuyenMai

    FROM HOADON hd
    JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
        AND hd.ThoiGianLapHD >= ls.NgayVaoLam
        AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())

    WHERE 
        hd.ThoiGianLapHD >= @NgayBatDau 
        AND hd.ThoiGianLapHD < @NgayTiepTheo
        AND (@MaChiNhanh IS NULL OR ls.MaCN = @MaChiNhanh)
    
    GROUP BY CAST(hd.ThoiGianLapHD AS DATE)
    ORDER BY NgayDoanhThu;
END;
GO

-- EXEC sp_T16_BaoCaoDoanhThu NULL, '2024-01-01', '2024-01-31'
/*
   Truy vấn T17: Giá trị đơn hàng trung bình
*/
CREATE PROCEDURE sp_T17_GiaTriDonHangTrungBinh
    @MaChiNhanh CHAR(10) = NULL,
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayTiepTheo DATE = DATEADD(DAY, 1, @NgayKetThuc);

    SELECT 
        COUNT(hd.MaHD) AS TongSoDonHang,

        CASE 
            WHEN COUNT(hd.MaHD) = 0 THEN 0
            ELSE CAST(SUM(hd.TongTien - ISNULL(hd.KhuyenMai, 0)) / COUNT(hd.MaHD) AS INT)
        END AS AOV_ThucTe,

        CASE 
            WHEN COUNT(hd.MaHD) = 0 THEN 0
            ELSE CAST(SUM(hd.TongTien) / COUNT(hd.MaHD) AS INT)
        END AS AOV_Gop

    FROM HOADON hd
    JOIN LICHSUCONGTAC ls ON hd.HMaNV = ls.MaNV
        AND hd.ThoiGianLapHD >= ls.NgayVaoLam
        AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())

    WHERE 
        hd.ThoiGianLapHD >= @NgayBatDau 
        AND hd.ThoiGianLapHD < @NgayTiepTheo
        AND (@MaChiNhanh IS NULL OR ls.MaCN = @MaChiNhanh);
END;
GO

-- EXEC sp_T17_GiaTriDonHangTrungBinh 'CN00000001', '2024-01-01', '2024-01-31'

/*
   Truy vấn T18: So sánh chi nhánh
*/
CREATE PROCEDURE sp_T18_SoSanhChiNhanh
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayTiepTheo DATE = DATEADD(DAY, 1, @NgayKetThuc);

    SELECT 
        cn.MaCN,
        cn.TenCN AS TenChiNhanh,
        COUNT(DISTINCT hd.MaHD) AS TongHoaDon,
        CAST(ISNULL(SUM(hd.TongTien - ISNULL(hd.KhuyenMai, 0)), 0) AS BIGINT) AS DoanhThuThucTe

    FROM CHINHANH cn

    LEFT JOIN LICHSUCONGTAC ls ON cn.MaCN = ls.MaCN
    
    LEFT JOIN HOADON hd ON ls.MaNV = hd.HMaNV
        AND hd.ThoiGianLapHD >= ls.NgayVaoLam
        AND hd.ThoiGianLapHD <= ISNULL(ls.NgayChuyen, GETDATE())
        AND hd.ThoiGianLapHD >= @NgayBatDau
        AND hd.ThoiGianLapHD < @NgayTiepTheo

    GROUP BY cn.MaCN, cn.TenCN
    ORDER BY DoanhThuThucTe DESC;
END;
GO

--EXEC sp_T18_SoSanhChiNhanh '2024-01-01', '2024-01-31'