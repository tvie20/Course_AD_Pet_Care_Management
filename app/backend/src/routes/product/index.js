import express from 'express'
import productController from '../../controllers/product.controller.js'
import { asyncHandler } from '../../helpers/asyncHandler.js'

const router = express.Router()

router.get('/products', asyncHandler(productController.getAllProducts))

export default router