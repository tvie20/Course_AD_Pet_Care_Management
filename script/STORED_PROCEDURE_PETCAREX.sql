USE PetCareX;
GO

/*USE PetCareX_Optimized;
GO*/

/* ==================================================================================
   SROTED PROCEDURE ĐẶT KHÁM
   ================================================================================== */

-- 1. Đăng ký Tài khoản (sp_DangKyTaiKhoan): T01, T02, T03, T04
CREATE OR ALTER PROCEDURE sp_DangKyTaiKhoan
    @HoTen NVARCHAR(100),
    @SDT VARCHAR(15),
    @Email VARCHAR(100),
    @CCCD VARCHAR(12),
    @GioiTinh NVARCHAR(10),
    @NgaySinh DATE,
    @TenDangNhap VARCHAR(50),
    @MatKhau VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Validation (Giữ nguyên như cũ)
        IF EXISTS (SELECT 1 FROM KHACHHANG WHERE SDTKH = @SDT)
            THROW 50001, N'Số điện thoại đã tồn tại.', 1;
        IF EXISTS (SELECT 1 FROM TAIKHOANHOIVIEN WHERE TenDangNhap = @TenDangNhap)
            THROW 50002, N'Tên đăng nhập đã tồn tại.', 1;

        -- 2. SINH MÃ KHÁCH HÀNG TỰ ĐỘNG (LOGIC MỚI - ROBUST)
        DECLARE @MaKH CHAR(15); -- Tăng kích thước biến để chứa được mã dài hơn trong tương lai
        DECLARE @MaxMaKH VARCHAR(15); -- Dùng VARCHAR để linh hoạt
        
        -- Lấy mã lớn nhất hiện tại. 
        -- Quan trọng: Order by LEN trước để KH100 > KH99
        SELECT TOP 1 @MaxMaKH = MaKH 
        FROM KHACHHANG 
        ORDER BY LEN(MaKH) DESC, MaKH DESC;
        
        IF @MaxMaKH IS NULL
        BEGIN
            -- Trường hợp chưa có dữ liệu đầu tiên
            SET @MaKH = 'KH00000001';
        END
        ELSE
        BEGIN
            -- Bước A: Tách phần số ra khỏi chữ 'KH'
            -- SUBSTRING từ ký tự thứ 3 đến hết chuỗi
            DECLARE @CurrentNum BIGINT; -- Dùng BIGINT để tránh tràn số int
            SET @CurrentNum = CAST(SUBSTRING(@MaxMaKH, 3, LEN(@MaxMaKH) - 2) AS BIGINT);
            
            -- Bước B: Tăng lên 1 đơn vị
            DECLARE @NextNum BIGINT = @CurrentNum + 1;
            
            -- Bước C: Format lại thành chuỗi (Padding)
            -- Logic: Nếu số < 8 chữ số thì thêm số 0, nếu >= 8 chữ số thì giữ nguyên
            IF LEN(CAST(@NextNum AS VARCHAR(20))) < 8
            BEGIN
                -- Dùng REPLICATE để tạo chuỗi số 0, sau đó nối với số mới
                SET @MaKH = 'KH' + REPLICATE('0', 8 - LEN(CAST(@NextNum AS VARCHAR(20)))) + CAST(@NextNum AS VARCHAR(20));
            END
            ELSE
            BEGIN
                -- Nếu số đã lớn (ví dụ 100000000), chỉ cần nối trực tiếp
                SET @MaKH = 'KH' + CAST(@NextNum AS VARCHAR(20));
            END
        END

        -- 3. Mã hóa mật khẩu (Giữ nguyên)
        DECLARE @MatKhauHash VARCHAR(255);
        SET @MatKhauHash = CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', @MatKhau), 2);

        -- 4. Insert dữ liệu (Giữ nguyên)
        INSERT INTO KHACHHANG (MaKH, HoTenKH, SDTKH, EmailKH, CCCD, GioiTinhKH, NgaySinhKH, DiemLoyalty, CapTV, NgayDatCap)
        VALUES (@MaKH, @HoTen, @SDT, @Email, @CCCD, @GioiTinh, @NgaySinh, 0, N'Cơ bản', GETDATE());

        INSERT INTO TAIKHOANHOIVIEN (MaKH, TenDangNhap, MatKhau, NgayDangKy)
        VALUES (@MaKH, @TenDangNhap, @MatKhauHash, GETDATE());

        COMMIT TRANSACTION;
        PRINT N'Đăng ký thành công. Mã KH: ' + @MaKH;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 2. Thêm Thú Cưng (sp_ThemThuCung): T05
