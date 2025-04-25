import bcrypt from 'bcryptjs'
import UserModel from '../models/users.model.js'
import { z } from 'zod'
import { generateTokens } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js'
import { profile } from 'console';

const userSchema = z.object({
    email: z.string().email({ message: "Invalid email address format" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character" }),
    fullName: z.string()
});

const userSchemaSignin = z.object({
    email: z.string().email({ message: "Invalid email address format" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character" }),
});

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Please provide all information' });
        }

        const validation = userSchema.safeParse({ email, password, fullName });
        if (!validation.success) {
            const errorMessage = validation.error.errors[0]?.message || 'Invalid Format';
            return res.status(400).json({ message: errorMessage });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = await UserModel.create({
            email,
            password: hashPassword,
            fullName
        });

        if (newUser) {
            generateTokens(newUser._id, res);
            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            });
        }

        return res.status(500).json({ message: 'Failed to create user' });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const validation = userSchemaSignin.safeParse({ email, password })

        if (!validation.success) {
            return res.status(400).json({
                msg: 'Invalid signin format'
            })
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                msg: 'Invalid credentials'
            })
        }

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            return res.status(400).json({
                msg: 'Invalid credentials'
            })
        }
        generateTokens(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log('somethong went wrong during logging in ', error);
    }
}

export const logout = (req, res) => {
    try {
        // Clear the jwt cookie
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log('Error in logout controller:', error.message);
        res.status(500).json({ message: 'Internal server error during logout' });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;

        //we get his user_id from  req as the middleware used in updateProfile provides user info in req
        const userId = req.user_id

        if (!profilePic) {
            return res.status(400).json({ msg: 'Profile pic is required' })
        }

        //uploads the image to cloudinary 
        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        // updating User model, user proifle changed from empty string to secure link provided by cloudinary 
        // new: true object makes findByIdAndUpdate function return the latest change made to it and not the previous. hover over it  for more detail
        const updateUser = await UserModel.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })
        res.status(200).json({
            updateUser
        })




    } catch (error) {
        console.log('something went wrong in update Profile route ');
        return res.status(400).json({ msg: 'Internal server error update profile route controller', error })
    }
}


//route to check after user refreshes the page 
export const checkAuth = (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Error in checkAuth controller:', error);
        res.status(500).json({
            msg: 'Internal server error',
            error: error.message
        });
    }
}