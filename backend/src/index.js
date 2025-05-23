import express from 'express';
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './lib/db.js'
import dotenv from 'dotenv'
// import { METHODS } from 'http';
dotenv.config()

const PORT = process.env.PORT
const app = express();

//middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

//health checkroute
app.get('/', (req, res) => {
    res.status(200).json({
        msg: 'server is running '
    })
})

//error handeling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Something went wrong' })
})

app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

const init = async () => {
    try {
        app.listen(PORT, async () => {
            await connectDB()
            console.log('Running on PORT: ', PORT);

        })
    } catch (error) {

    }
}

init()