CREATE OR ALTER PROCEDURE sp_ThemThuCung
    @MaKH CHAR(10),             -- Mã chủ sở hữu
    @TenTC NVARCHAR(50),
    @Loai NVARCHAR(50),         -- Loài (Chó, Mèo...)
    @Giong NVARCHAR(50),        -- Giống (Corgi, ALN...)
    @GioiTinhTC NVARCHAR(10),   -- Đực/Cái
    @NgaySinhTC DATE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. KIỂM TRA CHỦ SỞ HỮU (Validation)
        IF NOT EXISTS (SELECT 1 FROM KHACHHANG WHERE MaKH = @MaKH)
            THROW 50001, N'Mã khách hàng không tồn tại.', 1;

        -- 2. SINH MÃ THÚ CƯNG TỰ ĐỘNG (LOGIC MỚI - ROBUST)
        DECLARE @MaTC CHAR(15);       -- Dùng CHAR(15) hoặc VARCHAR(15) để dự phòng mã dài
        DECLARE @MaxMaTC VARCHAR(15);
        
        -- Lấy mã lớn nhất hiện tại.
        -- Sắp xếp theo ĐỘ DÀI trước, sau đó đến GIÁ TRỊ chuỗi để đảm bảo TC10 > TC9
        SELECT TOP 1 @MaxMaTC = MaTC 
        FROM THUCUNG 
        ORDER BY LEN(MaTC) DESC, MaTC DESC;
        
        IF @MaxMaTC IS NULL
        BEGIN
            -- Trường hợp chưa có dữ liệu đầu tiên
            SET @MaTC = 'TC00000001';
        END
        ELSE
        BEGIN
            -- Bước A: Tách phần số ra khỏi chữ 'TC' (Bắt đầu từ ký tự thứ 3)
            DECLARE @CurrentNum BIGINT; -- Dùng BIGINT để tránh tràn số INT
            SET @CurrentNum = CAST(SUBSTRING(@MaxMaTC, 3, LEN(@MaxMaTC) - 2) AS BIGINT);
            
            -- Bước B: Tăng lên 1 đơn vị
            DECLARE @NextNum BIGINT = @CurrentNum + 1;
            
            -- Bước C: Format lại thành chuỗi (Padding)
            -- Logic: Nếu số < 8 chữ số thì thêm số 0, nếu >= 8 chữ số thì giữ nguyên nối đuôi
            IF LEN(CAST(@NextNum AS VARCHAR(20))) < 8
            BEGIN
                -- Dùng REPLICATE để bù số 0 vào trước
                SET @MaTC = 'TC' + REPLICATE('0', 8 - LEN(CAST(@NextNum AS VARCHAR(20)))) + CAST(@NextNum AS VARCHAR(20));
            END
            ELSE
            BEGIN
                -- Nếu số đã lớn (ví dụ 100000000), chỉ cần nối trực tiếp
                SET @MaTC = 'TC' + CAST(@NextNum AS VARCHAR(20));
            END
        END

        -- 3. INSERT DỮ LIỆU
        -- Mặc định TinhTrangSucKhoe là 'Bình thường' khi mới tạo
        INSERT INTO THUCUNG (MaTC, TenTC, Loai, Giong, GioiTinhTC, NgaySinhTC, MaKH, TinhTrangSucKhoe)
        VALUES (@MaTC, @TenTC, @Loai, @Giong, @GioiTinhTC, @NgaySinhTC, @MaKH, N'Bình thường');

        COMMIT TRANSACTION;
        PRINT N'Thêm thú cưng thành công. Mã TC: ' + @MaTC;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 3. Đặt lịch khám bệnh (sp_DatLichKham): T06, T07
CREATE OR ALTER PROCEDURE sp_DatLichHen
    @MaKH CHAR(10),
    @MaTC CHAR(10),
    @MaCN CHAR(10),
    @NgayHen DATE,              -- Input: Ngày khách chọn
    @GioBatDau TIME,            -- Input: Khung giờ khách chọn (VD: 08:30)
    @LoaiDichVu NVARCHAR(50),
    @ThoiGianHenCuThe DATETIME OUTPUT, -- Output: Thời gian hẹn chính xác (gộp ngày+giờ)
    @STT_Output INT OUTPUT      -- Output: Số thứ tự
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. VALIDATION DỮ LIỆU
        IF NOT EXISTS (SELECT 1 FROM KHACHHANG WHERE MaKH = @MaKH)
            THROW 50001, N'Khách hàng không tồn tại.', 1;
        IF NOT EXISTS (SELECT 1 FROM THUCUNG WHERE MaTC = @MaTC AND MaKH = @MaKH)
            THROW 50002, N'Thú cưng không hợp lệ.', 1;
            
        -- Lấy giờ mở cửa
        DECLARE @GioMoCua TIME;
        SELECT @GioMoCua = ThoiGianMoCua FROM CHINHANH WHERE MaCN = @MaCN;
        
        IF @GioMoCua IS NULL
            THROW 50003, N'Chi nhánh không tồn tại.', 1;

        -- Kiểm tra giờ đặt (phải sau giờ mở cửa và tròn block 30p)
        IF @GioBatDau < @GioMoCua OR DATEPART(MINUTE, @GioBatDau) % 30 <> 0
            THROW 50004, N'Khung giờ không hợp lệ (Phải là :00 hoặc :30).', 1;

        -- 2. TÍNH TOÁN KHUNG GIỜ (BLOCK)
        -- Gộp Ngày và Giờ để tạo ra mốc thời gian bắt đầu Block
        DECLARE @BlockStart DATETIME = CAST(@NgayHen AS DATETIME) + CAST(@GioBatDau AS DATETIME);
        -- Mốc kết thúc Block (sau 30 phút)
        DECLARE @BlockEnd DATETIME = DATEADD(MINUTE, 30, @BlockStart);

        -- Tính số block đã trôi qua trong ngày để xác định STT cơ sở (Base STT)
        -- VD: Mở 08:00, Đặt 08:30 -> Trôi qua 30p -> Block index = 1 -> Base STT = 5
        DECLARE @SoBlockDaQua INT = DATEDIFF(MINUTE, @GioMoCua, @GioBatDau) / 30;
        DECLARE @BaseSTT INT = @SoBlockDaQua * 5; 

        -- 3. THUẬT TOÁN TÌM SLOT TRỐNG (Gap Filling)
        DECLARE @STT_KhaDung INT;

        -- CTE tạo danh sách 5 số thứ tự tiềm năng cho khung giờ này
        ;WITH DanhSachSTT_TiemNang AS (
            SELECT @BaseSTT + 1 AS STT
            UNION ALL SELECT @BaseSTT + 2
            UNION ALL SELECT @BaseSTT + 3
            UNION ALL SELECT @BaseSTT + 4
            UNION ALL SELECT @BaseSTT + 5
        ),
        -- CTE lấy các STT đã bị chiếm trong DB (dựa trên ThoiGianHen)
        STT_DaDat AS (
            SELECT STT
            FROM PHIEUDAT WITH (UPDLOCK) -- Khóa dòng để tránh tranh chấp
            WHERE MaCN = @MaCN 
              -- So khớp trong khoảng thời gian của Block
              AND ThoiGianHen >= @BlockStart 
              AND ThoiGianHen < @BlockEnd
              AND TrangThaiPD != N'Đã hủy'
        )
        -- Tìm số nhỏ nhất chưa có trong danh sách đã đặt
        SELECT TOP 1 @STT_KhaDung = ds.STT
        FROM DanhSachSTT_TiemNang ds
        LEFT JOIN STT_DaDat dd ON ds.STT = dd.STT
        WHERE dd.STT IS NULL
        ORDER BY ds.STT ASC;

        -- 4. XỬ LÝ KẾT QUẢ
        IF @STT_KhaDung IS NULL
            THROW 50005, N'Khung giờ này đã kín chỗ (5/5). Vui lòng chọn khung giờ khác.', 1;

        -- Tính thời gian hẹn cụ thể: Mỗi slot cách nhau 6 phút
        -- Vị trí tương đối (0-4) = (STT - 1) % 5
        DECLARE @PhutCongThem INT = ((@STT_KhaDung - 1) % 5) * 6;
        SET @ThoiGianHenCuThe = DATEADD(MINUTE, @PhutCongThem, @BlockStart);
        SET @STT_Output = @STT_KhaDung;

        -- 5. INSERT VÀO DATABASE (Cột ThoiGianHen)
        INSERT INTO PHIEUDAT (MaKH, MaTC, MaCN, ThoiGianDat, ThoiGianHen, LoaiHinhDichVu, TrangThaiPD, STT)
        VALUES (@MaKH, @MaTC, @MaCN, GETDATE(), @ThoiGianHenCuThe, @LoaiDichVu, N'Đã đặt', @STT_Output);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 4. Check-in (sp_CheckInKhamBenh): T08, T09, T10
