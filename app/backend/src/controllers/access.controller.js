import AccessService from '../services/access.service.js'

class AccessController {
    login = async (req, res, next) => {
        return res.status(200).json(await AccessService.login(req.body))
    }

    loginStaff = async (req, res, next) => {
        const result = await AccessService.loginStaff(req.body)
        
        return res.status(200).json({
            message: 'Đăng nhập nhân viên thành công',
            metadata: result
        })
    }

    signUp = async (req, res, next) => {
        const { fullName, phone, email, cccd, gender, birthday, username, password } = req.body;

        if (!username || !password || !phone) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        try {
            const result = await AccessService.signUp({
                fullName, phone, email, cccd, gender, birthday, username, password
            });

            return res.status(201).json({
                message: 'Đăng ký thành công',
                metadata: result
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }
}

export default new AccessController()