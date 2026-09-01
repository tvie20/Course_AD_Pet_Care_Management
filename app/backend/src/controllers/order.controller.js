import OrderService from "../services/order.service.js";

class OrderController {
    placeOrder = async (req, res, next) => {
        try {
            const maKH = req.user.userId; // Lấy từ Token khách hàng
            const { items, paymentMethod } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({ message: "Giỏ hàng trống." });
            }

            const data = await OrderService.createOnlineOrder({
                maKH,
                items,
                paymentMethod
            });

            return res.status(200).json({
                message: 'Đặt hàng thành công!',
                metadata: data
            });

        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();