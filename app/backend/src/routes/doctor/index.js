import express from 'express'
import doctorController from '../../controllers/doctor.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)

router.get('/dashboard', asyncHandler(doctorController.getDashboard))
router.get('/exam-queue', asyncHandler(doctorController.getExamQueue))
router.get('/medicines/search', asyncHandler(doctorController.searchMedicines))
router.get('/history/:petId', asyncHandler(doctorController.getPetHistory))
router.post('/examination', asyncHandler(doctorController.submitExamination))
router.get('/vaccine-queue', asyncHandler(doctorController.getVaccineQueue))
router.get('/vaccines/search', asyncHandler(doctorController.searchVaccines))
router.get('/vaccine-history/:petId', asyncHandler(doctorController.getVaccineHistory))
router.post('/vaccination', asyncHandler(doctorController.submitVaccination))
router.get('/profile', asyncHandler(doctorController.getProfile))
router.put('/profile', asyncHandler(doctorController.updateProfile))

export default router