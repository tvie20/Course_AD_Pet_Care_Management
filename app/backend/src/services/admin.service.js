import { sequelize } from '../dbs/init.mssql.js'
import { QueryTypes } from 'sequelize';

class AdminService {
    static getDashboardData = async () => {
        try {
            const today = new Date();
            
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
            const todayStr = today.toISOString().slice(0, 10);

            const lastMonthStartObj = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEndObj = new Date(today.getFullYear(), today.getMonth(), 0); 
            
            const lastMonthStart = lastMonthStartObj.toISOString().slice(0, 10);
            const lastMonthEnd = lastMonthEndObj.toISOString().slice(0, 10);

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

            const calculateChange = (current, previous) => {
                if (previous === 0) return current === 0 ? 0 : 100;
                return ((current - previous) / previous) * 100;
            };

            const revenueCurrentPromise = sequelize.query(
                `EXEC sp_T16_BaoCaoDoanhThu @NgayBatDau = :thisMonthStart, @NgayKetThuc = :todayStr`,
                { replacements: { thisMonthStart, todayStr } }
            );
            const revenueLastPromise = sequelize.query(
                `EXEC sp_T16_BaoCaoDoanhThu @NgayBatDau = :lastMonthStart, @NgayKetThuc = :lastMonthEnd`,
                { replacements: { lastMonthStart, lastMonthEnd } }
            );

            const newCustCurrentPromise = sequelize.query(
                `EXEC sp_T01_KhachHangMoi @NgayBatDau = :thisMonthStart, @NgayKetThuc = :todayStr`,
                { replacements: { thisMonthStart, todayStr } }
            );
            const newCustLastPromise = sequelize.query(
                `EXEC sp_T01_KhachHangMoi @NgayBatDau = :lastMonthStart, @NgayKetThuc = :lastMonthEnd`,
                { replacements: { lastMonthStart, lastMonthEnd } }
            );

            const getServiceCounts = async (start, end) => {
                const [res] = await sequelize.query(`
                    SELECT 
                        SUM(CASE WHEN LoaiHinhDichVu = N'Khám bệnh' THEN 1 ELSE 0 END) as TotalExam,
                        SUM(CASE WHEN LoaiHinhDichVu = N'Tiêm phòng' THEN 1 ELSE 0 END) as TotalVaccine
                    FROM PHIEUDAT
                    WHERE CAST(ThoiGianHen AS DATE) BETWEEN :start AND :end
                    AND TrangThaiPD = N'Đã duyệt'
                `, { replacements: { start, end } });
                return res[0];
            };

            const [
                [revenueCurrentData], [revenueLastData],
                [newCustCurrentData], [newCustLastData],
                serviceCurrentData, serviceLastData,
                [dailyRevenue], [pieData], [branchStats]
            ] = await Promise.all([
                revenueCurrentPromise, revenueLastPromise,
                newCustCurrentPromise, newCustLastPromise,
                getServiceCounts(thisMonthStart, todayStr), getServiceCounts(lastMonthStart, lastMonthEnd),
                sequelize.query(`
                    SELECT CAST(hd.ThoiGianLapHD AS DATE) as date, SUM(hd.TongTien) as total
                    FROM HOADON hd
                    WHERE CAST(hd.ThoiGianLapHD AS DATE) BETWEEN :sevenDaysAgoStr AND :todayStr
                    GROUP BY CAST(hd.ThoiGianLapHD AS DATE) ORDER BY date ASC
                `, { replacements: { sevenDaysAgoStr, todayStr } }),
                sequelize.query(`
                    SELECT LoaiHinhDichVu, COUNT(*) as count FROM PHIEUDAT 
                    WHERE TrangThaiPD = N'Đã duyệt' AND CAST(ThoiGianHen AS DATE) BETWEEN :thisMonthStart AND :todayStr
                    GROUP BY LoaiHinhDichVu
                `, { replacements: { thisMonthStart, todayStr } }),
                sequelize.query(`EXEC sp_T18_SoSanhChiNhanh @NgayBatDau = :thisMonthStart, @NgayKetThuc = :todayStr`, 
                { replacements: { thisMonthStart, todayStr } })
            ]);

            const revCurr = revenueCurrentData[0]?.DoanhThuGop || 0;
            const revLast = revenueLastData[0]?.DoanhThuGop || 0;
            const revChange = calculateChange(revCurr, revLast);

            const custCurr = newCustCurrentData[0]?.SoLuongKhachMoi || 0;
            const custLast = newCustLastData[0]?.SoLuongKhachMoi || 0;
            const custChange = calculateChange(custCurr, custLast);

            const examCurr = serviceCurrentData?.TotalExam || 0;
            const examLast = serviceLastData?.TotalExam || 0;
            const examChange = calculateChange(examCurr, examLast);

            const vacCurr = serviceCurrentData?.TotalVaccine || 0;
            const vacLast = serviceLastData?.TotalVaccine || 0;
            const vacChange = calculateChange(vacCurr, vacLast);

            const fmtChange = (val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
            const getTrend = (val) => val >= 0 ? 'up' : 'down';

            const kpi = {
                revenue: { value: revCurr, change: fmtChange(revChange), trend: getTrend(revChange) },
                exams: { value: examCurr, change: fmtChange(examChange), trend: getTrend(examChange) },
                vaccines: { value: vacCurr, change: fmtChange(vacChange), trend: getTrend(vacChange) },
                newCustomers: { value: custCurr, change: fmtChange(custChange), trend: getTrend(custChange) }
            };

            const chartData = dailyRevenue.map(item => ({
                date: new Date(item.date).toLocaleDateString('en-GB').slice(0, 5),
                doanhThu: item.total / 1000000, 
                mucTieu: 10 
            }));

            const serviceDistribution = pieData.map(item => ({
                name: item.LoaiHinhDichVu,
                value: item.count
            }));

            const branches = branchStats.map(b => ({
                name: b.TenChiNhanh,
                revenue: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.DoanhThuThucTe),
                visits: b.TongHoaDon,
                status: b.DoanhThuThucTe > 500000000 ? "Tốt" : (b.DoanhThuThucTe > 200000000 ? "Ổn định" : "Cần cải thiện")
            }));

            return { kpi, chartData, serviceDistribution, branches };

        } catch (error) {
            console.error("AdminService getDashboardData Error:", error);
            throw error;
        }
    }

