import express from 'express'
import customerController from '../../controllers/customer.controller.js'
import historyController from '../../controllers/history.controller.js'
import invoiceController from '../../controllers/invoice.controller.js'
import reviewController from '../../controllers/review.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)
router.get('/membership', asyncHandler(customerController.getMembership))
router.get('/profile', asyncHandler(customerController.getProfile))
router.get('/history', asyncHandler(historyController.getHistory))
router.get('/invoices', asyncHandler(invoiceController.getInvoices))
router.get('/reviews', asyncHandler(reviewController.getReviews))

export default router