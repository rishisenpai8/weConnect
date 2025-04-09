import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware';
import { getUsersForSidebar, getMessages, sendMessage } from '../controllers/message.controller';

const router = express.Router();

//gets the user for sidebar
router.get('/users', protectRoute, getUsersForSidebar)
//get the chat message
router.get('/:id', protectRoute, getMessages)

router.post('/send/:id', protectRoute, sendMessage)

export default router;