CREATE OR ALTER PROCEDURE sp_CheckInKhamBenh
    @MaKH CHAR(10),
    @MaTC CHAR(10),
    @ThoiGianHen DATETIME,
    @MaGD_Output VARCHAR(25) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. TÌM PHIẾU ĐẶT VÀ LẤY MÃ CHI NHÁNH
        DECLARE @MaCN CHAR(10);
        DECLARE @LoaiHinhDV NVARCHAR(50)
        
        SELECT TOP 1 @MaCN = MaCN, @LoaiHinhDV = LoaiHinhDichVu
        FROM PHIEUDAT 
        WHERE MaKH = @MaKH AND MaTC = @MaTC 
          AND ThoiGianHen = @ThoiGianHen 
          AND TrangThaiPD = N'Đã đặt';

        IF @MaCN IS NULL
            THROW 50004, N'Không tìm thấy phiếu đặt hợp lệ để check-in.', 1;

        -- 2. CẬP NHẬT TRẠNG THÁI PHIẾU
        UPDATE PHIEUDAT 
        SET TrangThaiPD = N'Đã duyệt'
        WHERE MaKH = @MaKH AND MaTC = @MaTC AND ThoiGianHen = @ThoiGianHen AND TrangThaiPD = N'Đã đặt';

        -- 3. SINH MÃ GIAO DỊCH THEO FORMAT MỚI
        -- Format: GD + 2 số cuối CN + yymmdd + hhmmss + 6 số Random
        -- Ví dụ: CN01, ngày 25/12/2025 09:30:05 -> GD01251225093005123456
        
        -- A. Lấy 2 ký tự cuối của MaCN (VD: 'CN01' -> '01')
        DECLARE @SuffixCN VARCHAR(2);
        SET @SuffixCN = RIGHT(RTRIM(@MaCN), 2);

        -- B. Lấy thời gian (yymmddhhmmss) - 12 ký tự
        DECLARE @TimeCode VARCHAR(12);
        SET @TimeCode = FORMAT(GETDATE(), 'yyMMddHHmmss');

        -- C. Sinh 6 số ngẫu nhiên (Từ 000000 đến 999999)
        DECLARE @Random6 VARCHAR(6);
        -- ABS(CHECKSUM(NEWID())) tạo ra số ngẫu nhiên, % 1000000 lấy 6 số cuối
        -- RIGHT('000000'...) để đảm bảo luôn đủ 6 chữ số (padding số 0)
        SET @Random6 = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);

        -- D. Ghép chuỗi
        DECLARE @NewMaGD VARCHAR(25);
        SET @NewMaGD = 'GD' + @SuffixCN + @TimeCode + @Random6;

        -- (Tuỳ chọn: Vẫn nên kiểm tra trùng lặp để an toàn tuyệt đối 100%)
        IF EXISTS (SELECT 1 FROM LICHSUDICHVU WHERE MaGD = @NewMaGD)
        BEGIN
            -- Nếu xui xẻo trùng (tỉ lệ cực thấp), sinh lại số random khác
            SET @Random6 = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
            SET @NewMaGD = 'GD' + @SuffixCN + @TimeCode + @Random6;
        END

        SET @MaGD_Output = @NewMaGD;
        DECLARE @MaDV CHAR(10)

        -- Lấy MaDV
        SELECT @MaDV = MaDV
        FROM DICHVU
        WHERE TenDV = @LoaiHinhDV

        -- 4. TẠO LỊCH SỬ DỊCH VỤ
        INSERT INTO LICHSUDICHVU (MaGD, MaDV)
        VALUES (@NewMaGD, @MaDV); 

        COMMIT TRANSACTION;
        
        PRINT N'Check-in thành công!';
        PRINT N'Mã GD: ' + @NewMaGD;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 5. Ghi nhận kết quả khám bệnh (sp_GhiNhanKetQuaKham): T11
