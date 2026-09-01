import express from 'express'
import staffController from '../../controllers/staff.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)

router.get('/dashboard', asyncHandler(staffController.getDashboard))
router.get('/appointments', asyncHandler(staffController.getReceptionAppointments))
router.get('/pets', asyncHandler(staffController.getPets))
router.get('/pets/:petId/history', asyncHandler(staffController.getPetHistory))
router.get('/invoices', asyncHandler(staffController.getInvoices))
router.get('/invoices/:invoiceId/items', asyncHandler(staffController.getInvoiceDetail))
router.get('/inventory', asyncHandler(staffController.getInventory))
router.post('/inventory/import', asyncHandler(staffController.importGoods))
router.get('/reviews', asyncHandler(staffController.getReviews))
router.post('/reviews/reply', asyncHandler(staffController.replyReview))
router.get('/profile', asyncHandler(staffController.getProfile))
router.put('/profile', asyncHandler(staffController.updateProfile))
router.post('/check-in', asyncHandler(staffController.checkIn))
router.get('/invoices/:id/detail', asyncHandler(staffController.getInvoiceForPOS))
router.post('/payment', asyncHandler(staffController.processPayment))

export default router