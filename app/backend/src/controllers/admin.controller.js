import AdminService from '../services/admin.service.js'

class AdminController {
    getDashboard = async (req, res, next) => {
        const data = await AdminService.getDashboardData();
        
        return res.status(200).json({
            message: 'Get admin dashboard success',
            metadata: data
        })
    }

    getBranchRevenue = async (req, res, next) => {
        const { branch, from, to } = req.query; // branch = MaCN

        if (!branch) return res.status(400).json({ message: "Missing Branch ID" });

        try {
            const data = await AdminService.getBranchRevenue({ 
                maCN: branch, 
                fromDate: from, 
                toDate: to 
            });
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    getDoctorStats = async (req, res, next) => {
        const { branch, from, to } = req.query;

        if (!branch) return res.status(400).json({ message: "Missing Branch ID" });

        try {
            const data = await AdminService.getDoctorPerformance({ 
                maCN: branch, 
                fromDate: from, 
                toDate: to 
            });
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    getProductStats = async (req, res, next) => {
        const { branch, from, to } = req.query;

        if (!branch) return res.status(400).json({ message: "Missing Branch ID" });

        try {
            const data = await AdminService.getProductStats({ 
                maCN: branch, 
                fromDate: from, 
                toDate: to 
            });
            return res.status(200).json({ message: 'Success', metadata: data });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    getBranchManagement = async (req, res, next) => {
        try {
            const data = await AdminService.getAllBranchesFull();
            res.status(200).json({ metadata: data });
        } catch (error) { next(error); }
    }
}

export default new AdminController()