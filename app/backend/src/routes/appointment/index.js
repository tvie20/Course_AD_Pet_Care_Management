import express from 'express'
import appointmentController from '../../controllers/appointment.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)
router.get('/appointments', asyncHandler(appointmentController.getAppointments))

export default router