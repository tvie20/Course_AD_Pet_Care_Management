import { sequelize } from '../dbs/init.mssql.js'
import { QueryTypes } from 'sequelize'

class DoctorService {
    static getDashboardData = async (maNV) => {
        try {
            const today = new Date().toISOString().slice(0, 10);

            const staffHistory = await sequelize.query(`
                SELECT TOP 1 MaCN 
                FROM LICHSUCONGTAC 
                WHERE MaNV = :maNV
                ORDER BY NgayVaoLam DESC
            `, {
                replacements: { maNV },
                type: QueryTypes.SELECT
            });

            if (!staffHistory || staffHistory.length === 0) {
                return { 
                    stats: [], examQueue: [], vaccineQueue: [], 
                    error: "Bác sĩ chưa được phân công vào chi nhánh nào." 
                };
            }

            const currentBranchID = staffHistory[0].MaCN;

            const allAppointments = await sequelize.query(`
                SELECT 
                    PD.MaKH, PD.MaTC, PD.ThoiGianHen, PD.LoaiHinhDichVu, PD.TrangThaiPD, 
                    PD.MaCN,
                    KH.HoTenKH, 
                    TC.TenTC, TC.Loai, TC.Giong
                FROM PHIEUDAT PD
                JOIN KHACHHANG KH ON PD.MaKH = KH.MaKH
                JOIN THUCUNG TC ON PD.MaTC = TC.MaTC
                WHERE CAST(PD.ThoiGianHen AS DATE) = :today
                AND PD.MaCN = :maCN
                AND PD.TrangThaiPD = N'Đã duyệt'
            `, {
                replacements: { 
                    today, 
                    maCN: currentBranchID 
                },
                type: QueryTypes.SELECT
            });

            const stats = {
                total: allAppointments.length,
                completed: 0, 
                waitingExam: 0,
                waitingVaccine: 0
            };

            const examQueue = [];
            const vaccineQueue = [];

            allAppointments.forEach((item, index) => {
                if (item.TrangThaiPD === 'Đã duyệt') {
                    if (item.LoaiHinhDichVu === 'Khám bệnh') stats.waitingExam++;
                    if (item.LoaiHinhDichVu === 'Tiêm phòng') stats.waitingVaccine++;
                }
                
                if (['Đã duyệt'].includes(item.TrangThaiPD)) {
                    const dateObj = new Date(item.ThoiGianHen);
                    const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    
                    let status = 'booked'; 
                    if (item.TrangThaiPD === 'Đã duyệt') status = 'waiting';

                    const uniqueId = `${item.MaKH}_${item.MaTC}_${index}`;
                    
                    const commonData = {
                        id: uniqueId,
                        time: timeStr,
                        customer: item.HoTenKH,
                        pet: item.TenTC,
                        type: `${item.Loai || ''} ${item.Giong || ''}`.trim(),
                        status: status
                    };

                    if (item.LoaiHinhDichVu === 'Khám bệnh') {
                        examQueue.push({
                            ...commonData,
                            reason: "Khám lâm sàng"
                        });
                    } else if (item.LoaiHinhDichVu === 'Tiêm phòng') {
                        vaccineQueue.push({
                            ...commonData,
                            vaccine: "Vaccine theo lịch"
                        });
                    }
                }
            });

            const notes = [
                "Ưu tiên khám các ca cấp cứu.",
                "Kiểm tra kỹ hạn sử dụng vaccine.",
                "Hệ thống đang lọc theo chi nhánh hiện tại của bạn.",
            ];

            return {
                currentBranch: currentBranchID,
                stats: [
                    { label: "Tổng lịch hẹn", value: stats.total, icon: "CalendarCheck", color: "text-blue-600 bg-blue-50" },
                    { label: "Đã hoàn thành", value: stats.completed, icon: "Stethoscope", color: "text-emerald-600 bg-emerald-50" },
                    { label: "Đang chờ khám", value: stats.waitingExam, icon: "Clock", color: "text-orange-600 bg-orange-50" },
                    { label: "Đang chờ tiêm", value: stats.waitingVaccine, icon: "Syringe", color: "text-purple-600 bg-purple-50" },
                ],
                examQueue,
                vaccineQueue,
                notes
            };

        } catch (error) {
            console.error("DoctorService getDashboardData Error:", error);
            throw error;
        }
    }

