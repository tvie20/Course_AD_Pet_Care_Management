import { sequelize } from '../dbs/init.mssql.js'
import { QueryTypes } from 'sequelize' 

class AppointmentService {
    static getAppointmentsByCustomer = async (maKH) => {
        try {
            // QUERY GỐC (Không JOIN Bác sĩ)
            const appointments = await sequelize.query(`
                SELECT 
                    PD.MaKH, 
                    PD.MaTC, 
                    PD.ThoiGianHen, 
                    PD.LoaiHinhDichVu, 
                    PD.TrangThaiPD, 
                    CN.TenCN, 
                    CN.DiaChi,
                    TC.TenTC, 
                    TC.Loai

                FROM PHIEUDAT PD
                JOIN THUCUNG TC ON PD.MaTC = TC.MaTC
                JOIN CHINHANH CN ON PD.MaCN = CN.MaCN

                WHERE PD.MaKH = :maKH
                ORDER BY PD.ThoiGianHen DESC
            `, {
                replacements: { maKH },
                type: QueryTypes.SELECT
            });

            return appointments.map(apt => {
                // 1. Map Trạng Thái
                let uiStatus = 'pending';
                const dbStatus = apt.TrangThaiPD;

                if (dbStatus === 'Đã đặt') uiStatus = 'pending';
                else if (dbStatus === 'Đã duyệt') uiStatus = 'confirmed';
                else if (dbStatus === 'Đã hủy' || dbStatus === 'Hết hạn') uiStatus = 'cancelled';
                else if (dbStatus === 'Hoàn thành') uiStatus = 'completed';

                // 2. Format Ngày Giờ
                const dateObj = new Date(apt.ThoiGianHen);
                const dateStr = dateObj.toLocaleDateString('en-GB'); // dd/mm/yyyy
                const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                return {
                    id: `${apt.MaTC}-${dateObj.getTime()}`,
                    petName: apt.TenTC,
                    petType: apt.Loai,
                    service: apt.LoaiHinhDichVu,
                    date: dateStr,
                    time: timeStr,
                    branch: apt.TenCN,
                    address: apt.DiaChi,
                    
                    // Vì không query bác sĩ nữa nên để mặc định
                    doctor: "Sắp xếp tại quầy", 
                    
                    status: uiStatus,
                    originalStatus: dbStatus
                };
            });

        } catch (error) {
            console.error("AppointmentService Error:", error);
            throw new Error("Lỗi khi lấy danh sách lịch hẹn.");
        }
    }
}

export default AppointmentService