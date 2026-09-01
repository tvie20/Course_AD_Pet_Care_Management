import jwt from 'jsonwebtoken'
import { AuthFailureError } from '../core/error.response.js'

export const authentication = async (req, res, next) => {
    const userId = req.headers['x-client-id']
    if (!userId) throw new AuthFailureError('Lỗi: Thiếu x-client-id')

    const accessToken = req.headers.authorization
    if (!accessToken) throw new AuthFailureError('Lỗi: Thiếu Token')

    try {
        const decoded = jwt.verify(accessToken, process.env.MS_KEY_ACCESS_TOKEN)
        
        if (userId !== decoded.userId) throw new AuthFailureError('Lỗi: Token không khớp với User')
        
        req.user = decoded
        return next()
    } catch (error) {
        throw error
    }
}