    static getExamQueue = async (maNV) => {
        try {
            const today = new Date().toISOString().slice(0, 10);
            
            const staffHistory = await sequelize.query(`
                SELECT TOP 1 MaCN 
                FROM LICHSUCONGTAC 
                WHERE MaNV = :maNV
                ORDER BY NgayVaoLam DESC
            `, {
                replacements: { maNV },
                type: QueryTypes.SELECT
            });

            if (!staffHistory || staffHistory.length === 0) {
                return [];
            }

            const currentBranchID = staffHistory[0].MaCN;

            const queue = await sequelize.query(`
                SELECT 
                    PD.MaKH, PD.MaTC, PD.ThoiGianHen, PD.STT as [order],
                    TC.TenTC as pet, TC.Loai as species, TC.Giong as breed, 
                    DATEDIFF(month, TC.NgaySinhTC, GETDATE()) / 12 as age_years,
                    TC.GioiTinhTC as gender,
                    KH.HoTenKH as owner, KH.SDTKH as phone
                FROM PHIEUDAT PD
                JOIN THUCUNG TC ON PD.MaTC = TC.MaTC
                JOIN KHACHHANG KH ON PD.MaKH = KH.MaKH
                WHERE CAST(PD.ThoiGianHen AS DATE) = :today
                AND PD.LoaiHinhDichVu = N'Khám bệnh'
                AND PD.TrangThaiPD = N'Đã duyệt'
                AND PD.MaCN = :maCN
                ORDER BY PD.ThoiGianHen ASC
            `, {
                replacements: { 
                    today,
                    maCN: currentBranchID
                },
                type: QueryTypes.SELECT
            });

            return queue.map(item => ({
                id: `${item.MaKH}_${item.MaTC}_${new Date(item.ThoiGianHen).getTime()}`,
                order: item.order,
                pet: item.pet,
                species: item.species,
                breed: item.breed,
                age: item.age_years > 0 ? `${item.age_years} tuổi` : "Dưới 1 tuổi",
                gender: item.gender,
                owner: item.owner,
                phone: item.phone,
                image: null,
                examCount: 0, 
                vaccineCount: 0, 
                status: 'waiting',
                MaKH: item.MaKH,
                MaTC: item.MaTC
            }));

        } catch (error) {
            console.error("DoctorService getExamQueue Error:", error);
            throw error;
        }
    }

    static searchMedicines = async (keyword) => {
        try {
            const searchTerm = `%${keyword}%`;
            const [medicines] = await sequelize.query(`
                SELECT 
                    T.TMaSP as id, T.TMaSP as code, SP.TenSP as name, 
                    SP.DonViTinh as unit, SP.Gia as price, SP.SLTonKho as stock
                FROM THUOC T
                JOIN SANPHAM SP ON T.TMaSP = SP.MaSP
                WHERE SP.TenSP LIKE :searchTerm OR T.TMaSP LIKE :searchTerm
                AND SP.SLTonKho > 0
            `, {
                replacements: { searchTerm }
            });
            return medicines;
        } catch (error) {
            console.error("DoctorService searchMedicines Error:", error);
            throw error;
        }
    }

    static getPetHistory = async (petId) => {
        try {
            const [history] = await sequelize.query(`
                SELECT TOP 10
                    KB.NgayKham as date,
                    KB.ChanDoan as diagnosis,
                    NV.HoTenNV as doctor,
                    N'Khám bệnh' as type
                FROM KHAMBENH KB
                JOIN BACSITHUY BS ON KB.BMaNV = BS.BMaNV
                JOIN NHANVIEN NV ON BS.BMaNV = NV.MaNV
                JOIN LICHSUDICHVU LSDV ON KB.KMaGD = LSDV.MaGD
                -- Đoạn JOIN này cần kiểm tra kỹ với dữ liệu thực tế
                -- Tạm thời bỏ bớt các JOIN phức tạp nếu không cần thiết ngay
                ORDER BY KB.NgayKham DESC
            `);
            return history;
        } catch (error) {
            console.error("DoctorService getPetHistory Error:", error);
            throw error;
        }
    }

