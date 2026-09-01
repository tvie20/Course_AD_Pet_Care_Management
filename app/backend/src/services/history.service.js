import { models, sequelize } from '../dbs/init.mssql.js'
import { Op } from 'sequelize'

class HistoryService {
    static getHistoryByUserId = async (userId) => {
        const pets = await models.THUCUNG.findAll({
            where: { MaKH: userId },
            attributes: ['MaTC', 'TenTC'],
            raw: true
        })
        
        if (!pets.length) return { exams: [], vaccines: [] }

        const petIds = pets.map(p => p.MaTC)
        const petMap = pets.reduce((acc, p) => { acc[p.MaTC] = p.TenTC; return acc; }, {})

        const invoices = await models.HOADON.findAll({
            where: { MaTC: { [Op.in]: petIds } },
            attributes: ['MaHD', 'MaTC', 'HMaNV'],
            raw: true
        })

        if (!invoices.length) return { exams: [], vaccines: [] }

        const invoiceIds = invoices.map(i => i.MaHD)
        const invoiceToPetName = invoices.reduce((acc, i) => {
            acc[i.MaHD] = petMap[i.MaTC]; 
            return acc;
        }, {})

        const invoiceDetails = await models.CHITIETHOADON.findAll({
            where: { MaHD: { [Op.in]: invoiceIds } },
            attributes: ['MaHD', 'MaGD'],
            raw: true
        })

        const transactionIds = invoiceDetails.map(d => d.MaGD).filter(id => id);
        const transactionToPetName = invoiceDetails.reduce((acc, d) => {
            acc[d.MaGD] = invoiceToPetName[d.MaHD];
            return acc;
        }, {})

        if (!transactionIds.length) return { exams: [], vaccines: [] }

        const exams = await models.KHAMBENH.findAll({
            where: { KMaGD: { [Op.in]: transactionIds } },
            include: [
                {
                    model: models.BACSITHUY,
                    as: 'BMaNV_BACSITHUY',
                    include: [{ model: models.NHANVIEN, as: 'BMaNV_NHANVIEN', attributes: ['HoTenNV'] }]
                },
                {
                    model: models.TOATHUOC,
                    as: 'TOATHUOCs',
                    include: [{
                        model: models.CHITIETTOATHUOC,
                        as: 'CHITIETTOATHUOCs',
                        include: [{
                            model: models.THUOC,
                            as: 'TMaSP_THUOC',
                            include: [{ model: models.SANPHAM, as: 'TMaSP_SANPHAM', attributes: ['TenSP'] }]
                        }]
                    }]
                }
            ],
            order: [['NgayKham', 'DESC']]
        })

        const vaccines = await models.TIEMPHONG.findAll({
            where: { TMaGD: { [Op.in]: transactionIds } },
            include: [
                {
                    model: models.BACSITHUY,
                    as: 'BMaNV_BACSITHUY',
                    include: [{ model: models.NHANVIEN, as: 'BMaNV_NHANVIEN', attributes: ['HoTenNV'] }]
                },
                {
                    model: models.VACXIN,
                    as: 'VMaSP_VACXIN',
                    include: [{ model: models.SANPHAM, as: 'VMaSP_SANPHAM', attributes: ['TenSP'] }]
                }
            ],
            order: [['NgayTiem', 'DESC']]
        })

        const formatExams = exams.map(e => {
            const plain = e.get({ plain: true })
            return {
                ...plain,
                TenTC: transactionToPetName[plain.KMaGD] || "Thú cưng",
                BacSi: plain.BMaNV_BACSITHUY?.BMaNV_NHANVIEN?.HoTenNV || "Bác sĩ",
                ToaThuoc: plain.TOATHUOCs?.[0]?.CHITIETTOATHUOCs?.map(ct => ({
                    TenThuoc: ct.TMaSP_THUOC?.TMaSP_SANPHAM?.TenSP,
                    SoLuong: ct.SoLuongThuoc,
                    LieuDung: ct.LieuDung
                })) || []
            }
        })

        const formatVaccines = vaccines.map(v => {
            const plain = v.get({ plain: true })
            return {
                ...plain,
                TenTC: transactionToPetName[plain.TMaGD] || "Thú cưng",
                BacSi: plain.BMaNV_BACSITHUY?.BMaNV_NHANVIEN?.HoTenNV || "KTV",
                TenVacXin: plain.VMaSP_VACXIN?.VMaSP_SANPHAM?.TenSP || "Vắc xin"
            }
        })

        return { exams: formatExams, vaccines: formatVaccines }
    }
}

export default HistoryService