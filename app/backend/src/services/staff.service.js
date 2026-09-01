import { sequelize } from '../dbs/init.mssql.js'
import { QueryTypes } from 'sequelize';

class StaffService {
    static getDashboardData = async (maChiNhanh) => {
        try {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            const todayStr = today.toISOString().slice(0, 10);
            const firstDayStr = firstDayOfMonth.toISOString().slice(0, 10);

            const [appointmentCounts] = await sequelize.query(`
                SELECT 
                    SUM(CASE WHEN LoaiHinhDichVu = N'Khám bệnh' THEN 1 ELSE 0 END) as TotalExam,
                    SUM(CASE WHEN LoaiHinhDichVu = N'Tiêm phòng' THEN 1 ELSE 0 END) as TotalVaccine
                FROM PHIEUDAT
                WHERE CAST(ThoiGianHen AS DATE) = :todayStr
                AND TrangThaiPD = N'Đã đặt'
                AND (:maChiNhanh IS NULL OR MaCN = :maChiNhanh)
            `, { replacements: { todayStr, maChiNhanh } });

            const [invoiceData] = await sequelize.query(`
                EXEC sp_T16_BaoCaoDoanhThu 
                @MaChiNhanh = :maChiNhanh, 
                @NgayBatDau = :todayStr, 
                @NgayKetThuc = :todayStr
            `, { replacements: { maChiNhanh, todayStr } });

            const [newCustomerData] = await sequelize.query(`
                EXEC sp_T01_KhachHangMoi 
                @MaChiNhanh = :maChiNhanh, 
                @NgayBatDau = :firstDayStr, 
                @NgayKetThuc = :todayStr
            `, { replacements: { maChiNhanh, firstDayStr, todayStr } });

            const stats = {
                exams: appointmentCounts[0]?.TotalExam || 0,
                vaccines: appointmentCounts[0]?.TotalVaccine || 0,
                invoices: invoiceData[0]?.TongHoaDon || 0,
                newCustomers: newCustomerData[0]?.SoLuongKhachMoi || 0
            };

            const [queue] = await sequelize.query(`
                SELECT TOP 10
                    PD.MaKH, PD.MaTC, PD.ThoiGianHen, PD.STT as [order],
                    TC.TenTC as pet, 
                    KH.HoTenKH as customer,
                    PD.LoaiHinhDichVu as service,
                    PD.TrangThaiPD as statusDB
                FROM PHIEUDAT PD
                JOIN THUCUNG TC ON PD.MaTC = TC.MaTC
                JOIN KHACHHANG KH ON PD.MaKH = KH.MaKH
                WHERE CAST(PD.ThoiGianHen AS DATE) = :todayStr
                AND (:maChiNhanh IS NULL OR PD.MaCN = :maChiNhanh)
                AND PD.TrangThaiPD = N'Đã đặt'
                ORDER BY PD.ThoiGianHen ASC
            `, { replacements: { todayStr, maChiNhanh } });

            const formattedQueue = queue.map(item => ({
                id: `${item.MaKH}_${item.MaTC}_${item.order}`,
                order: item.order,
                time: new Date(item.ThoiGianHen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                customer: item.customer,
                pet: item.pet,
                service: item.service,
                status: item.statusDB === 'Đã đặt' ? 'booked' : 'waiting'
            }));

            const alerts = [];

            const [restockData] = await sequelize.query(`EXEC sp_T15_DuBaoNhapHang`);
            const lowStockCount = restockData.length;
            if (lowStockCount > 0) {
                alerts.push({
                    id: 1,
                    type: "warning",
                    message: `${lowStockCount} sản phẩm dưới mức tồn kho an toàn`
                });
            }

            const [expiryData] = await sequelize.query(`EXEC sp_T13_CanhBaoHetHan @NguongNgay = 30`);
            const expiringCount = expiryData.length;
            if (expiringCount > 0) {
                alerts.push({
                    id: 2,
                    type: "warning",
                    message: `${expiringCount} lô thuốc/vắc-xin sắp hết hạn trong 30 ngày`
                });
            }

            return {
                stats,
                queue: formattedQueue,
                alerts
            };

        } catch (error) {
            console.error("StaffService getDashboardData Error:", error);
            throw error;
        }
    }

    static getReceptionAppointments = async ({ maChiNhanh, date, search, service }) => {
        try {
            const searchLike = search ? `%${search}%` : '%';
            
            let query = `
                SELECT 
                    PD.MaKH, PD.MaTC, PD.ThoiGianHen, PD.STT,
                    PD.LoaiHinhDichVu, PD.TrangThaiPD,
                    KH.HoTenKH, KH.SDTKH,
                    TC.TenTC, TC.Loai, TC.Giong
                FROM PHIEUDAT PD
                JOIN KHACHHANG KH ON PD.MaKH = KH.MaKH
                JOIN THUCUNG TC ON PD.MaTC = TC.MaTC
                WHERE CAST(PD.ThoiGianHen AS DATE) = :date
                AND PD.TrangThaiPD = N'Đã đặt'
                AND (:maChiNhanh IS NULL OR PD.MaCN = :maChiNhanh)
                AND (KH.HoTenKH LIKE :searchLike OR KH.SDTKH LIKE :searchLike OR TC.TenTC LIKE :searchLike)
            `;

            if (service && service !== 'all') {
                query += ` AND PD.LoaiHinhDichVu = :service`;
            }

            query += ` ORDER BY PD.ThoiGianHen ASC`;

            const [appointments] = await sequelize.query(query, {
                replacements: { 
                    maChiNhanh, 
                    date, 
                    searchLike,
                    service: service === 'all' ? null : service
                }
            });

            return appointments.map(item => {
                let statusKey = 'booked';
                if (item.TrangThaiPD === 'Đã đặt') statusKey = 'booked';
                else if (item.TrangThaiPD === 'Đã duyệt') statusKey = 'confirmed';
                else if (item.TrangThaiPD === 'Hoàn thành') statusKey = 'completed';
                else if (item.TrangThaiPD === 'Đã hủy') statusKey = 'cancelled';
                else if (item.TrangThaiPD === 'Hết hạn') statusKey = 'expired';

                return {
                    id: `${item.MaKH}_${item.MaTC}_${item.STT}`,
                    order: item.STT,
                    code: `PD-${item.STT.toString().padStart(3, '0')}`,
                    time: new Date(item.ThoiGianHen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    customer: item.HoTenKH,
                    phone: item.SDTKH,
                    pet: item.TenTC,
                    petType: `${item.Loai} ${item.Giong}`,
                    service: item.LoaiHinhDichVu,
                    doctor: "---",
                    status: statusKey,
                    note: "",
                    MaKH: item.MaKH,
                    MaTC: item.MaTC,
                    fullDateTime: item.ThoiGianHen
                };
            });

        } catch (error) {
            console.error("StaffService getReceptionAppointments Error:", error);
            throw error;
        }
    }

    static getCurrentBranch = async (maNV) => {
        const [result] = await sequelize.query(`
            SELECT TOP 1 MaCN 
            FROM LICHSUCONGTAC 
            WHERE MaNV = :maNV 
            AND NgayVaoLam <= GETDATE()
            AND (NgayChuyen IS NULL OR NgayChuyen >= GETDATE())
            ORDER BY NgayVaoLam DESC
        `, { replacements: { maNV } });

        return result.length > 0 ? result[0].MaCN : null;
    }

    static getPetsByBranch = async ({ maNV, search, page = 1, limit = 20 }) => {
        try {
            const maChiNhanh = await this.getCurrentBranch(maNV);
            if (!maChiNhanh) throw new Error("Nhân viên chưa được phân công vào chi nhánh nào.");

            const searchLike = search ? `%${search}%` : '%';
            const offset = (page - 1) * limit;

            const [pets] = await sequelize.query(`
                SELECT 
                    TC.MaTC, TC.TenTC, TC.Loai, TC.Giong, TC.GioiTinhTC, 
                    DATEDIFF(month, TC.NgaySinhTC, GETDATE()) / 12 as TuoiNam,
                    DATEDIFF(month, TC.NgaySinhTC, GETDATE()) % 12 as TuoiThang,
                    TC.TinhTrangSucKhoe,
                    KH.HoTenKH, KH.SDTKH
                FROM THUCUNG TC
                JOIN KHACHHANG KH ON TC.MaKH = KH.MaKH
                WHERE (
                    TC.TenTC LIKE :searchLike 
                    OR TC.MaTC LIKE :searchLike 
                    OR KH.HoTenKH LIKE :searchLike 
                    OR KH.SDTKH LIKE :searchLike
                )
                AND EXISTS (
                    SELECT 1 
                    FROM HOADON HD 
                    JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                    WHERE HD.MaTC = TC.MaTC AND LS.MaCN = :maChiNhanh
                )
                ORDER BY TC.MaTC DESC
                OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            `, {
                replacements: { maChiNhanh, searchLike, offset, limit }
            });

            const [countResult] = await sequelize.query(`
                SELECT COUNT(*) as Total
                FROM THUCUNG TC
                JOIN KHACHHANG KH ON TC.MaKH = KH.MaKH
                WHERE (
                    TC.TenTC LIKE :searchLike 
                    OR TC.MaTC LIKE :searchLike 
                    OR KH.HoTenKH LIKE :searchLike 
                    OR KH.SDTKH LIKE :searchLike
                )
                AND EXISTS (
                    SELECT 1 
                    FROM HOADON HD 
                    JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                    WHERE HD.MaTC = TC.MaTC AND LS.MaCN = :maChiNhanh
                )
            `, {
                replacements: { maChiNhanh, searchLike }
            });

            const total = countResult[0]?.Total || 0;

            const mapPets = pets.map(pet => {
                const age = pet.TuoiNam > 0 
                    ? `${pet.TuoiNam} tuổi ${pet.TuoiThang > 0 ? pet.TuoiThang + ' tháng' : ''}` 
                    : `${pet.TuoiThang} tháng`;

                return {
                    id: pet.MaTC,
                    name: pet.TenTC,
                    species: pet.Loai,
                    breed: pet.Giong,
                    gender: pet.GioiTinhTC,
                    age: age,
                    weight: "---", 
                    owner: pet.HoTenKH,
                    phone: pet.SDTKH,
                    address: "---", 
                    status: pet.TinhTrangSucKhoe || "Bình thường",
                    lastVisit: "---", 
                    history: [] 
                };
            });

            return {
                list: mapPets,
                total: total
            };

        } catch (error) {
            console.error("StaffService getPetsByBranch Error:", error);
            throw error;
        }
    }

    static getPetDetailHistory = async (petId) => {
        try {
            const [history] = await sequelize.query(
                `EXEC sp_T11_HoSoBenhAnThuCung @MaThuCung = :petId`, 
                { replacements: { petId } }
            );
            
            return history.map(h => ({
                date: new Date(h.Ngay).toLocaleDateString('vi-VN'),
                type: h.LoaiDichVu === 'KHAM-BENH' ? 'Khám bệnh' : 'Tiêm phòng',
                note: h.ChiTiet,
                doctor: h.BacSi
            }));
        } catch (error) {
            console.error("StaffService getPetDetailHistory Error:", error);
            throw error;
        }
    }

    static getInvoicesByBranch = async ({ maNV, search, status, page = 1, limit = 20 }) => {
        try {
            const maChiNhanh = await this.getCurrentBranch(maNV);
            if (!maChiNhanh) throw new Error("Nhân viên chưa được phân công vào chi nhánh nào.");

            const searchLike = search ? `%${search}%` : '%';
            const offset = (page - 1) * limit;
            const today = new Date().toISOString().slice(0, 10);

            let statusCondition = "";
            if (status === 'paid') {
                statusCondition = `AND TT.TrangThaiTT = N'Đã thanh toán'`;
            } else if (status === 'unpaid') {
                statusCondition = `AND (TT.TrangThaiTT IS NULL OR TT.TrangThaiTT != N'Đã thanh toán')`;
            } else if (status === 'cancelled') {
                 statusCondition = `AND 1=0`;
            }

            const query = `
                SELECT DISTINCT
                    HD.MaHD, 
                    HD.ThoiGianLapHD, 
                    HD.TongTien, 
                    HD.KhuyenMai,
                    KH.HoTenKH, 
                    KH.SDTKH,
                    TC.TenTC,
                    TT.PhuongThucTT, 
                    TT.TrangThaiTT
                FROM HOADON HD
                LEFT JOIN THUCUNG TC ON HD.MaTC = TC.MaTC
                LEFT JOIN KHACHHANG KH ON TC.MaKH = KH.MaKH
                LEFT JOIN THONGTINTHANHTOAN TT ON HD.MaHD = TT.MaHD
                INNER JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                WHERE LS.MaCN = :maChiNhanh
                AND CAST(HD.ThoiGianLapHD AS DATE) = :today
                AND (
                    HD.MaHD LIKE :searchLike
                    OR KH.HoTenKH LIKE :searchLike
                    OR KH.SDTKH LIKE :searchLike
                )
                ${statusCondition}
                ORDER BY HD.ThoiGianLapHD DESC
                OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            `;

            const invoices = await sequelize.query(query, {
                replacements: { maChiNhanh, searchLike, offset, limit, today },
                type: QueryTypes.SELECT
            });

            const countQuery = `
                SELECT COUNT(DISTINCT HD.MaHD) as Total
                FROM HOADON HD
                LEFT JOIN THUCUNG TC ON HD.MaTC = TC.MaTC
                LEFT JOIN KHACHHANG KH ON TC.MaKH = KH.MaKH
                LEFT JOIN THONGTINTHANHTOAN TT ON HD.MaHD = TT.MaHD
                INNER JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                WHERE LS.MaCN = :maChiNhanh
                AND CAST(HD.ThoiGianLapHD AS DATE) = :today
                AND (
                    HD.MaHD LIKE :searchLike
                    OR KH.HoTenKH LIKE :searchLike
                    OR KH.SDTKH LIKE :searchLike
                )
                ${statusCondition}
            `;

            const [countResult] = await sequelize.query(countQuery, {
                replacements: { maChiNhanh, searchLike, today },
                type: QueryTypes.SELECT
            });

            const total = countResult ? countResult.Total : 0;

            const list = invoices.map(inv => {
                let statusStr = 'unpaid';
                if (inv.TrangThaiTT === 'Đã thanh toán') statusStr = 'paid';
                
                return {
                    id: inv.MaHD,
                    customer: inv.HoTenKH || "Khách vãng lai",
                    phone: inv.SDTKH || "",
                    pet: inv.TenTC || "",
                    date: inv.ThoiGianLapHD ? new Date(inv.ThoiGianLapHD).toLocaleString('vi-VN') : "",
                    total: inv.TongTien,
                    status: statusStr,
                    paymentMethod: inv.PhuongThucTT || "Chưa thanh toán",
                    paymentStatusText: inv.TrangThaiTT || "Chưa thanh toán",
                    items: [] 
                };
            });

            return { list, total };

        } catch (error) {
            console.error("StaffService getInvoicesByBranch Error:", error);
            throw error;
        }
    }

    static getInvoiceDetail = async (invoiceId) => {
        try {
            const [items] = await sequelize.query(`
                SELECT 
                    SP.TenSP as name, 
                    CT.SoLuong as qty, 
                    CT.DonGia as price
                FROM CHITIETHOADON CT
                JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
                WHERE CT.MaHD = :invoiceId
            `, { replacements: { invoiceId } });

            return items;
        } catch (error) {
            console.error("StaffService getInvoiceDetail Error:", error);
            throw error;
        }
    }

    static getInventory = async ({ maNV, search, filter, page = 1, limit = 20 }) => {
        try {
            const maChiNhanh = await this.getCurrentBranch(maNV);
            if (!maChiNhanh) throw new Error("Nhân viên chưa được phân công vào chi nhánh nào.");

            const searchLike = search ? `%${search}%` : '%';
            const offset = (page - 1) * limit;

            let whereClause = `
                (SP.TenSP LIKE :searchLike OR SP.MaSP LIKE :searchLike)
            `;

            if (filter === 'expiring') {
                whereClause += ` AND (
                    EXISTS (SELECT 1 FROM THUOC T WHERE T.TMaSP = SP.MaSP AND T.HSD <= DATEADD(DAY, 60, GETDATE()))
                    OR 
                    EXISTS (SELECT 1 FROM VACXIN V WHERE V.VMaSP = SP.MaSP AND V.HSD <= DATEADD(DAY, 60, GETDATE()))
                )`;
            }

            const [products] = await sequelize.query(`
                SELECT 
                    SP.MaSP, SP.TenSP, SP.DonViTinh, SP.Gia, SP.SLTonKho,
                    -- Determine product type
                    CASE 
                        WHEN T.TMaSP IS NOT NULL THEN N'Thuốc'
                        WHEN V.VMaSP IS NOT NULL THEN N'Vắc-xin'
                        ELSE N'Sản phẩm khác' 
                    END as LoaiSP,
                    
                    -- Get Expiry/Mfg Dates (Prioritize min HSD if mapped)
                    ISNULL(T.HSD, V.HSD) as HSD,
                    ISNULL(T.NSX, V.NSX) as NSX

                FROM SANPHAM SP
                LEFT JOIN THUOC T ON SP.MaSP = T.TMaSP
                LEFT JOIN VACXIN V ON SP.MaSP = V.VMaSP
                
                WHERE ${whereClause}
                ORDER BY SP.SLTonKho ASC -- Prioritize showing low stock items
                OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            `, {
                replacements: { searchLike, offset, limit }
            });

            const [countResult] = await sequelize.query(`
                SELECT COUNT(*) as Total
                FROM SANPHAM SP
                WHERE ${whereClause}
            `, { replacements: { searchLike } });

            const [alerts] = await sequelize.query(`
                SELECT 
                    (SELECT COUNT(*) FROM SANPHAM WHERE SLTonKho < 10) as LowStock,
                    (
                        SELECT COUNT(*) FROM (
                            SELECT TMaSP FROM THUOC WHERE HSD <= DATEADD(DAY, 60, GETDATE())
                            UNION
                            SELECT VMaSP FROM VACXIN WHERE HSD <= DATEADD(DAY, 60, GETDATE())
                        ) as Expiring
                    ) as ExpiringCount
            `);

            const list = products.map(p => ({
                id: p.MaSP,
                code: p.MaSP,
                name: p.TenSP,
                type: p.LoaiSP,
                price: p.Gia,
                stock: p.SLTonKho,
                minStock: 10,
                mfg: p.NSX ? new Date(p.NSX).toLocaleDateString('en-GB') : '',
                expiry: p.HSD ? new Date(p.HSD).toLocaleDateString('en-GB') : '',
                suppliers: [] 
            }));

            return {
                list,
                total: countResult[0]?.Total || 0,
                stats: {
                    lowStock: alerts[0]?.LowStock || 0,
                    expiring: alerts[0]?.ExpiringCount || 0
                }
            };

        } catch (error) {
            console.error("StaffService getInventory Error:", error);
            throw error;
        }
    }

    static createImportReceipt = async ({ maNV, items }) => {
        const t = await sequelize.transaction();
        try {
            for (const item of items) {
                const [existing] = await sequelize.query(`SELECT MaSP FROM SANPHAM WHERE MaSP = :code`, {
                    replacements: { code: item.code },
                    transaction: t
                });

                if (existing.length > 0) {
                    await sequelize.query(`
                        UPDATE SANPHAM SET SLTonKho = SLTonKho + :qty WHERE MaSP = :code
                    `, {
                        replacements: { qty: item.quantity, code: item.code },
                        transaction: t
                    });
                } else {
                    await sequelize.query(`
                        INSERT INTO SANPHAM (MaSP, TenSP, SLTonKho, Gia, DonViTinh)
                        VALUES (:code, :name, :qty, 0, N'Cái') -- Default price 0, unit 'Cái'
                    `, {
                        replacements: { code: item.code, name: item.name, qty: item.quantity },
                        transaction: t
                    });

                    if (item.type === 'Thuốc') {
                        await sequelize.query(`
                            INSERT INTO THUOC (TMaSP, LoaiThuoc, NSX, HSD, NhaSX)
                            VALUES (:code, N'Chưa phân loại', :nsx, :hsd, N'Chưa cập nhật')
                        `, {
                            replacements: { code: item.code, hsd: item.hsd || null, nsx: item.nsx || null },
                            transaction: t
                        });
                    } else if (item.type === 'Vắc-xin') {
                        await sequelize.query(`
                            INSERT INTO VACXIN (VMaSP, LoaiVacXin, NSX, HSD, NhaSX)
                            VALUES (:code, N'Chưa phân loại', :nsx, :hsd, N'Chưa cập nhật')
                        `, {
                            replacements: { code: item.code, hsd: item.hsd || null, nsx: item.nsx || null },
                            transaction: t
                        });
                    }
                }
            }

            await t.commit();
            return { success: true, message: "Nhập hàng thành công" };

        } catch (error) {
            await t.rollback();
            console.error("StaffService createImportReceipt Error:", error);
            throw error;
        }
    }

    static getReviews = async ({ maNV, search, filter, page = 1, limit = 10 }) => {
        try {
            const maChiNhanh = await this.getCurrentBranch(maNV);
            if (!maChiNhanh) throw new Error("Nhân viên chưa được phân công vào chi nhánh nào.");

            const searchLike = search ? `%${search}%` : '%';
            const offset = (page - 1) * limit;

            let whereClause = `
                LS.MaCN = :maChiNhanh
                AND (KH.HoTenKH LIKE :searchLike OR DG.MaHD LIKE :searchLike)
            `;

            if (filter === 'pending') {
                whereClause += ` AND (DG.BinhLuan IS NOT NULL AND DG.PhanHoi IS NULL)`;
            } else if (filter === 'replied') {
                whereClause += ` AND (DG.PhanHoi IS NOT NULL)`;
            }

            const [reviews] = await sequelize.query(`
                SELECT 
                    DG.MaHD, DG.DiemChatLuong, DG.ThaiDoNV, DG.MucDoHaiLong, DG.BinhLuan, 
                    -- DG.PhanHoi, DG.NgayPhanHoi, -- Uncomment if columns exist
                    HD.ThoiGianLapHD as Date,
                    KH.HoTenKH, 
                    TC.TenTC as PetName,
                    (SELECT TOP 1 TenDV FROM DICHVU DV JOIN CHITIETHOADON CT ON DV.MaDV = (SELECT TOP 1 MaDV FROM LICHSUDICHVU WHERE MaGD = CT.MaGD) WHERE CT.MaHD = DG.MaHD) as ServiceName

                FROM DANHGIA DG
                JOIN HOADON HD ON DG.MaHD = HD.MaHD
                JOIN KHACHHANG KH ON DG.MaKH = KH.MaKH
                LEFT JOIN THUCUNG TC ON HD.MaTC = TC.MaTC
                JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV

                WHERE ${whereClause}
                ORDER BY HD.ThoiGianLapHD DESC
                OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            `, {
                replacements: { maChiNhanh, searchLike, offset, limit }
            });

            const [countResult] = await sequelize.query(`
                SELECT COUNT(*) as Total
                FROM DANHGIA DG
                JOIN HOADON HD ON DG.MaHD = HD.MaHD
                JOIN KHACHHANG KH ON DG.MaKH = KH.MaKH
                JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                WHERE ${whereClause}
            `, { replacements: { maChiNhanh, searchLike } });

            const list = reviews.map(r => {
                const mapRating = (val) => {
                    if (typeof val === 'number') return val;
                    const map = { 'Rất tệ': 1, 'Tệ': 2, 'Bình thường': 3, 'Tốt': 4, 'Rất tốt': 5, 'Rất không hài lòng': 1, 'Không hài lòng': 2, 'Hài lòng': 4, 'Rất hài lòng': 5 };
                    return map[val] || 3;
                };

                return {
                    id: r.MaHD,
                    customer: { name: r.HoTenKH, avatar: "/placeholder-user.jpg" },
                    pet: r.PetName || "Khách lẻ",
                    invoiceId: r.MaHD,
                    service: r.ServiceName || "Mua hàng",
                    date: new Date(r.Date).toLocaleDateString('vi-VN'),
                    ratings: { 
                        quality: mapRating(r.MucDoHaiLong),
                        staff: mapRating(r.ThaiDoNV), 
                        overall: mapRating(r.DiemChatLuong) 
                    },
                    comment: r.BinhLuan,
                    status: r.PhanHoi ? "replied" : "pending",
                    reply: r.PhanHoi ? {
                        content: r.PhanHoi,
                        date: r.NgayPhanHoi ? new Date(r.NgayPhanHoi).toLocaleDateString('vi-VN') : "",
                        staffName: "Cửa hàng"
                    } : null
                };
            });

            return {
                list,
                total: countResult[0]?.Total || 0
            };

        } catch (error) {
            console.error("StaffService getReviews Error:", error);
            throw error;
        }
    }

    static replyReview = async ({ maNV, invoiceId, content }) => {
        try {
            await sequelize.query(`
                UPDATE DANHGIA 
                SET PhanHoi = :content, NgayPhanHoi = GETDATE()
                WHERE MaHD = :invoiceId
            `, {
                replacements: { content, invoiceId }
            });

            return { success: true };
        } catch (error) {
            console.error("StaffService replyReview Error:", error);
            throw error;
        }
    }

    static getProfile = async (maNV) => {
        try {
            const [staff] = await sequelize.query(`
                SELECT MaNV, HoTenNV, NgaySinhNV, GioiTinhNV, LoaiNV, TrangThaiLV
                FROM NHANVIEN
                WHERE MaNV = :maNV
            `, {
                replacements: { maNV }
            });

            if (!staff || staff.length === 0) {
                throw new Error("Không tìm thấy nhân viên");
            }

            const s = staff[0];

            const mapRole = (role) => {
                switch(role) {
                    case 'B': return 'Bác sĩ thú y';
                    case 'T': return 'Tiếp tân';
                    case 'H': return 'Nhân viên bán hàng';
                    case 'Q': return 'Quản lý';
                    default: return 'Nhân viên';
                }
            };

            return {
                MaNV: s.MaNV,
                HoTenNV: s.HoTenNV,
                NgaySinhNV: s.NgaySinhNV,
                GioiTinhNV: s.GioiTinhNV,
                LoaiNV: mapRole(s.LoaiNV), 
                Username: s.MaNV,
                Phone: "0123456789"
            };

        } catch (error) {
            console.error("StaffService getProfile Error:", error);
            throw error;
        }
    }

    static updateProfile = async (maNV, data) => {
        try {
            const { HoTenNV, NgaySinhNV, GioiTinhNV } = data;

            await sequelize.query(`
                UPDATE NHANVIEN
                SET HoTenNV = :HoTenNV,
                    NgaySinhNV = :NgaySinhNV,
                    GioiTinhNV = :GioiTinhNV
                WHERE MaNV = :maNV
            `, {
                replacements: { HoTenNV, NgaySinhNV, GioiTinhNV, maNV }
            });

            return { success: true };
        } catch (error) {
            console.error("StaffService updateProfile Error:", error);
            throw error;
        }
    }

    static checkInAppointment = async ({ maKH, maTC, thoiGianHen, maNV }) => {
        try {
            const formattedDate = new Date(thoiGianHen).toISOString().slice(0, 19).replace('T', ' ');

            const checkInResult = await sequelize.query(`
                DECLARE @OutMaGD VARCHAR(25);
                
                EXEC sp_CheckInKhamBenh 
                    @MaKH = :maKH, 
                    @MaTC = :maTC, 
                    @ThoiGianHen = :formattedDate, 
                    @MaGD_Output = @OutMaGD OUTPUT;

                SELECT @OutMaGD AS MaGD;
            `, {
                replacements: { 
                    maKH, 
                    maTC, 
                    formattedDate 
                },
                type: QueryTypes.SELECT
            });

            const maGD = checkInResult[0]?.MaGD;

            if (!maGD) {
                throw new Error("Không thể tạo mã giao dịch (Check-in thất bại).");
            }

            const invoiceResult = await sequelize.query(`
                DECLARE @OutMaHD VARCHAR(25);

                EXEC sp_LapHoaDon
                    @MaGD = :maGD,
                    @MaTC = :maTC,
                    @MaNV = :maNV,
                    @MaHD_Output = @OutMaHD OUTPUT;
                
                SELECT @OutMaHD AS MaHD;
            `, {
                replacements: { 
                    maGD, 
                    maTC, 
                    maNV 
                },
                type: QueryTypes.SELECT
            });

            const maHD = invoiceResult[0]?.MaHD;

            return {
                maGD: maGD,
                maHD: maHD,
                status: 'confirmed'
            };

        } catch (error) {
            console.error("StaffService checkInAppointment Error:", error);
            if (error.original && error.original.number === 50001) {
                throw new Error("Nhân viên chưa được phân công chi nhánh, không thể lập hóa đơn.");
            }
            throw error;
        }
    }

    static getInvoiceFullDetail = async (invoiceId) => {
        try {
            // 1. Lấy Header (Thêm WITH (NOLOCK) để tránh bị treo nếu bảng đang update)
            const headerList = await sequelize.query(`
                SELECT 
                    HD.MaHD, HD.TongTien, HD.ThoiGianLapHD,
                    KH.MaKH, KH.HoTenKH, KH.SDTKH,
                    TC.MaTC, TC.TenTC
                FROM HOADON HD WITH (NOLOCK)
                LEFT JOIN THUCUNG TC WITH (NOLOCK) ON HD.MaTC = TC.MaTC
                LEFT JOIN KHACHHANG KH WITH (NOLOCK) ON TC.MaKH = KH.MaKH
                WHERE HD.MaHD = :invoiceId
            `, { 
                replacements: { invoiceId }, 
                type: QueryTypes.SELECT 
            });

            // Kiểm tra kỹ mảng trả về
            if (!headerList || headerList.length === 0) {
                throw new Error("Không tìm thấy hóa đơn");
            }
            const header = headerList[0];

            // 2. Lấy Items (Thêm WITH (NOLOCK))
            const items = await sequelize.query(`
                SELECT 
                    CT.MaSP as code,
                    SP.TenSP as name,
                    CT.SoLuong as quantity,
                    CT.DonGia as price,
                    SP.DonViTinh as unit,
                    CASE 
                        WHEN T.TMaSP IS NOT NULL THEN 'product'
                        WHEN V.VMaSP IS NOT NULL THEN 'vaccine'
                        ELSE 'service'
                    END as type
                FROM CHITIETHOADON CT WITH (NOLOCK)
                JOIN SANPHAM SP WITH (NOLOCK) ON CT.MaSP = SP.MaSP
                LEFT JOIN THUOC T WITH (NOLOCK) ON SP.MaSP = T.TMaSP
                LEFT JOIN VACXIN V WITH (NOLOCK) ON SP.MaSP = V.VMaSP
                WHERE CT.MaHD = :invoiceId
            `, { 
                replacements: { invoiceId }, 
                type: QueryTypes.SELECT 
            });

            return {
                info: header,
                items: items
            };

        } catch (error) {
            console.error("StaffService getInvoiceFullDetail Error:", error);
            throw error;
        }
    }

    static submitPayment = async ({ maHD, maKH, hinhThucTT }) => {
        try {
            await sequelize.query(`
                EXEC sp_ThanhToan 
                    @MaHD = :maHD,
                    @MaKH = :maKH,
                    @HinhThucTT = :hinhThucTT
            `, {
                replacements: { maHD, maKH, hinhThucTT }
            });

            return { success: true };
        } catch (error) {
            console.error("StaffService submitPayment Error:", error);
            const sqlError = error?.original || error;
            if (sqlError.message?.includes('đã được thanh toán')) {
                throw new Error("Hóa đơn này đã được thanh toán rồi.");
            }
            throw new Error(sqlError.message || "Lỗi thanh toán.");
        }
    }
}

export default StaffService