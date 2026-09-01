import StaffService from '../services/staff.service.js'

class StaffController {
    getDashboard = async (req, res, next) => {
        const maChiNhanh = req.user.MaCN || null; 
        
        const data = await StaffService.getDashboardData(maChiNhanh);
        
        return res.status(200).json({
            message: 'Get staff dashboard success',
            metadata: data
        })
    }

    getReceptionAppointments = async (req, res, next) => {
        const maChiNhanh = req.user.MaCN || null;
        const { date, search, service } = req.query;

        const queryDate = date || new Date().toISOString().slice(0, 10);

        const data = await StaffService.getReceptionAppointments({
            maChiNhanh,
            date: queryDate,
            search,
            service
        });

        return res.status(200).json({
            message: 'Get reception list success',
            metadata: data
        })
    }

    getPets = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id']; 
        
        // Lấy tham số page và limit từ query string (mặc định page 1, limit 20)
        const { search, page = 1, limit = 20 } = req.query;

        if (!maNV) {
            return res.status(401).json({ message: "Unauthorized: Missing Staff ID" });
        }

        try {
            const data = await StaffService.getPetsByBranch({ 
                maNV, 
                search, 
                page: parseInt(page), 
                limit: parseInt(limit) 
            });
            
            return res.status(200).json({
                message: 'Get pets success',
                metadata: data
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    // ... (Giữ nguyên getPetHistory)
    getPetHistory = async (req, res, next) => {
        const { petId } = req.params;
        const data = await StaffService.getPetDetailHistory(petId);
        return res.status(200).json({
            message: 'Get pet history success',
            metadata: data
        })
    }

    getInvoices = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id'];
        const { search, status, page = 1, limit = 20 } = req.query;

        if (!maNV) return res.status(401).json({ message: "Unauthorized" });

        try {
            const data = await StaffService.getInvoicesByBranch({
                maNV,
                search,
                status, // 'all', 'paid', 'unpaid', 'cancelled'
                page: parseInt(page),
                limit: parseInt(limit)
            });
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    getInvoiceDetail = async (req, res, next) => {
        const { invoiceId } = req.params;
        const data = await StaffService.getInvoiceDetail(invoiceId);
        return res.status(200).json({ message: 'Success', metadata: data });
    }

    getInventory = async (req, res, next) => {
        // Fallback to header x-client-id if req.user is unavailable
        const maNV = req.user?.userId || req.headers['x-client-id'];
        const { search, filter, page = 1, limit = 20 } = req.query;

        if (!maNV) return res.status(401).json({ message: "Unauthorized" });

        try {
            const data = await StaffService.getInventory({
                maNV,
                search,
                filter, // 'all' | 'expiring'
                page: parseInt(page),
                limit: parseInt(limit)
            });
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    importGoods = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id'];
        const { items } = req.body; // Expecting an array of items

        if (!items || items.length === 0) return res.status(400).json({ message: "No items to import" });

        try {
            const result = await StaffService.createImportReceipt({ maNV, items });
            return res.status(200).json({ message: 'Import success', metadata: result });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    getReviews = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id'];
        const { search, filter, page = 1, limit = 10 } = req.query;

        if (!maNV) return res.status(401).json({ message: "Unauthorized" });

        try {
            const data = await StaffService.getReviews({
                maNV,
                search,
                filter, // 'all', 'pending', 'replied'
                page: parseInt(page),
                limit: parseInt(limit)
            });
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    replyReview = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id'];
        const { invoiceId, content } = req.body;

        if (!invoiceId || !content) return res.status(400).json({ message: "Missing data" });

        try {
            const result = await StaffService.replyReview({ maNV, invoiceId, content });
            return res.status(200).json({ message: 'Reply success', metadata: result });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    getProfile = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id'];
        if (!maNV) return res.status(401).json({ message: "Unauthorized" });

        try {
            const data = await StaffService.getProfile(maNV);
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    updateProfile = async (req, res, next) => {
        const maNV = req.user?.userId || req.headers['x-client-id'];
        if (!maNV) return res.status(401).json({ message: "Unauthorized" });

        try {
            const result = await StaffService.updateProfile(maNV, req.body);
            return res.status(200).json({ message: 'Update success', metadata: result });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    checkIn = async (req, res, next) => {
        try {
            const { maKH, maTC, thoiGianHen } = req.body;
            
            const maNV = req.headers['x-client-id']; 

            if (!maKH || !maTC || !thoiGianHen) {
                return res.status(400).json({
                    message: "Thiếu thông tin bắt buộc (MaKH, MaTC, ThoiGianHen)"
                });
            }

            if (!maNV) {
                return res.status(401).json({
                    message: "Không xác định được nhân viên thực hiện (Thiếu MaNV)"
                });
            }

            const result = await StaffService.checkInAppointment({ 
                maKH, 
                maTC, 
                thoiGianHen,
                maNV 
            });

            return res.status(200).json({
                message: "Check-in và tạo hóa đơn thành công",
                metadata: result
            });

        } catch (error) {
            next(error);
        }
    }

    getInvoiceForPOS = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: "Thiếu ID hóa đơn" });

            const data = await StaffService.getInvoiceFullDetail(id);
            
            return res.status(200).json({ 
                message: "Lấy dữ liệu thành công",
                metadata: data 
            });
        } catch (error) {
            next(error);
        }
    }

    processPayment = async (req, res, next) => {
        try {
            const { maHD, maKH, hinhThucTT } = req.body;
            
            if (!maHD || !hinhThucTT) {
                return res.status(400).json({ message: "Thiếu thông tin thanh toán" });
            }

            if (!maKH) {
                 return res.status(400).json({ message: "Vui lòng chọn khách hàng để tích điểm" });
            }

            await StaffService.submitPayment({ maHD, maKH, hinhThucTT });
            
            return res.status(200).json({ message: "Thanh toán thành công!" });
        } catch (error) {
            next(error);
        }
    }
}

export default new StaffController()