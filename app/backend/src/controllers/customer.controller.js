import CustomerService from '../services/customer.service.js'

class CustomerController {
    getMembership = async (req, res, next) => {
        const { userId } = req.user
        return res.status(200).json(await CustomerService.getMembershipInfo(userId))
    }

    getProfile = async (req, res, next) => {
        const { userId } = req.user
        return res.status(200).json(await CustomerService.getProfile(userId))
    }
}

export default new CustomerController()