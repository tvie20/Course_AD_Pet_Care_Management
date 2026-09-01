import { models } from '../dbs/init.mssql.js'
import { createTokenPair } from '../auth/authUtils.js'
import { AuthFailureError, BadRequestError } from '../core/error.response.js'
import { sequelize } from '../dbs/init.mssql.js'
import crypto from 'crypto'

class AccessService {
    static login = async ({ tenDangNhap, matKhau }) => {
        const foundAccount = await models.TAIKHOANHOIVIEN.findOne({
            where: { TenDangNhap: tenDangNhap }
        })

        if (!foundAccount) {
            throw new BadRequestError('Lỗi: Tài khoản không tồn tại')
        }

        const hashedPassword = crypto
            .createHash('md5')
            .update(matKhau)
            .digest('hex')

        if (hashedPassword !== foundAccount.MatKhau) {
            throw new AuthFailureError('Lỗi: Sai mật khẩu')
        }

        const customerInfo = await models.KHACHHANG.findOne({
            where: { MaKH: foundAccount.MaKH }
        })

        if (!customerInfo) {
            throw new BadRequestError('Lỗi: Không tìm thấy thông tin khách hàng liên kết')
        }

        const publicKey = process.env.MS_KEY_ACCESS_TOKEN
        const privateKey = process.env.MS_KEY_REFRESH_TOKEN

        const tokens = await createTokenPair(
            { 
                userId: customerInfo.MaKH, 
                email: customerInfo.EmailKH,
                role: 'MEMBER' 
            }, 
            publicKey, 
            privateKey
        )

        return {
            user: {
                MaKH: customerInfo.MaKH,
                HoTenKH: customerInfo.HoTenKH,
                EmailKH: customerInfo.EmailKH,
                CapTV: customerInfo.CapTV
            },
            tokens
        }
    }

    static loginStaff = async ({ maNhanVien, matKhau }) => {
        const staffInfo = await models.NHANVIEN.findOne({
            where: { MaNV: maNhanVien }
        })

        if (!staffInfo) {
            throw new BadRequestError('Lỗi: Mã nhân viên không tồn tại')
        }

        const envPassword = process.env.STAFF_DEFAULT_PASSWORD || '1008'
        
        if (matKhau.toString() !== envPassword.toString()) {
            throw new AuthFailureError('Lỗi: Sai mật khẩu nhân viên')
        }

        const tokens = await createTokenPair(
            { 
                userId: staffInfo.MaNV, 
                name: staffInfo.HoTenNV,
                loaiNV: staffInfo.LoaiNV
            }, 
            process.env.MS_KEY_ACCESS_TOKEN, 
            process.env.MS_KEY_REFRESH_TOKEN
        )

        return {
            user: {
                MaNV: staffInfo.MaNV,
                HoTenNV: staffInfo.HoTenNV,
                LoaiNV: staffInfo.LoaiNV
            },
            tokens
        }
    }

    static signUp = async ({ fullName, phone, email, cccd, gender, birthday, username, password }) => {
        try {
            // 1. Hash mật khẩu tại Node.js (MD5)
            const passwordHash = crypto
                .createHash('md5')
                .update(password)
                .digest('hex'); // Kết quả sẽ là chuỗi 32 ký tự, chữ thường

            // 2. Gửi chuỗi ĐÃ HASH xuống SQL
            const [result] = await sequelize.query(`
                EXEC sp_DangKyTaiKhoan 
                    @HoTen = :fullName,
                    @SDT = :phone,
                    @Email = :email,
                    @CCCD = :cccd,
                    @GioiTinh = :gender,
                    @NgaySinh = :birthday,
                    @TenDangNhap = :username,
                    @MatKhau = :passwordHash  -- Truyền chuỗi đã hash
            `, {
                replacements: { 
                    fullName, phone, email, cccd, gender, birthday, username, 
                    passwordHash // Sử dụng biến đã hash
                }
            });

            return result[0];

        } catch (error) {
            const sqlError = error.original || error;
            
            if (sqlError.message.includes('Số điện thoại đã tồn tại')) {
                throw new Error('Số điện thoại này đã được sử dụng.');
            }
            if (sqlError.message.includes('Tên đăng nhập đã tồn tại')) {
                throw new Error('Tên đăng nhập đã tồn tại.');
            }
            
            console.error("AccessService signUp Error:", error);
            throw new Error("Lỗi hệ thống khi đăng ký.");
        }
    }
}

export default AccessService