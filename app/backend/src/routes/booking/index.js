import express from 'express'
import bookingController from '../../controllers/booking.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)
router.post('/booking', asyncHandler(bookingController.createBooking))

export default router