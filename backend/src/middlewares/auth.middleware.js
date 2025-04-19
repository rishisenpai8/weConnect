import jwt from 'jsonwebtoken'
import User from '../models/users.model.js'

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(400).json({
                msg: 'Unauthorized - No Token provided'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            return res.status(400).json({
                msg: 'Unautorized - Invalid Token'
            })
        }

        const user = await User.findById(decoded.userid).select('-password')

        if (!user) {
            return res.status(400).json({
                msg: 'User Not Found'
            })
        }

        req.user = user;
        next()

    } catch (error) {
        console.log('Error in protectRoute middleware', error.message);
        res.status(500).json({ msg: 'Internal server error' })
    }
}