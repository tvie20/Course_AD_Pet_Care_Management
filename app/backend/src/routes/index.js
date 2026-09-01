import express from 'express'
import accessRouter from './access/index.js'
import branchRouter from './branch/index.js'
import petRouter from './pet/index.js'
import appointmentRouter from './appointment/index.js'
import customerRouter from './customer/index.js'
import productRouter from './product/index.js'
import doctorRouter from './doctor/index.js'
import staffRouter from './staff/index.js'
import adminRouter from './admin/index.js'
import bookingRouter from './booking/index.js'

const router = express.Router()

router.use('/api', productRouter)
router.use('/api', accessRouter)
router.use('/api', branchRouter)
router.use('/api', petRouter)
router.use('/api', customerRouter)
router.use('/api/doctor', doctorRouter)
router.use('/api/staff', staffRouter)
router.use('/api/admin', adminRouter)
router.use('/api', appointmentRouter)
router.use('/api', bookingRouter)

export default router