CREATE OR ALTER PROCEDURE sp_GhiNhanKetQuaKham
    @MaGD CHAR(25), 
    @MaBS CHAR(10),
    @NgayTaiKham DATE = NULL,
    @TrieuChung NVARCHAR(MAX), 
    @ChanDoan NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Đảm bảo mã nhân viên này tồn tại trong bảng BACSITHUY
        IF NOT EXISTS (SELECT 1 FROM BACSITHUY WHERE BMaNV = @MaBS)
        BEGIN;
            THROW 50001, N'Lỗi: Nhân viên thực hiện không phải là Bác sĩ thú y hợp lệ.', 1;
        END

        -- Đảm bảo giao dịch này đã được tạo (từ bước Check-in)
        IF NOT EXISTS (SELECT 1 FROM LICHSUDICHVU WHERE MaGD = @MaGD)
        BEGIN;
            THROW 50002, N'Lỗi: Mã giao dịch khám bệnh không tồn tại.', 1;
        END

        -- Kiểm tra xem ca khám này đã có kết quả chưa? Tránh ghi đè nếu không muốn
        IF EXISTS (SELECT 1 FROM KHAMBENH WHERE KMaGD = @MaGD)
        BEGIN;
             THROW 50003, N'Lỗi: Ca khám này đã có kết quả rồi.', 1;
        END

        -- (T11) Ghi nhận kết quả khám
        INSERT INTO KHAMBENH (KMaGD, TrieuChung, ChanDoan, NgayKham, NgayTaiKham, BMaNV)
        VALUES (@MaGD, @TrieuChung, @ChanDoan, GETDATE(), @NgayTaiKham, @MaBS);

        COMMIT TRANSACTION;
        PRINT N'Ghi nhận kết quả khám thành công.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW; 
    END CATCH
END;
GO

