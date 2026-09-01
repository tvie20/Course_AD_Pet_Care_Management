import DoctorService from '../services/doctor.service.js'

class DoctorController {
    
    getDashboard = async (req, res, next) => {
        try {
            const maNV = req.user.userId;
            if (!maNV) {
                return res.status(401).json({ message: "Không xác thực được người dùng" });
            }

            const data = await DoctorService.getDashboardData(maNV);

            return res.status(200).json({
                message: 'Success',
                metadata: data
            });
        } catch (error) {
            next(error);
        }
    }

    getExamQueue = async (req, res, next) => {
        try {
            const maNV = req.user.userId; 
            if (!maNV) {
                return res.status(401).json({ message: "Chưa xác thực người dùng" });
            }

            const data = await DoctorService.getExamQueue(maNV);

            return res.status(200).json({
                message: 'Success',
                metadata: data
            });
        } catch (error) {
            next(error);
        }
    }

    searchMedicines = async (req, res, next) => {
        const { q } = req.query;
        if (!q) return res.status(200).json({ metadata: [] });
        
        const data = await DoctorService.searchMedicines(q);
        return res.status(200).json({
            message: 'Search medicines success',
            metadata: data
        })
    }

    getPetHistory = async (req, res, next) => {
        const { petId } = req.params;
        const data = await DoctorService.getPetHistory(petId);
        return res.status(200).json({
            message: 'Get pet history success',
            metadata: data
        })
    }

    submitExamination = async (req, res, next) => {
        try {
            const maNV = req.user.userId;
            
            const { 
                maKH, maTC, thoiGianHen, 
                trieuChung, chanDoan, 
                ngayTaiKham, prescription 
            } = req.body;

            if (!maKH || !maTC || !thoiGianHen) {
                return res.status(400).json({ 
                    message: "Thiếu thông tin định danh: Khách hàng, Thú cưng hoặc Thời gian hẹn." 
                });
            }

            if (!trieuChung || !chanDoan) {
                return res.status(400).json({ 
                    message: "Vui lòng nhập đầy đủ Triệu chứng và Chẩn đoán." 
                });
            }

            const data = await DoctorService.submitExamination({
                maKH,
                maTC,
                maNV,
                thoiGianHen,
                trieuChung,
                chanDoan,
                ngayTaiKham,
                prescription
            });
            
            return res.status(200).json({
                message: 'Lưu hồ sơ bệnh án thành công!',
                metadata: data
            });

        } catch (error) {
            next(error);
        }
    }

    getVaccineQueue = async (req, res, next) => {
        const data = await DoctorService.getVaccineQueue();
        return res.status(200).json({
            message: 'Get vaccine queue success',
            metadata: data
        })
    }

    searchVaccines = async (req, res, next) => {
        const { q } = req.query;
        if (!q) return res.status(200).json({ metadata: [] });
        
        const data = await DoctorService.searchVaccines(q);
        return res.status(200).json({
            message: 'Search vaccines success',
            metadata: data
        })
    }

    getVaccineHistory = async (req, res, next) => {
        const { petId } = req.params;
        const data = await DoctorService.getVaccineHistory(petId);
        return res.status(200).json({
            message: 'Get vaccine history success',
            metadata: data
        })
    }

    submitVaccination = async (req, res, next) => {
        const maNV = req.user.userId; 
        
        if (!req.body.maTC || !req.body.maKH || !req.body.vaccineId) {
            return res.status(400).json({ message: "Missing Information" });
        }

        const data = await DoctorService.submitVaccination({
            ...req.body,
            maNV
        });
        
        return res.status(200).json({
            message: 'Vaccination submitted success',
            metadata: data
        })
    }

    getProfile = async (req, res, next) => {
        const userId = req.user.userId;
        const data = await DoctorService.getProfile(userId);
        return res.status(200).json({
            message: 'Get profile success',
            metadata: data
        })
    }

    updateProfile = async (req, res, next) => {
        const userId = req.user.userId;
        const data = await DoctorService.updateProfile(userId, req.body);
        return res.status(200).json({
            message: 'Update profile success',
            metadata: data
        })
    }
}

export default new DoctorController()