    static submitExamination = async (data) => {
        try {
            const { 
                maKH, maTC, maNV, 
                trieuChung, chanDoan, ngayTaiKham, 
                prescription, 
                thoiGianHen   
            } = data;

            const appointmentTime = new Date(thoiGianHen).toISOString().slice(0, 19).replace('T', ' ');
            
            const findInfoQuery = `
                SELECT TOP 1 
                    LS.MaGD, 
                    HD.MaHD
                FROM LICHSUDICHVU LS
                JOIN PHIEUDAT PD ON PD.MaKH = :maKH AND PD.MaTC = :maTC
                LEFT JOIN CHITIETHOADON CT ON LS.MaGD = CT.MaGD 
                LEFT JOIN HOADON HD ON CT.MaHD = HD.MaHD
                WHERE PD.ThoiGianHen = :appointmentTime
            `;

            const [infoResult] = await sequelize.query(`
                SELECT TOP 1 
                    LS.MaGD,
                    HD.MaHD
                FROM LICHSUDICHVU LS
                JOIN CHITIETHOADON CT ON LS.MaGD = CT.MaGD
                JOIN HOADON HD ON CT.MaHD = HD.MaHD
                WHERE HD.MaTC = :maTC 
                AND CAST(HD.ThoiGianLapHD AS DATE) = CAST(:appointmentTime AS DATE)
                AND HD.HMaNV IS NOT NULL
                ORDER BY HD.ThoiGianLapHD DESC
            `, {
                replacements: { maTC, appointmentTime },
                type: QueryTypes.SELECT
            });

            if (!infoResult || !infoResult.MaGD) {
                throw new Error("Không tìm thấy thông tin Check-in (Mã GD/Hóa đơn). Vui lòng kiểm tra xem Lễ tân đã Check-in chưa.");
            }

            const { MaGD, MaHD } = infoResult;

            await sequelize.query(`
                EXEC sp_GhiNhanKetQuaKham 
                    @MaGD = :MaGD,
                    @MaBS = :maNV,
                    @NgayTaiKham = :ngayTaiKham,
                    @TrieuChung = :trieuChung,
                    @ChanDoan = :chanDoan
            `, {
                replacements: { 
                    MaGD, maNV, 
                    ngayTaiKham: ngayTaiKham || null, 
                    trieuChung, chanDoan 
                }
            });

            if (prescription && prescription.length > 0) {
                for (const item of prescription) {
                    await sequelize.query(`
                        EXEC sp_KeToaThuoc
                            @MaGD = :MaGD,
                            @MaThuoc = :medicineId,
                            @SoLuong = :quantity,
                            @LieuDung = :dosage,
                            @HuongDan = :note
                    `, {
                        replacements: {
                            MaGD,
                            medicineId: item.medicineId,
                            quantity: item.quantity,
                            dosage: item.dosage,
                            note: item.note || null
                        }
                    });
                }

                if (MaHD) {
                    await sequelize.query(`
                        EXEC sp_CapNhatHoaDon
                            @MaHD = :MaHD,
                            @MaGD = :MaGD
                    `, {
                        replacements: { MaHD, MaGD }
                    });
                }
            }

            await sequelize.query(`
                UPDATE PHIEUDAT 
                SET TrangThaiPD = N'Đã xong'
                WHERE MaKH = :maKH 
                  AND MaTC = :maTC 
                  AND ThoiGianHen = :appointmentTime
                  AND LoaiHinhDichVu = N'Khám bệnh'
            `, {
                replacements: { maKH, maTC, appointmentTime }
            });

            return { success: true, message: "Hoàn tất khám bệnh & Cập nhật hóa đơn!", transactionId: MaGD };

        } catch (error) {
            console.error("DoctorService submitExamination Error:", error);
            const sqlError = error?.original || error;
            throw new Error(sqlError.message || "Lỗi hệ thống khi lưu kết quả khám.");
        }
    }

