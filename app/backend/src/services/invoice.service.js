import { models } from '../dbs/init.mssql.js'
import { Op } from 'sequelize'

class InvoiceService {
    static getInvoicesByUserId = async (userId) => {
        try {
            const invoices = await models.HOADON.findAll({
                include: [
                    {
                        model: models.THUCUNG,
                        as: 'MaTC_THUCUNG',
                        where: { MaKH: userId },
                        attributes: ['TenTC']
                    },
                    {
                        model: models.THONGTINTHANHTOAN,
                        as: 'THONGTINTHANHTOAN', 
                        attributes: ['PhuongThucTT', 'TrangThaiTT']
                    },
                    {
                        model: models.NHANVIENBANHANG,
                        as: 'HMaNV_NHANVIENBANHANG',
                        include: [{
                            model: models.NHANVIEN,
                            as: 'HMaNV_NHANVIEN',
                            attributes: ['HoTenNV']
                        }]
                    },
                    {
                        model: models.CHITIETHOADON,
                        as: 'CHITIETHOADONs',
                        include: [{
                            model: models.SANPHAM,
                            as: 'MaSP_SANPHAM',
                            attributes: ['TenSP', 'Gia']
                        }]
                    }
                ],
                order: [['ThoiGianLapHD', 'DESC']],
                nest: true
            })

            const formattedInvoices = invoices.map(inv => {
                const plain = inv.get({ plain: true });
                const paymentInfo = plain.THONGTINTHANHTOAN || {};

                const tongTien = Number(plain.TongTien) || 0;
                const khuyenMai = Number(plain.KhuyenMai) || 0;

                return {
                    id: plain.MaHD,
                    date: plain.ThoiGianLapHD,
                    total: tongTien + khuyenMai,
                    discount: khuyenMai,
                    finalTotal: tongTien,
                    paymentMethod: paymentInfo.PhuongThucTT || "Tiền mặt",
                    status: paymentInfo.TrangThaiTT === "Đã thanh toán" ? "paid" : "pending",
                    pet: plain.MaTC_THUCUNG?.TenTC || "Khách lẻ",
                    staff: plain.HMaNV_NHANVIENBANHANG?.HMaNV_NHANVIEN?.HoTenNV || "Hệ thống",
                    branch: "PetCareX Quận 1",
                    
                    items: (plain.CHITIETHOADONs || []).map(item => {
                        const quantity = Number(item.SoLuong) || 0;
                        const price = Number(item.DonGia) || 0;
                        const subtotal = Number(item.ThanhTien) || (quantity * price);

                        return {
                            name: item.MaSP_SANPHAM?.TenSP || "Sản phẩm",
                            quantity: quantity,
                            price: price,
                            subtotal: subtotal 
                        }
                    })
                };
            });

            return formattedInvoices;

        } catch (error) {
            console.error("Get Invoices Error:", error);
            return [];
        }
    }
}

export default InvoiceService