-- 6. Kê toa thuốc (sp_KeToaThuoc): T12, T13, T14, T15
CREATE OR ALTER PROCEDURE sp_KeToaThuoc
    @MaGD VARCHAR(25),      -- [CẬP NHẬT] Nới rộng để chứa mã GD format mới (22 ký tự)
    @MaThuoc CHAR(10),      -- Mã sản phẩm (Thuốc)
    @SoLuong INT,
    @LieuDung NVARCHAR(255),
    @HuongDan NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT
        -- Đảm bảo giao dịch này đã có hồ sơ khám bệnh (KHAMBENH) thì mới được kê toa
        IF NOT EXISTS (SELECT 1 FROM KHAMBENH WHERE KMaGD = @MaGD)
        BEGIN;
            THROW 50001, N'Lỗi: Chưa có hồ sơ khám bệnh cho giao dịch này. Bác sĩ cần ghi nhận kết quả khám trước khi kê toa.', 1;
        END

        -- 2. TẠO TOA THUỐC (HEADER) NẾU CHƯA TỒN TẠI
        DECLARE @MaTT VARCHAR(25); -- [CẬP NHẬT] Khai báo độ dài tương ứng MaGD
        
        SELECT @MaTT = MaTT FROM TOATHUOC WHERE KMaGD = @MaGD;
        
        IF @MaTT IS NULL
        BEGIN
            -- [CẬP NHẬT] Logic sinh mã: Thay 'GD' thành 'TT', giữ nguyên phần đuôi
            -- Ví dụ: GD01251225093005123456 -> TT01251225093005123456
            SET @MaTT = 'TT' + SUBSTRING(@MaGD, 3, LEN(@MaGD) - 2);

            INSERT INTO TOATHUOC (MaTT, ThoiGianLapTT, KMaGD)
            VALUES (@MaTT, GETDATE(), @MaGD);
        END

        -- 3. KIỂM TRA TỒN KHO
        DECLARE @TonKho INT;
        SELECT @TonKho = SLTonKho FROM SANPHAM WHERE MaSP = @MaThuoc;

        IF @TonKho IS NULL 
            THROW 50005, N'Mã thuốc không tồn tại.', 1;
        
        IF @TonKho < @SoLuong 
            THROW 50006, N'Số lượng tồn kho không đủ để kê toa.', 1;

        -- 4. THÊM CHI TIẾT TOA THUỐC (UPSERT)
        -- Kiểm tra nếu thuốc đã có trong toa thì cộng dồn, chưa có thì insert
        IF EXISTS (SELECT 1 FROM CHITIETTOATHUOC WHERE MaTT = @MaTT AND TMaSP = @MaThuoc)
        BEGIN
            UPDATE CHITIETTOATHUOC 
            SET SoLuongThuoc = SoLuongThuoc + @SoLuong 
            WHERE MaTT = @MaTT AND TMaSP = @MaThuoc;
        END
        ELSE
        BEGIN
            INSERT INTO CHITIETTOATHUOC (MaTT, TMaSP, SoLuongThuoc, LieuDung, HuongDan)
            VALUES (@MaTT, @MaThuoc, @SoLuong, @LieuDung, @HuongDan); -- Giả sử cột HuongDan cho phép NULL hoặc bạn truyền thêm tham số
        END

        -- 5. TRỪ TỒN KHO NGAY LẬP TỨC
        UPDATE SANPHAM 
        SET SLTonKho = SLTonKho - @SoLuong 
        WHERE MaSP = @MaThuoc;

        COMMIT TRANSACTION;
        
        -- (Tùy chọn) In thông báo để debug
        -- PRINT N'Đã kê thuốc ' + @MaThuoc + N' vào toa ' + @MaTT;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_LapHoaDon
    @MaGD VARCHAR(25),            
    @MaTC CHAR(10),              
    @MaNV CHAR(10),             
    @MaHD_Output VARCHAR(25) OUTPUT 
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. LẤY MÃ CHI NHÁNH
        DECLARE @MaCN CHAR(10);
        SELECT TOP 1 @MaCN = MaCN 
        FROM LICHSUCONGTAC 
        WHERE MaNV = @MaNV 
        ORDER BY NgayVaoLam DESC;

        IF @MaCN IS NULL THROW 50001, N'Lỗi: Không xác định được chi nhánh làm việc.', 1;

        -- 2. SINH MÃ HÓA ĐƠN
        DECLARE @SuffixCN VARCHAR(2) = RIGHT(RTRIM(@MaCN), 2);
        DECLARE @TimeCode VARCHAR(12) = FORMAT(GETDATE(), 'yyMMddHHmmss');
        DECLARE @Random6 VARCHAR(6) = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
        DECLARE @MaHD VARCHAR(25) = 'HD' + @SuffixCN + @TimeCode + @Random6;

        -- Check trùng
        WHILE EXISTS (SELECT 1 FROM HOADON WHERE MaHD = @MaHD)
        BEGIN
            SET @Random6 = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
            SET @MaHD = 'HD' + @SuffixCN + @TimeCode + @Random6;
        END

        SET @MaHD_Output = @MaHD; -- Gán giá trị output

        -- 3. TẠO HEADER HÓA ĐƠN (Ban đầu tổng tiền tạm tính = 0 hoặc 1)
        INSERT INTO HOADON (MaHD, ThoiGianLapHD, KhuyenMai, TongTien, MaTC, HMaNV)
        VALUES (@MaHD, GETDATE(), 0, 1, @MaTC, @MaNV);

        -- 4. THÊM CHI TIẾT: PHÍ DỊCH VỤ KHÁM (STT = 1)
        DECLARE @PhiKham DECIMAL(18,0);
        
        SELECT @PhiKham = DV.PhiDV 
        FROM DICHVU DV
        JOIN LICHSUDICHVU LS ON DV.MaDV = LS.MaDV
        WHERE LS.MaGD = @MaGD;

        INSERT INTO CHITIETHOADON (MaHD, STT, MaSP, MaGD, SoLuong, DonGia, ThanhTien)
        VALUES (@MaHD, 1, NULL, @MaGD, 1, ISNULL(@PhiKham, 0), ISNULL(@PhiKham, 0));

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_CapNhatHoaDon
    @MaHD VARCHAR(25), 
    @MaGD VARCHAR(25) 
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. THÊM CHI TIẾT: THUỐC
        -- Lưu ý: STT được tính là ROW_NUMBER + 1 (vì số 1 đã dành cho Phí Dịch Vụ ở Bước 1)
        INSERT INTO CHITIETHOADON (MaHD, STT, MaSP, MaGD, SoLuong, DonGia, ThanhTien)
        SELECT 
            @MaHD,
            ROW_NUMBER() OVER (ORDER BY CT.TMaSP) + 1, 
            CT.TMaSP,
            NULL, -- MaGD để NULL vì đây là dòng thuốc, không phải dòng dịch vụ (tuỳ thiết kế DB của bạn)
            CT.SoLuongThuoc,
            SP.Gia,
            (CT.SoLuongThuoc * SP.Gia)
        FROM TOATHUOC TT
        JOIN CHITIETTOATHUOC CT ON TT.MaTT = CT.MaTT
        JOIN SANPHAM SP ON CT.TMaSP = SP.MaSP
        WHERE TT.KMaGD = @MaGD;

        -- 2. TÍNH TỔNG TIỀN (Cộng cả Phí DV và Thuốc)
        DECLARE @TongTien DECIMAL(18,0);
        SELECT @TongTien = SUM(ThanhTien) FROM CHITIETHOADON WHERE MaHD = @MaHD;

        -- 3. UPDATE HOADON
        UPDATE HOADON 
        SET TongTien = ISNULL(@TongTien, 0) 
        WHERE MaHD = @MaHD;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 8. Thanh toán (sp_ThanhToan): T19
CREATE OR ALTER PROCEDURE sp_ThanhToan
    @MaHD CHAR(25),            -- Mã hóa đơn cần thanh toán
    @MaKH CHAR(10),            -- Khách hàng thanh toán
    @HinhThucTT NVARCHAR(50)   -- Tiền mặt / Chuyển khoản
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Kiểm tra hóa đơn có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM HOADON WHERE MaHD = @MaHD)
            THROW 50001, N'Hóa đơn không tồn tại.', 1;

        -- 2. Kiểm tra hóa đơn đã thanh toán chưa (tránh thanh toán 2 lần) 
        IF EXISTS (SELECT 1 FROM THONGTINTHANHTOAN WHERE MaHD = @MaHD AND TrangThaiTT = N'Đã thanh toán')
            THROW 50002, N'Hóa đơn này đã được thanh toán rồi.', 1;

        -- 3. Ghi nhận Thanh Toán
        INSERT INTO THONGTINTHANHTOAN (MaKH, MaHD, PhuongThucTT, ThoiGianTT, TrangThaiTT)
        VALUES (@MaKH, @MaHD, @HinhThucTT, GETDATE(), N'Đã thanh toán');

        -- 4. Lấy tổng tiền để cộng điểm
        DECLARE @TongTien DECIMAL(18,0);
        SELECT @TongTien = TongTien FROM HOADON WHERE MaHD = @MaHD;

        -- 5. Cộng điểm Loyalty (50.000 VNĐ = 1 điểm) 
        DECLARE @DiemCong INT = ISNULL(@TongTien, 0) / 50000;
        
        UPDATE KHACHHANG 
        SET DiemLoyalty = DiemLoyalty + @DiemCong 
        WHERE MaKH = @MaKH;

        COMMIT TRANSACTION;
        PRINT N'Thanh toán thành công hóa đơn ' + @MaHD;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 9. Đánh giá (sp_DanhGia): T20
