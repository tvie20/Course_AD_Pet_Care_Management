import express from 'express'
import adminController from '../../controllers/admin.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)

router.get('/dashboard', asyncHandler(adminController.getDashboard))
router.get('/branch-revenue', asyncHandler(adminController.getBranchRevenue))
router.get('/doctor-stats', asyncHandler(adminController.getDoctorStats))
router.get('/product-stats', asyncHandler(adminController.getProductStats))
router.get('/branch-management', asyncHandler(adminController.getBranchManagement))

export default router