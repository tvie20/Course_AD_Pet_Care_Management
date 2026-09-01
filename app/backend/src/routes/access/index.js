import express from 'express'
import accessController from '../../controllers/access.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'

const router = express.Router()

router.post('/login', asyncHandler(accessController.login))
router.post('/login-staff', asyncHandler(accessController.loginStaff))
router.post('/register', asyncHandler(accessController.signUp))

export default router