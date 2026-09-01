import ReviewService from '../services/review.service.js'

class ReviewController {
    getReviews = async (req, res, next) => {
        const { userId } = req.user
        return res.status(200).json(await ReviewService.getReviewsByUserId(userId))
    }
}

export default new ReviewController()