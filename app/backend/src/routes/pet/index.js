import express from 'express'
import petController from '../../controllers/pet.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/checkAuth.js'

const router = express.Router()

router.use(authentication)

router.get('/pets', asyncHandler(petController.getAllPets))
router.post('/add-pet', asyncHandler(petController.addPet))

export default router