import ProductService from '../services/product.service.js'

class ProductController {
    getAllProducts = async (req, res, next) => {
        return res.status(200).json(await ProductService.getAllProducts())
    }
}

export default new ProductController()