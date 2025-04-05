import bcrypt from 'bcryptjs'
import UserModel from '../models/users.model.js'
import { z } from 'zod'
import { generateTokens } from '../lib/utils.js';

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
                msg: 'User does not exist'
            })
        }

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            return res.status(400).json({
                msg: 'Incorrect password'
            })
        }

    } catch (error) {
        console.log('somethong went wrong during logging in ', error);
    }
}
export const logout = (req, res) => {
    res.send('logout route');
}