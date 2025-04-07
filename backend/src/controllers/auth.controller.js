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
    fullname: z.string()
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
    const { fullname, email, password, } = req.body
    try {
        if (!fullname || !email || !password) console.log('Please provide all information');
        const validation = userSchema.safeParse({ email, password, fullname });
        if (!validation.success) {
            return res.status(400).json({
                msg: 'Invalid Format'
            })
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                msg: 'Email Already exist'
            })
        }
        const hashPassword = await bcrypt.hash(password, 12);

        const newUser = await UserModel.create({
            email: email,
            password: hashPassword,
            fullname: fullname
        })

        if (newUser) {
            generateTokens(newUser._id, res)
            // await newUser.save()
            return res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            console.log(`User didn't got signed up try again`);
            res.status(500).json({ msg: 'Internal server Error', error: error.message })
        }

    } catch (error) {
        console.log('Something went wrong during signing up', error);
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
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log('somethong went wrong during logging in ', error);
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 })
        console.log('logged out');
    } catch (error) {
        console.log('internal server error: ', error.message)
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
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.log('Error in checkAuth controller:', error.message);
        res.status(500).json({
            msg: 'Internal server error',
            error: error.message
        });
    }
}