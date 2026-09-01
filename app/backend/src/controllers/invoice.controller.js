import InvoiceService from '../services/invoice.service.js'

class InvoiceController {
    getInvoices = async (req, res, next) => {
        const { userId } = req.user
        return res.status(200).json(await InvoiceService.getInvoicesByUserId(userId))
    }
}

export default new InvoiceController()