import BookingService from '../services/booking.service.js'

class BookingController {
    createBooking = async (req, res) => {
        const maKH = req.user?.userId || req.headers['x-client-id'];
        const { maTC, maCN, date, time, service, vaccineType } = req.body;

        let fullService = service === 'exam' ? 'Khám bệnh' : 'Tiêm phòng';
        if (vaccineType) fullService += ` (${vaccineType === 'single' ? 'Lẻ' : 'Gói'})`;

        const result = await BookingService.createAppointment({ maKH, maTC, maCN, date, time, service: fullService });
        res.status(201).json({ message: 'Thành công', metadata: result });
    }
}

export default new BookingController();