    static getVaccineQueue = async () => {
        try {
            const today = new Date().toISOString().slice(0, 10);
            
            const [queue] = await sequelize.query(`
                SELECT 
                    PD.MaKH, PD.MaTC, PD.ThoiGianHen, PD.STT as [order],
                    TC.TenTC as pet, TC.Loai as species, TC.Giong as breed, 
                    DATEDIFF(month, TC.NgaySinhTC, GETDATE()) / 12 as age_years,
                    KH.HoTenKH as owner, KH.SDTKH as phone,
                    -- Kiểm tra xem thú cưng có gói tiêm còn hiệu lực không
                    (SELECT TOP 1 GT.MaGT 
                     FROM GOITIEM GT 
                     -- Giả sử có bảng liên kết khách hàng mua gói, nếu chưa có thì logic này cần điều chỉnh theo DB thực tế
                     -- Tạm thời để null nếu chưa rõ cấu trúc mua gói
                     WHERE 1=0) as hasPackage
                FROM PHIEUDAT PD
                JOIN THUCUNG TC ON PD.MaTC = TC.MaTC
                JOIN KHACHHANG KH ON PD.MaKH = KH.MaKH
                WHERE CAST(PD.ThoiGianHen AS DATE) = :today
                AND PD.LoaiHinhDichVu = N'Tiêm phòng'
                AND PD.TrangThaiPD IN (N'Đã duyệt', N'Đang khám')
                ORDER BY PD.ThoiGianHen ASC
            `, {
                replacements: { today }
            });

            return queue.map(item => ({
                id: `${item.MaKH}_${item.MaTC}_${new Date(item.ThoiGianHen).getTime()}`,
                order: item.order,
                pet: item.pet,
                species: item.species,
                breed: item.breed,
                age: item.age_years > 0 ? `${item.age_years} tuổi` : "Dưới 1 tuổi",
                owner: item.owner,
                phone: item.phone,
                image: null,
                vaccineHistory: 0, 
                hasPackage: !!item.hasPackage,
                packageName: item.hasPackage ? "Gói tiêm ưu đãi" : "",
                packageRemaining: 0,
                MaKH: item.MaKH,
                MaTC: item.MaTC
            }));
        } catch (error) {
            console.error("DoctorService getVaccineQueue Error:", error);
            throw error;
        }
    }

    static searchVaccines = async (keyword) => {
        try {
            const searchTerm = `%${keyword}%`;
            const [vaccines] = await sequelize.query(`
                SELECT 
                    V.VMaSP as id, V.VMaSP as code, SP.TenSP as name, 
                    V.LoaiVacXin as type, SP.DonViTinh as unit, SP.SLTonKho as stock,
                    V.HSD as expiry, 'Lô Mặc Định' as lot
                FROM VACXIN V
                JOIN SANPHAM SP ON V.VMaSP = SP.MaSP
                WHERE (SP.TenSP LIKE :searchTerm OR V.VMaSP LIKE :searchTerm)
                AND SP.SLTonKho > 0
            `, {
                replacements: { searchTerm }
            });
            
            return vaccines.map(v => ({
                ...v,
                expiry: new Date(v.expiry).toLocaleDateString('vi-VN'),
                warning: v.stock < 10 
            }));
        } catch (error) {
            console.error("DoctorService searchVaccines Error:", error);
            throw error;
        }
    }

    static getVaccineHistory = async (petId) => {
        try {
            const [history] = await sequelize.query(`
                SELECT 
                    TP.ThoiGianTiem as date,
                    SP.TenSP as vaccine,
                    TP.LoaiHinhTiem as type,
                    NV.HoTenNV as doctor
                    -- batch/nextDue cần thêm cột vào bảng TIEMPHONG nếu muốn lưu
                FROM TIEMPHONG TP
                JOIN VACXIN V ON TP.VMaSP = V.VMaSP
                JOIN SANPHAM SP ON V.VMaSP = SP.MaSP
                JOIN BACSITHUY BS ON TP.BMaNV = BS.BMaNV
                JOIN NHANVIEN NV ON BS.BMaNV = NV.MaNV
                JOIN LICHSUDICHVU L ON TP.TMaGD = L.MaGD
                JOIN CHITIETHOADON CTHD ON L.MaGD = CTHD.MaGD
                JOIN HOADON HD ON CTHD.MaHD = HD.MaHD
                WHERE HD.MaTC = :petId
                ORDER BY TP.ThoiGianTiem DESC
            `, {
                replacements: { petId }
            });
            return history;
        } catch (error) {
            console.error("DoctorService getVaccineHistory Error:", error);
            throw error;
        }
    }

