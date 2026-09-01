import { models, sequelize } from '../dbs/init.mssql.js'
import { Op } from 'sequelize'

class CustomerService {
    static getMembershipInfo = async (userId) => {
        const customer = await models.KHACHHANG.findOne({
            where: { MaKH: userId },
            include: [{
                model: models.CAPTHANHVIEN,
                as: 'CapTV_CAPTHANHVIEN', 
                attributes: ['ChiTieuToiThieu']
            }],
            raw: true,
            nest: true
        })

        if (!customer) return null

        const totalSpentResult = await models.HOADON.sum('TongTien', {
            include: [{
                model: models.THUCUNG,
                as: 'MaTC_THUCUNG',
                where: { MaKH: userId },
                attributes: [] 
            }]
        })
        
        const currentSpend = totalSpentResult || 0

        const nextTier = await models.CAPTHANHVIEN.findOne({
            where: {
                ChiTieuToiThieu: { [Op.gt]: customer.CapTV_CAPTHANHVIEN.ChiTieuToiThieu }
            },
            order: [['ChiTieuToiThieu', 'ASC']],
            raw: true
        })

        const nextTierSpend = nextTier ? nextTier.ChiTieuToiThieu : currentSpend
        const nextTierName = nextTier ? nextTier.CapTV : "MAX LEVEL"

        return {
            rank: customer.CapTV,
            joinDate: customer.NgayDatCap,
            points: customer.DiemLoyalty,
            currentSpend: currentSpend,
            nextTierSpend: nextTierSpend,
            nextTierName: nextTierName
        }
    }

    static getProfile = async (userId) => {
        const customer = await models.KHACHHANG.findOne({
            where: { MaKH: userId },
            include: [
                {
                    model: models.TAIKHOANHOIVIEN,
                    as: 'TAIKHOANHOIVIEN',
                    attributes: ['TenDangNhap']
                }
            ],
            raw: true,
            nest: true
        })

        if (!customer) throw new BadRequestError('Không tìm thấy khách hàng')

        return {
            MaKH: customer.MaKH,
            HoTenKH: customer.HoTenKH,
            SDTKH: customer.SDTKH,
            EmailKH: customer.EmailKH,
            CCCD: customer.CCCD,
            GioiTinhKH: customer.GioiTinhKH,
            NgaySinhKH: customer.NgaySinhKH,
            NgayDatCap: customer.NgayDatCap,
            CapTV: customer.CapTV,
            TenDangNhap: customer.TAIKHOANHOIVIEN?.TenDangNhap || "" 
        }
    }
}

export default CustomerService