    static getBranchRevenue = async ({ maCN, fromDate, toDate }) => {
        try {
            if (!fromDate || !toDate) throw new Error("Missing date range");

            const [stats] = await sequelize.query(`
                SELECT 
                    SUM(CASE WHEN LoaiHinhDichVu = N'Khám bệnh' THEN 1 ELSE 0 END) as TotalExam,
                    SUM(CASE WHEN LoaiHinhDichVu = N'Tiêm phòng' THEN 1 ELSE 0 END) as TotalVaccine
                FROM PHIEUDAT
                WHERE MaCN = :maCN 
                AND CAST(ThoiGianHen AS DATE) BETWEEN :fromDate AND :toDate
                AND TrangThaiPD = N'Đã xong'
            `, { replacements: { maCN, fromDate, toDate } });

            const [salesStats] = await sequelize.query(`
                SELECT COUNT(DISTINCT HD.MaHD) as TotalSales
                FROM HOADON HD
                JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                WHERE LS.MaCN = :maCN
                AND CAST(HD.ThoiGianLapHD AS DATE) BETWEEN :fromDate AND :toDate
            `, { replacements: { maCN, fromDate, toDate } });

            const statistics = {
                tiem: stats[0]?.TotalVaccine || 0,
                kham: stats[0]?.TotalExam || 0,
                ban_sp: salesStats[0]?.TotalSales || 0
            };

            const [dailyRevenue] = await sequelize.query(`
                SELECT 
                    CAST(HD.ThoiGianLapHD AS DATE) as fullDate,
                    SUM(HD.TongTien) as doanhThu
                FROM HOADON HD
                JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                WHERE LS.MaCN = :maCN
                AND CAST(HD.ThoiGianLapHD AS DATE) BETWEEN :fromDate AND :toDate
                GROUP BY CAST(HD.ThoiGianLapHD AS DATE)
                ORDER BY fullDate ASC
            `, { replacements: { maCN, fromDate, toDate } });

            const chartData = dailyRevenue.map(item => ({
                date: new Date(item.fullDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                fullDate: item.fullDate,
                doanhThu: item.doanhThu / 1000000
            }));

            const totalRevenue = dailyRevenue.reduce((sum, item) => sum + item.doanhThu, 0);

            const [branchInfo] = await sequelize.query(`
                SELECT TenCN FROM CHINHANH WHERE MaCN = :maCN
            `, { replacements: { maCN } });

            return {
                branchName: branchInfo[0]?.TenCN || "Chi nhánh",
                stats: statistics,
                chartData: chartData,
                totalRevenue: totalRevenue
            };

        } catch (error) {
            console.error("AdminService getBranchRevenue Error:", error);
            throw error;
        }
    }

    static getDoctorPerformance = async ({ maCN, fromDate, toDate }) => {
        try {
            const [doctors] = await sequelize.query(`
                SELECT 
                    NV.HoTenNV as name,
                    COUNT(KB.KMaGD) as luotKham,
                    ISNULL(SUM(CT.ThanhTien), 0) as doanhThu
                FROM BACSITHUY BS
                JOIN NHANVIEN NV ON BS.BMaNV = NV.MaNV
                -- Lọc bác sĩ thuộc chi nhánh này (Dựa vào lịch sử công tác hiện tại)
                JOIN LICHSUCONGTAC LS_NV ON NV.MaNV = LS_NV.MaNV 
                    AND LS_NV.NgayVaoLam <= GETDATE() 
                    AND (LS_NV.NgayChuyen IS NULL OR LS_NV.NgayChuyen >= GETDATE())
                
                -- Join để lấy dữ liệu khám và doanh thu
                LEFT JOIN KHAMBENH KB ON BS.BMaNV = KB.BMaNV 
                    AND CAST(KB.NgayKham AS DATE) BETWEEN :fromDate AND :toDate
                LEFT JOIN LICHSUDICHVU LSDV ON KB.KMaGD = LSDV.MaGD
                LEFT JOIN CHITIETHOADON CT ON LSDV.MaGD = CT.MaGD

                WHERE LS_NV.MaCN = :maCN
                GROUP BY NV.HoTenNV
                ORDER BY doanhThu DESC
            `, { 
                replacements: { maCN, fromDate, toDate } 
            });

            const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
            
            const result = doctors.map((doc, index) => ({
                name: doc.name,
                luotKham: doc.luotKham,
                doanhThu: doc.doanhThu / 1000000,
                doanhThuRaw: doc.doanhThu,
                color: colors[index % colors.length]
            }));

            return result;

        } catch (error) {
            console.error("AdminService getDoctorPerformance Error:", error);
            throw error;
        }
    }

    static getProductStats = async ({ maCN, fromDate, toDate }) => {
        try {
            if (!maCN || !fromDate || !toDate) throw new Error("Missing parameters");

            const [products] = await sequelize.query(`
                SELECT 
                    SP.MaSP, 
                    SP.TenSP, 
                    SP.Gia as Price,
                    -- Xác định danh mục dựa trên LoaiSP ('T': Thuốc, 'V': Vắc-xin, 'H': Hàng hóa)
                    CASE 
                        WHEN SP.LoaiSP = 'T' THEN N'Thuốc'
                        WHEN SP.LoaiSP = 'V' THEN N'Vắc-xin'
                        WHEN SP.LoaiSP = 'H' THEN N'Hàng hóa/Phụ kiện'
                        ELSE N'Khác'
                    END as Category,
                    SUM(CT.SoLuong) as Sold,
                    SUM(CT.ThanhTien) as Revenue
                FROM CHITIETHOADON CT
                JOIN HOADON HD ON CT.MaHD = HD.MaHD
                JOIN LICHSUCONGTAC LS ON HD.HMaNV = LS.MaNV
                JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
                
                WHERE LS.MaCN = :maCN
                AND CT.MaSP IS NOT NULL -- Chỉ lấy sản phẩm, bỏ qua dịch vụ
                AND CAST(HD.ThoiGianLapHD AS DATE) BETWEEN :fromDate AND :toDate
                
                GROUP BY SP.MaSP, SP.TenSP, SP.Gia, SP.LoaiSP
                ORDER BY Revenue DESC
            `, { replacements: { maCN, fromDate, toDate } });

            const categoryStats = products.reduce((acc, curr) => {
                const cat = curr.Category;
                if (!acc[cat]) {
                    acc[cat] = { name: cat, value: 0, color: '' };
                }
                acc[cat].value += curr.Revenue;
                return acc;
            }, {});

            const colors = {
                'Thuốc': '#ef4444',
                'Vắc-xin': '#3b82f6',
                'Hàng hóa/Phụ kiện': '#f59e0b',
                'Khác': '#10b981'
            };

            const chartData = Object.values(categoryStats).map((c) => ({
                ...c,
                color: colors[c.name] || '#94a3b8'
            }));

            const productList = products.map(p => ({
                id: p.MaSP,
                name: p.TenSP,
                category: p.Category,
                price: p.Price,
                sold: p.Sold,
                revenue: p.Revenue
            }));

            return {
                products: productList,
                categories: chartData
            };

        } catch (error) {
            console.error("AdminService getProductStats Error:", error);
            throw error;
        }
    }

    static getAllBranchesFull = async () => {
        try {
            const branches = await sequelize.query(`
                SELECT 
                    CN.MaCN as id, 
                    CN.TenCN as name, 
                    CN.DiaChi as address, 
                    CN.SDTCN as phone, -- Sửa tên cột cho đúng DB
                    
                    -- Vì bảng CHINHANH không có cột QuanLy, ta tạm để text mặc định
                    -- Hoặc có thể query tìm nhân viên có chức vụ Quản lý tại chi nhánh này nếu muốn logic phức tạp hơn
                    N'Chưa cập nhật' as manager, 
                    
                    -- Đếm nhân sự (Giữ nguyên logic đếm)
                    SUM(CASE WHEN NV.LoaiNV = 'B' THEN 1 ELSE 0 END) as doctors,
                    SUM(CASE WHEN NV.LoaiNV = 'T' THEN 1 ELSE 0 END) as reception,
                    SUM(CASE WHEN NV.LoaiNV = 'H' THEN 1 ELSE 0 END) as sales,
                    SUM(CASE WHEN NV.LoaiNV = 'Q' THEN 1 ELSE 0 END) as managers

                FROM CHINHANH CN
                LEFT JOIN LICHSUCONGTAC LS ON CN.MaCN = LS.MaCN AND LS.NgayChuyen IS NULL
                LEFT JOIN NHANVIEN NV ON LS.MaNV = NV.MaNV
                
                -- Group by các cột có trong bảng CHINHANH
                GROUP BY CN.MaCN, CN.TenCN, CN.DiaChi, CN.SDTCN
            `, { type: QueryTypes.SELECT });

            return branches.map(b => ({
                id: b.id,
                name: b.name,
                address: b.address,
                phone: b.phone,
                manager: b.manager,
                status: "Active", 
                staffDetail: {
                    doctors: b.doctors || 0,
                    reception: b.reception || 0,
                    sales: b.sales || 0,
                    manager: b.managers || 0
                }
            }));
        } catch (error) {
            console.error("AdminService getAllBranchesFull Error:", error);
            throw error;
        }
    }
}

export default AdminService