CREATE PROCEDURE sp_GhiNhanDanhGia
    @MaHD CHAR(25),             -- Mã hóa đơn muốn đánh giá
    @MaKH CHAR(10),             -- Khách hàng thực hiện đánh giá
    @DiemChatLuong INT,         -- 1 đến 5
    @ThaiDoNV NVARCHAR(50),     -- 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'
    @MucDoHaiLong NVARCHAR(50), -- 'Rất không hài lòng', '...', 'Rất hài lòng'
    @BinhLuan NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. KIỂM TRA TÍNH HỢP LỆ (Business Logic)

        -- 1.1 Kiểm tra hóa đơn có tồn tại và thuộc về khách hàng này không?
        -- (Cần join qua THUCUNG hoặc THONGTINTHANHTOAN để xác định chủ sở hữu)
        IF NOT EXISTS (
            SELECT 1 
            FROM HOADON HD
            JOIN THUCUNG TC ON HD.MaTC = TC.MaTC
            WHERE HD.MaHD = @MaHD AND TC.MaKH = @MaKH
        )
        BEGIN;
            THROW 50001, N'Hóa đơn không tồn tại hoặc không thuộc về khách hàng này.', 1;
        END

        -- 1.2 Kiểm tra xem hóa đơn này đã được đánh giá chưa? 
        -- (Vì MaHD là khóa chính của bảng DANHGIA nên mỗi hóa đơn chỉ được đánh giá 1 lần)
        IF EXISTS (SELECT 1 FROM DANHGIA WHERE MaHD = @MaHD)
        BEGIN;
            THROW 50002, N'Hóa đơn này đã được đánh giá trước đó.', 1;
        END

        -- 1.3 Kiểm tra thang điểm (Constraint Check)
        IF @DiemChatLuong < 1 OR @DiemChatLuong > 5
        BEGIN;
            THROW 50003, N'Điểm chất lượng phải từ 1 đến 5.', 1;
        END

        -- 1.4 Kiểm tra giá trị hợp lệ cho Thái độ nhân viên
        IF @ThaiDoNV NOT IN (N'Rất tệ', N'Tệ', N'Bình thường', N'Tốt', N'Rất tốt')
        BEGIN;
            THROW 50004, N'Giá trị đánh giá thái độ nhân viên không hợp lệ.', 1;
        END

        -- 1.5 Kiểm tra giá trị hợp lệ cho Mức độ hài lòng
        IF @MucDoHaiLong NOT IN (N'Rất không hài lòng', N'Không hài lòng', N'Bình thường', N'Hài lòng', N'Rất hài lòng')
        BEGIN;
            THROW 50005, N'Giá trị mức độ hài lòng không hợp lệ.', 1;
        END

        -- 2. THỰC HIỆN GHI NHẬN (Insert)
        INSERT INTO DANHGIA (MaHD, DiemChatLuong, ThaiDoNV, MucDoHaiLong, BinhLuan, MaKH)
        VALUES (@MaHD, @DiemChatLuong, @ThaiDoNV, @MucDoHaiLong, @BinhLuan, @MaKH);

        COMMIT TRANSACTION;
        PRINT N'Cảm ơn quý khách đã gửi đánh giá cho hóa đơn';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_DatMuaOnline
    @MaKH CHAR(10),                 -- Khách hàng đặt mua
    @DanhSachSanPham NVARCHAR(MAX), -- JSON: '[{"MaSP":"SP01","SoLuong":1},...]'
    @PhuongThucTT NVARCHAR(50),     -- 'Tiền mặt' (COD) hoặc 'Chuyển khoản'
    @MaHD_Output VARCHAR(25) OUTPUT -- Trả về Mã HĐ để hiện thông báo
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. VALIDATION
        IF NOT EXISTS (SELECT 1 FROM KHACHHANG WHERE MaKH = @MaKH)
            THROW 50001, N'Khách hàng không tồn tại.', 1;

        -- 3. SINH MÃ HÓA ĐƠN (Format: HD + CN + Time + Random)
        DECLARE @SuffixCN VARCHAR(2) = '00'
        DECLARE @TimeCode VARCHAR(12) = FORMAT(GETDATE(), 'yyMMddHHmmss');
        DECLARE @Random6 VARCHAR(6) = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
        DECLARE @MaHD VARCHAR(25) = 'HD' + @SuffixCN + @TimeCode + @Random6;

        -- Kiểm tra trùng
        WHILE EXISTS (SELECT 1 FROM HOADON WHERE MaHD = @MaHD)
        BEGIN
            SET @Random6 = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
            SET @MaHD = 'HD' + @SuffixCN + @TimeCode + @Random6;
        END
        SET @MaHD_Output = @MaHD;

        -- 4. TẠO HÓA ĐƠN HEADER
        -- Online thường chưa có MaTC (trừ khi mua thuốc đặc trị), tạm để NULL
        INSERT INTO HOADON (MaHD, ThoiGianLapHD, KhuyenMai, TongTien, MaTC, HMaNV)
        VALUES (@MaHD, GETDATE(), 0, 1, NULL, NULL);

        -- 5. XỬ LÝ CHI TIẾT SẢN PHẨM & TRỪ KHO
        DECLARE @TableSP TABLE (MaSP CHAR(10), SoLuong INT);
        
        INSERT INTO @TableSP (MaSP, SoLuong)
        SELECT MaSP, SoLuong 
        FROM OPENJSON(@DanhSachSanPham) WITH (MaSP CHAR(10), SoLuong INT);

        DECLARE @CurMaSP CHAR(10), @CurSoLuong INT, @GiaBan DECIMAL(18,0), @TonKho INT;
        DECLARE @STT INT = 1;

        DECLARE cur CURSOR FOR SELECT MaSP, SoLuong FROM @TableSP;
        OPEN cur;
        FETCH NEXT FROM cur INTO @CurMaSP, @CurSoLuong;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Kiểm tra tồn kho
            SELECT @TonKho = SLTonKho, @GiaBan = Gia FROM SANPHAM WHERE MaSP = @CurMaSP;

            IF @TonKho < @CurSoLuong
            BEGIN
                DEALLOCATE cur;
                THROW 50004, N'Sản phẩm đã hết hàng trong khi quý khách đang thao tác.', 1;
            END

            -- Insert chi tiết
            INSERT INTO CHITIETHOADON (MaHD, STT, MaSP, MaGD, SoLuong, DonGia, ThanhTien)
            VALUES (@MaHD, @STT, @CurMaSP, NULL, @CurSoLuong, @GiaBan, @CurSoLuong * @GiaBan);

            -- Trừ tồn kho (Giữ hàng)
            UPDATE SANPHAM SET SLTonKho = SLTonKho - @CurSoLuong WHERE MaSP = @CurMaSP;

            SET @STT = @STT + 1;
            FETCH NEXT FROM cur INTO @CurMaSP, @CurSoLuong;
        END

        CLOSE cur;
        DEALLOCATE cur;

        -- 6. CẬP NHẬT TỔNG TIỀN
        DECLARE @TongTien DECIMAL(18,0);
        SELECT @TongTien = SUM(ThanhTien) FROM CHITIETHOADON WHERE MaHD = @MaHD;
        UPDATE HOADON SET TongTien = ISNULL(@TongTien, 0) WHERE MaHD = @MaHD;

        -- 7. TẠO THÔNG TIN THANHTOAN
        -- Xác định trạng thái dựa trên phương thức thanh toán
        DECLARE @TrangThaiTT NVARCHAR(50);
        IF @PhuongThucTT = N'Tiền mặt' 
            SET @TrangThaiTT = N'Chưa thanh toán'; -- COD: Giao tới mới thu tiền
        ELSE 
            SET @TrangThaiTT = N'Chờ xử lý'; -- Chuyển khoản: Chờ kế toán/Hệ thống bank confirm

        INSERT INTO THONGTINTHANHTOAN (MaKH, MaHD, PhuongThucTT, ThoiGianTT, TrangThaiTT)
        VALUES (@MaKH, @MaHD, @PhuongThucTT, GETDATE(), @TrangThaiTT);

        COMMIT TRANSACTION;
        PRINT N'Đặt hàng thành công.';
        PRINT N'Mã Đơn Hàng: ' + @MaHD;

    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('global','cur') >= -1 
        BEGIN 
             CLOSE cur; 
             DEALLOCATE cur; 
        END
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_TiepNhanKhachMoi
    -- 1. Thông tin nhân viên & Dịch vụ
    @MaNV CHAR(10),
    @LoaiDichVu NVARCHAR(50),
    
    -- 2. Thông tin Khách hàng (Bắt buộc nhập form)
    @HoTenKH NVARCHAR(100),
    @SDT VARCHAR(15),
    @CCCD VARCHAR(15),
    @GioiTinhKH NVARCHAR(10),
    @NgaySinhKH DATE,
    @EmailKH VARCHAR(100),
    
    -- 3. Thông tin Thú cưng (Bắt buộc)
    @TenTC NVARCHAR(50),
    @LoaiTC NVARCHAR(50),     -- Chó/Mèo
    @GiongTC NVARCHAR(50),    -- Corgi/Mướp
    @GioiTinhTC NVARCHAR(10),
    @NgaySinhTC DATE,
    
    -- 4. Output trả về để in phiếu
    @MaGD_Output VARCHAR(25) OUTPUT,
    @MaKH_Output CHAR(10) OUTPUT,
    @MaTC_Output CHAR(10) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- A. LẤY CHI NHÁNH
        DECLARE @MaCN CHAR(10);
        SELECT TOP 1 @MaCN = MaCN FROM LICHSUCONGTAC WHERE MaNV = @MaNV ORDER BY NgayVaoLam DESC;
        IF @MaCN IS NULL THROW 50001, N'Nhân viên chưa được phân công chi nhánh.', 1;

        -- B. TẠO KHÁCH HÀNG MỚI
        -- Sinh Mã KH tự động
        DECLARE @NewMaKH CHAR(15); -- Dùng CHAR lớn chút để xử lý
        DECLARE @MaxMaKH VARCHAR(15);
        
        SELECT TOP 1 @MaxMaKH = MaKH FROM KHACHHANG ORDER BY LEN(MaKH) DESC, MaKH DESC;
        
        IF @MaxMaKH IS NULL SET @NewMaKH = 'KH00000001';
        ELSE
        BEGIN
            DECLARE @NumKH BIGINT = CAST(SUBSTRING(@MaxMaKH, 3, LEN(@MaxMaKH)-2) AS BIGINT) + 1;
            IF LEN(CAST(@NumKH AS VARCHAR(20))) < 8
                SET @NewMaKH = 'KH' + REPLICATE('0', 8 - LEN(CAST(@NumKH AS VARCHAR(20)))) + CAST(@NumKH AS VARCHAR(20));
            ELSE
                SET @NewMaKH = 'KH' + CAST(@NumKH AS VARCHAR(20));
        END
        SET @MaKH_Output = @NewMaKH;

        INSERT INTO KHACHHANG (MaKH, HoTenKH, SDTKH, EmailKH, CCCD, GioiTinhKH, NgaySinhKH, DiemLoyalty, CapTV, NgayDatCap)
        VALUES (@NewMaKH, @HoTenKH, @SDT, @EmailKH, @CCCD, @GioiTinhKH, @NgaySinhKH, 0, N'Cơ bản', GETDATE());

        -- C. TẠO THÚ CƯNG MỚI
        -- Sinh Mã TC tự động
        DECLARE @NewMaTC CHAR(15);
        DECLARE @MaxMaTC VARCHAR(15);
        SELECT TOP 1 @MaxMaTC = MaTC FROM THUCUNG ORDER BY LEN(MaTC) DESC, MaTC DESC;

        IF @MaxMaTC IS NULL SET @NewMaTC = 'TC00000001';
        ELSE
        BEGIN
            DECLARE @NumTC BIGINT = CAST(SUBSTRING(@MaxMaTC, 3, LEN(@MaxMaTC)-2) AS BIGINT) + 1;
            IF LEN(CAST(@NumTC AS VARCHAR(20))) < 8
                SET @NewMaTC = 'TC' + REPLICATE('0', 8 - LEN(CAST(@NumTC AS VARCHAR(20)))) + CAST(@NumTC AS VARCHAR(20));
            ELSE
                SET @NewMaTC = 'TC' + CAST(@NumTC AS VARCHAR(20));
        END

        SET @MaTC_Output = @NewMaTC;

        INSERT INTO THUCUNG (MaTC, TenTC, Loai, Giong, GioiTinhTC, NgaySinhTC, TinhTrangSucKhoe, MaKH)
        VALUES (@NewMaTC, @TenTC, @LoaiTC, @GiongTC, @GioiTinhTC, @NgaySinhTC, N'Bình thường', @NewMaKH);

        -- D. CHECK-IN & SINH MÃ GD

        -- Sinh Mã Giao Dịch
        DECLARE @SuffixCN VARCHAR(2) = RIGHT(RTRIM(@MaCN), 2);
        DECLARE @TimeCode VARCHAR(12) = FORMAT(GETDATE(), 'yyMMddHHmmss');
        DECLARE @Random6 VARCHAR(6) = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
        
        DECLARE @MaGD VARCHAR(25) = 'GD' + @SuffixCN + @TimeCode + @Random6;
        
        -- Loop check trùng
        WHILE EXISTS (SELECT 1 FROM LICHSUDICHVU WHERE MaGD = @MaGD)
        BEGIN
            SET @Random6 = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
            SET @MaGD = 'GD' + @SuffixCN + @TimeCode + @Random6;
        END
        SET @MaGD_Output = @MaGD;

        -- Xác định mã dịch vụ
        DECLARE @MaDV CHAR(10);
        SELECT TOP 1 @MaDV = MaDV FROM DICHVU WHERE TenDV = @LoaiDichVu;

        INSERT INTO LICHSUDICHVU (MaGD, MaDV) VALUES (@MaGD, @MaDV);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_TiepNhanKhachCu
    @MaNV CHAR(10),
    @LoaiDichVu NVARCHAR(50),
    
    -- Thông tin tìm kiếm (Chỉ cần 1 trong 2)
    @SDT VARCHAR(15) = NULL,
    @CCCD VARCHAR(12) = NULL,
    
    -- Mã thú cưng khách chọn khám
    @MaTC CHAR(10), 
    
    -- Output
    @MaGD_Output VARCHAR(25) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- A. LẤY CHI NHÁNH
        DECLARE @MaCN CHAR(10);
        SELECT TOP 1 @MaCN = MaCN FROM LICHSUCONGTAC WHERE MaNV = @MaNV ORDER BY NgayVaoLam DESC;
        IF @MaCN IS NULL THROW 50001, N'Nhân viên chưa được phân công chi nhánh.', 1;

        -- B. TÌM KHÁCH HÀNG
        DECLARE @MaKH CHAR(10);
        
        IF @SDT IS NOT NULL
            SELECT TOP 1 @MaKH = MaKH FROM KHACHHANG WHERE SDTKH = @SDT;
        ELSE IF @CCCD IS NOT NULL
            SELECT TOP 1 @MaKH = MaKH FROM KHACHHANG WHERE CCCD = @CCCD;
            
        IF @MaKH IS NULL THROW 50002, N'Không tìm thấy khách hàng với thông tin cung cấp.', 1;

        -- C. KIỂM TRA THÚ CƯNG
        IF NOT EXISTS (SELECT 1 FROM THUCUNG WHERE MaTC = @MaTC AND MaKH = @MaKH)
            THROW 50003, N'Thú cưng này không thuộc về khách hàng đã tìm thấy.', 1;

        -- D. CHECK-IN & SINH MÃ GD
        -- Sinh Mã GD
        DECLARE @SuffixCN VARCHAR(2) = RIGHT(RTRIM(@MaCN), 2);
        DECLARE @TimeCode VARCHAR(12) = FORMAT(GETDATE(), 'yyMMddHHmmss');
        DECLARE @Random6 VARCHAR(6) = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
        
        DECLARE @MaGD VARCHAR(25) = 'GD' + @SuffixCN + @TimeCode + @Random6;
        
        WHILE EXISTS (SELECT 1 FROM LICHSUDICHVU WHERE MaGD = @MaGD)
        BEGIN
            SET @Random6 = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
            SET @MaGD = 'GD' + @SuffixCN + @TimeCode + @Random6;
        END
        SET @MaGD_Output = @MaGD;

        -- Insert Lịch sử DV
        DECLARE @MaDV CHAR(10);
        SELECT TOP 1 @MaDV = MaDV FROM DICHVU WHERE TenDV = @LoaiDichVu;

        INSERT INTO LICHSUDICHVU (MaGD, MaDV) VALUES (@MaGD, @MaDV);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