    static submitVaccination = async (data) => {
        const t = await sequelize.transaction();
        try {
            const { 
                maKH, maTC, maNV, 
                vaccineId, dosage, nextDate, type 
            } = data;

            const maGD = `TP${Date.now().toString().slice(-8)}`;
            
            await sequelize.query(`
                INSERT INTO LICHSUDICHVU (MaGD, MaDV) VALUES (:maGD, 'DV002') -- DV002: Tiêm phòng
            `, { replacements: { maGD }, transaction: t });

            const today = new Date().toISOString();
            
            await sequelize.query(`
                INSERT INTO TIEMPHONG (TMaGD, ThoiGianTiem, LieuLuongTiem, LoaiHinhTiem, MaGT, VMaSP, BMaNV)
                VALUES (:maGD, GETDATE(), :dosage, :type, NULL, :vaccineId, :maNV)
            `, { 
                replacements: { 
                    maGD, 
                    dosage: parseFloat(dosage) || 1,
                    type: type === 'package' ? 'Gói' : 'Lẻ',
                    vaccineId, 
                    maNV 
                }, 
                transaction: t 
            });

            await sequelize.query(`
                UPDATE SANPHAM SET SLTonKho = SLTonKho - 1
                WHERE MaSP = :vaccineId
            `, { replacements: { vaccineId }, transaction: t });

            const todayDate = new Date().toISOString().slice(0, 10);
            await sequelize.query(`
                UPDATE PHIEUDAT 
                SET TrangThaiPD = N'Hoàn thành'
                WHERE MaKH = :maKH AND MaTC = :maTC 
                AND CAST(ThoiGianHen AS DATE) = :todayDate
                AND LoaiHinhDichVu = N'Tiêm phòng'
            `, { 
                replacements: { maKH, maTC, todayDate }, 
                transaction: t 
            });

            await t.commit();
            return { success: true, message: "Vaccination saved successfully" };

        } catch (error) {
            await t.rollback();
            console.error("DoctorService submitVaccination Error:", error);
            throw error;
        }
    }

    static getProfile = async (userId) => {
        try {
            const [profile] = await sequelize.query(`
                SELECT 
                    NV.MaNV, NV.HoTenNV, NV.NgaySinhNV, NV.GioiTinhNV, NV.LoaiNV,
                    BS.ChungChiHanhNghe, BS.ChuyenKhoa, BS.SoNamKinhNghiem
                    -- Không select Username/Password vì lý do bảo mật, hoặc select riêng nếu cần
                FROM NHANVIEN NV
                LEFT JOIN BACSITHUY BS ON NV.MaNV = BS.BMaNV
                WHERE NV.MaNV = :userId
            `, {
                replacements: { userId }
            });

            if (!profile || profile.length === 0) {
                throw new Error("Doctor not found");
            }

            return profile[0];
        } catch (error) {
            console.error("DoctorService getProfile Error:", error);
            throw error;
        }
    }

    static updateProfile = async (userId, data) => {
        const t = await sequelize.transaction();
        try {
            const { HoTenNV, NgaySinhNV, GioiTinhNV, ChungChiHanhNghe, ChuyenKhoa, SoNamKinhNghiem } = data;

            await sequelize.query(`
                UPDATE NHANVIEN 
                SET HoTenNV = :HoTenNV, NgaySinhNV = :NgaySinhNV, GioiTinhNV = :GioiTinhNV
                WHERE MaNV = :userId
            `, {
                replacements: { HoTenNV, NgaySinhNV, GioiTinhNV, userId },
                transaction: t
            });

            await sequelize.query(`
                UPDATE BACSITHUY
                SET ChungChiHanhNghe = :ChungChiHanhNghe, ChuyenKhoa = :ChuyenKhoa, SoNamKinhNghiem = :SoNamKinhNghiem
                WHERE BMaNV = :userId
            `, {
                replacements: { ChungChiHanhNghe, ChuyenKhoa, SoNamKinhNghiem, userId },
                transaction: t
            });

            await t.commit();
            return { success: true };
        } catch (error) {
            await t.rollback();
            console.error("DoctorService updateProfile Error:", error);
            throw error;
        }
    }
}

export default DoctorService