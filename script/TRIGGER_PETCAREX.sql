USE PetCareX;
GO

--USE PetCareX_Optimized;
--GO

/* ==================================================================================
   PHẦN 1: TRIGGER KIỂM TRA RÀNG BUỘC (VALIDATION)
   ================================================================================== */

-- 1. Kiểm tra Ngày đăng ký tài khoản phải lớn hơn Ngày sinh khách hàng
CREATE OR ALTER TRIGGER trg_Check_NgayDangKy_NgaySinh
ON TAIKHOANHOIVIEN
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM INSERTED i
        JOIN KHACHHANG k ON i.MaKH = k.MaKH
        WHERE i.NgayDangKy <= k.NgaySinhKH
    )
    BEGIN
        RAISERROR(N'Lỗi: Ngày đăng ký tài khoản phải sau ngày sinh của khách hàng.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- 2. Kiểm tra Ngày lập toa thuốc phải sau hoặc bằng Ngày khám
CREATE OR ALTER TRIGGER trg_Check_ToaThuoc_NgayKham
ON TOATHUOC
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM INSERTED t
        JOIN KHAMBENH k ON t.KMaGD = k.KMaGD
        WHERE t.ThoiGianLapTT < k.NgayKham
    )
    BEGIN
        RAISERROR(N'Lỗi: Thời gian lập toa thuốc không thể trước thời gian khám bệnh.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- 3. Kiểm tra Vắc-xin phải còn hạn sử dụng mới được tiêm

CREATE OR ALTER TRIGGER trg_Check_HSD_Vacxin
ON TIEMPHONG
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM INSERTED tp
        JOIN VACXIN v ON tp.VMaSP = v.VMaSP
        WHERE CAST(tp.ThoiGianTiem AS DATE) > v.HSD
    )
    BEGIN
        RAISERROR(N'Lỗi: Vắc-xin đã hết hạn sử dụng, không thể thực hiện tiêm phòng.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- 4. Kiểm tra Người thanh toán hóa đơn phải là Chủ sở hữu thú cưng

CREATE OR ALTER TRIGGER trg_Check_ChuSoHuu_HoaDon
ON THONGTINTHANHTOAN
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM INSERTED tt
        JOIN HOADON hd ON tt.MaHD = hd.MaHD
        JOIN THUCUNG tc ON hd.MaTC = tc.MaTC
        WHERE tt.MaKH <> tc.MaKH
    )
    BEGIN
        RAISERROR(N'Lỗi: Thông tin khách hàng thanh toán không khớp với chủ sở hữu thú cưng.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- 5. Kiểm tra Chi tiết hóa đơn: Phải là Sản phẩm HOẶC Dịch vụ (Không được cả 2 hoặc NULL)

CREATE OR ALTER TRIGGER trg_Check_ChiTietHoaDon_Loai
ON CHITIETHOADON
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM INSERTED 
        WHERE (MaSP IS NOT NULL AND MaGD IS NOT NULL)
           OR (MaSP IS NULL AND MaGD IS NULL)
    )
    BEGIN
        RAISERROR(N'Lỗi: Dòng chi tiết hóa đơn không hợp lệ (Phải chứa hoặc MaSP hoặc MaGD).', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

/* ==================================================================================
   PHẦN 2: TRIGGER TỰ ĐỘNG HÓA & TÍNH TOÁN (AUTOMATION)
   ================================================================================== */

-- 8. Quản lý Tồn kho tự động (Trừ khi bán, Cộng khi xóa/trả, Cập nhật khi sửa)

CREATE OR ALTER TRIGGER trg_QuanLy_TonKho_Full
ON CHITIETHOADON
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Xử lý hoàn trả kho (DELETE hoặc giá trị cũ của UPDATE)
    IF EXISTS (SELECT * FROM DELETED)
    BEGIN
        UPDATE sp
        SET sp.SLTonKho = sp.SLTonKho + d.SoLuong
        FROM SANPHAM sp
        JOIN DELETED d ON sp.MaSP = d.MaSP
        WHERE d.MaSP IS NOT NULL; -- Chỉ xử lý nếu dòng đó là bán Sản phẩm
    END

    -- Xử lý trừ kho (INSERT hoặc giá trị mới của UPDATE)
    IF EXISTS (SELECT * FROM INSERTED)
    BEGIN
        -- Kiểm tra tồn kho trước
        IF EXISTS (
            SELECT 1
            FROM INSERTED i
            JOIN SANPHAM sp ON i.MaSP = sp.MaSP
            WHERE i.MaSP IS NOT NULL AND sp.SLTonKho < i.SoLuong
        )
        BEGIN
            RAISERROR(N'Lỗi: Số lượng xuất bán vượt quá tồn kho hiện tại.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Trừ kho
        UPDATE sp
        SET sp.SLTonKho = sp.SLTonKho - i.SoLuong
        FROM SANPHAM sp
        JOIN INSERTED i ON sp.MaSP = i.MaSP
        WHERE i.MaSP IS NOT NULL;
    END
END;
GO

-- 9. Tự động cộng Điểm Loyalty sau khi thanh toán xong (1 điểm = 50.000 VNĐ)

CREATE OR ALTER TRIGGER trg_CapNhat_DiemLoyalty
ON THONGTINTHANHTOAN
AFTER INSERT, UPDATE
AS
BEGIN
    -- Chỉ xử lý khi trạng thái chuyển sang 'Đã thanh toán'
    IF EXISTS (SELECT 1 FROM INSERTED WHERE TrangThaiTT = N'Đã thanh toán')
    BEGIN
        UPDATE kh
        SET kh.DiemLoyalty = kh.DiemLoyalty + (CAST(hd.TongTien AS INT) / 50000)
        FROM KHACHHANG kh
        JOIN INSERTED i ON kh.MaKH = i.MaKH
        JOIN HOADON hd ON i.MaHD = hd.MaHD
        WHERE i.TrangThaiTT = N'Đã thanh toán';
    END
END;
GO

-- 10. Tự động Xét hạng thành viên (VIP/Thân thiết/Cơ bản) dựa trên chi tiêu 12 tháng
CREATE OR ALTER TRIGGER trg_Auto_Update_MembershipRank
ON THONGTINTHANHTOAN
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM INSERTED WHERE TrangThaiTT = N'Đã thanh toán')
    BEGIN
        DECLARE @MaKH CHAR(10);
        DECLARE @TotalSpent DECIMAL(18, 0);
        
        -- Lấy MaKH vừa thanh toán (Lưu ý: Trigger này giả định xử lý từng row hoặc cursor nếu bulk update, ở đây viết cho single row)
        SELECT TOP 1 @MaKH = MaKH FROM INSERTED;

        -- Tính tổng chi tiêu 12 tháng gần nhất
        SELECT @TotalSpent = ISNULL(SUM(hd.TongTien), 0)
        FROM HOADON hd
        JOIN THONGTINTHANHTOAN tt ON hd.MaHD = tt.MaHD
        WHERE tt.MaKH = @MaKH 
          AND tt.TrangThaiTT = N'Đã thanh toán'
          AND tt.ThoiGianTT >= DATEADD(YEAR, -1, GETDATE());

        -- Cập nhật hạng
        UPDATE KHACHHANG
        SET CapTV = CASE 
            WHEN @TotalSpent >= 12000000 THEN 'VIP'
            WHEN @TotalSpent >= 5000000 THEN N'Thân thiết'
            ELSE N'Cơ bản'
        END,
        NgayDatCap = GETDATE()
        WHERE MaKH = @MaKH;
    END
END;
GO

/* ==================================================================================
   PHẦN 3: TRIGGER BẢO VỆ QUY TRÌNH (PROCESS SECURITY)
   ================================================================================== */

-- 11. KHÓA hóa đơn: Không cho sửa/xóa chi tiết nếu hóa đơn đã thanh toán
CREATE OR ALTER TRIGGER trg_Protect_Paid_Invoice
ON CHITIETHOADON
AFTER UPDATE, DELETE, INSERT
AS
BEGIN
    DECLARE @MaHD CHAR(15);
    SELECT TOP 1 @MaHD = ISNULL(i.MaHD, d.MaHD)
    FROM INSERTED i FULL OUTER JOIN DELETED d ON i.MaHD = d.MaHD;

    IF EXISTS (
        SELECT 1 
        FROM THONGTINTHANHTOAN 
        WHERE MaHD = @MaHD AND TrangThaiTT = N'Đã thanh toán'
    )
    BEGIN
        RAISERROR(N'Lỗi quy trình: Hóa đơn đã thanh toán, không được phép chỉnh sửa chi tiết.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- 12. Kiểm soát Toa thuốc: Chỉ được kê "Thuốc", không được kê sản phẩm khác
CREATE OR ALTER TRIGGER trg_Validate_Drug_In_Prescription
ON CHITIETTOATHUOC
AFTER INSERT, UPDATE
AS
BEGIN
    -- Kiểm tra xem MaSP trong chi tiết toa có tồn tại trong bảng THUOC hay không
    IF EXISTS (
        SELECT 1 
        FROM INSERTED i
        LEFT JOIN THUOC t ON i.TMaSP = t.TMaSP
        WHERE t.TMaSP IS NULL
    )
    BEGIN
        RAISERROR(N'Lỗi y khoa: Sản phẩm được kê trong toa không phải là Thuốc hợp lệ.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- 13. Điều kiện Đánh giá: Chỉ được đánh giá khi hóa đơn đã thanh toán

CREATE OR ALTER TRIGGER trg_Check_Review_Condition
ON DANHGIA
AFTER INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM INSERTED i
        LEFT JOIN THONGTINTHANHTOAN tt ON i.MaHD = tt.MaHD
        WHERE tt.TrangThaiTT IS NULL OR tt.TrangThaiTT <> N'Đã thanh toán'
    )
    BEGIN
        RAISERROR(N'Lỗi quy trình: Khách hàng chỉ được đánh giá sau khi đã hoàn tất thanh toán.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

CREATE OR ALTER TRIGGER trg_LimitSlot_Timeslot
ON PHIEUDAT
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ chạy khi có thay đổi liên quan đến thời gian, trạng thái hoặc STT
    IF NOT (UPDATE(MaCN) OR UPDATE(ThoiGianHen) OR UPDATE(TrangThaiPD) OR UPDATE(STT))
        RETURN;

    -- 1. KIỂM TRA GIỚI HẠN 5 KHÁCH / KHUNG GIỜ 30 PHÚT
    -- Logic: Quy đổi ThoiGianHen về mốc bắt đầu của Block 30p để gom nhóm đếm
    IF EXISTS (
        SELECT 1
        FROM inserted i
        CROSS APPLY (
            -- Công thức làm tròn xuống 30 phút gần nhất (Floor)
            -- VD: 08:12 -> 08:00, 08:45 -> 08:30
            SELECT DATEADD(MINUTE, (DATEDIFF(MINUTE, 0, i.ThoiGianHen) / 30) * 30, 0) AS BlockStart
        ) AS Calc
        JOIN PHIEUDAT p ON p.MaCN = i.MaCN 
                        AND p.TrangThaiPD != N'Đã hủy'
                        -- Đếm các phiếu nằm trong cùng khung [BlockStart, BlockStart + 30p)
                        AND p.ThoiGianHen >= Calc.BlockStart 
                        AND p.ThoiGianHen < DATEADD(MINUTE, 30, Calc.BlockStart)
        GROUP BY i.MaCN, Calc.BlockStart
        HAVING COUNT(*) > 5
    )
    BEGIN
        RAISERROR (N'Lỗi: Quá tải khung giờ (Tối đa 5 phiếu/30 phút).', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- 2. KIỂM TRA TRÙNG SỐ THỨ TỰ (STT) TRONG NGÀY
    -- Logic: Trong cùng 1 ngày (Date part), cùng 1 chi nhánh, không được trùng STT
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN PHIEUDAT p ON p.MaCN = i.MaCN 
                        -- So sánh phần NGÀY của ThoiGianHen (bỏ qua phần giờ)
                        AND CAST(p.ThoiGianHen AS DATE) = CAST(i.ThoiGianHen AS DATE)
                        AND p.STT = i.STT -- Trùng STT
                        AND p.TrangThaiPD != N'Đã hủy'
                        -- Loại trừ chính dòng đang insert/update
                        AND (p.MaKH <> i.MaKH OR p.MaTC <> i.MaTC OR p.ThoiGianDat <> i.ThoiGianDat)
    )
    BEGIN
        RAISERROR (N'Lỗi: Số thứ tự (STT) này đã tồn tại trong ngày tại chi nhánh này.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO