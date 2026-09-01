import { sequelize } from '../dbs/init.mssql.js'

class BookingService {
    static createAppointment = async ({ maKH, maTC, maCN, date, time, service }) => {
        try {
            const timePart = time.split(' - ')[0];
            const [result] = await sequelize.query(`
                DECLARE @OutTime DATETIME; DECLARE @OutSTT INT;
                EXEC sp_DatLichHen @MaKH=:maKH, @MaTC=:maTC, @MaCN=:maCN, @NgayHen=:date, 
                @GioBatDau=:timePart, @LoaiDichVu=:service, 
                @ThoiGianHenCuThe=@OutTime OUTPUT, @STT_Output=@OutSTT OUTPUT;
                SELECT @OutTime as ExactTime, @OutSTT as STT;
            `, { replacements: { maKH, maTC, maCN, date, timePart, service } });
            return result[0];
        } catch (error) {
            const sqlError = error.original || error;
            if (sqlError.message?.includes('Khung giờ này đã kín chỗ')) throw new Error('Khung giờ đã kín chỗ');
            if (sqlError.message?.includes('Chi nhánh không tồn tại')) throw new Error('Chi nhánh lỗi');
            throw new Error("Lỗi hệ thống khi đặt lịch");
        }
    }
}
export default BookingService