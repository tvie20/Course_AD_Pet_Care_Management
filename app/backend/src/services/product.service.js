import { models, sequelize } from '../dbs/init.mssql.js'

class ProductService {
    static getAllProducts = async () => {
        return await models.SANPHAM.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT ISNULL(SUM(SoLuong), 0)
                            FROM CHITIETHOADON
                            WHERE CHITIETHOADON.MaSP = SANPHAM.MaSP
                        )`),
                        'DaBan'
                    ]
                ]
            },
            order: [['TenSP', 'ASC']],
            raw: true
        })
    }
}

export default ProductService