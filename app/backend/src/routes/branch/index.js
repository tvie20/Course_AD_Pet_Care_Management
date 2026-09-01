import express from 'express'
import branchController from '../../controllers/branch.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'

const router = express.Router()

router.get('/branches', asyncHandler(branchController.getAllBranches))

export default router