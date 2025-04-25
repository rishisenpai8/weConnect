import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const generateTokens = async (userId, res) => {
    if (!userId) {
        throw new Error('User ID is required to generate token');
    }

    const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    //'jwt' is the name of the token
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // Cookie expires in 7 days (in milliseconds)
        httpOnly: true,                     // Cookie not accessible via JavaScript
        sameSite: 'strict',                // Protection against CSRF attacks
        secure: process.env.NODE_ENV !== 'development'  // HTTPS only in production
    });

    return token;
}