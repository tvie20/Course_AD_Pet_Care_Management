import HistoryService from '../services/history.service.js'

class HistoryController {
    getHistory = async (req, res, next) => {
        const { userId } = req.user
        return res.status(200).json(await HistoryService.getHistoryByUserId(userId))
    }
}

export default new HistoryController()