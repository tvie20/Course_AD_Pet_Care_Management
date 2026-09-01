import AppointmentService from '../services/appointment.service.js'

class AppointmentController {
    getAppointments = async (req, res, next) => {
        try {
            const maKH = req.headers['x-client-id'];
            if (!maKH) {
                return res.status(401).json({ 
                    message: "Vui lòng đăng nhập để xem lịch hẹn." 
                });
            }

            const appointments = await AppointmentService.getAppointmentsByCustomer(maKH);

            return res.status(200).json({
                message: 'Lấy danh sách lịch hẹn thành công',
                metadata: appointments
            });

        } catch (error) {
            console.error("AppointmentController Error:", error);
            return res.status(500).json({ 
                message: "Lỗi hệ thống, không thể lấy dữ liệu." 
            });
        }
    }
}

export default new AppointmentController()