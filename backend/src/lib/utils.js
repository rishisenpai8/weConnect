import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
export const generateTokens = async (userId, res) => {
    const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'developement'
    })
    return token
}