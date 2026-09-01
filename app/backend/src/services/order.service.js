import { sequelize } from '../dbs/init.mssql.js'
import { QueryTypes } from 'sequelize'

class OrderService {
    static createOnlineOrder = async ({ maKH, items, paymentMethod }) => {
        try {
            // Map items từ Frontend (id, quantity) sang format JSON cho SQL (MaSP, SoLuong)
            const productsList = items.map(item => ({
                MaSP: item.id || item.medicineId || item.MaSP,
                SoLuong: item.quantity || item.SoLuong
            }));

            const jsonProducts = JSON.stringify(productsList);

            const result = await sequelize.query(`
                SET NOCOUNT ON;
                DECLARE @OutMaHD VARCHAR(25);

                EXEC sp_DatMuaOnline
                    @MaKH = :maKH,
                    @DanhSachSanPham = :jsonProducts,
                    @PhuongThucTT = :paymentMethod,
                    @MaHD_Output = @OutMaHD OUTPUT;

                SELECT @OutMaHD AS MaHD;
            `, {
                replacements: { 
                    maKH, 
                    jsonProducts, 
                    paymentMethod: paymentMethod || 'Tiền mặt' 
                },
                type: QueryTypes.SELECT
            });

            return {
                orderId: result[0]?.MaHD,
                message: "Đặt hàng thành công"
            };

        } catch (error) {
            console.error("OrderService createOnlineOrder Error:", error);
            const sqlError = error?.original || error;
            
            if (sqlError.message?.includes('Sản phẩm đã hết hàng')) {
                throw new Error("Một số sản phẩm trong giỏ hàng đã hết hoặc không đủ số lượng.");
            }
            
            throw new Error(sqlError.message || "Lỗi hệ thống khi đặt hàng.");
        }
    }
}

export default OrderService;