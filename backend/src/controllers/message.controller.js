import User from '../models/users.model.js'
import Message from '../models/message.model.js'
import cloudinary from '../lib/cloudinary.js';

//This function gets user fort the sidebar 
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        //ne means !=. This line tries to retrieve every user expect the one usig it 
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password')

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log('Error in getUserForSidebar', error.message);
        res.status(500).json({
            msg: 'Internal server error'
        })
    }
}
//get the chat message where sender or receiver is me 
export const getMessages = async (req, res) => {
    try {
        //userToChatId is just id, it makes it more redable 
        const { id: userToChatId } = req.params
        const myId = req.user._id

        const message = await Message.find({
            //this finds all the message from the model where sender is me or receiver is me and vice versa
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(message)

    } catch (error) {
        console.log('Error in getMessages controller ', error.message);
        res.status(500).json({ msg: 'Internal server error' })

    }
}

// THis controller helps send message it send Img as well as text
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        //receiverId is nothing but rename of id for redablity
        const { id: receiverId } = req.params
        const senderId = req.user._id

        //if there is an image in body it will upload it to clouidnay 
        let imageUrl;
        if (image) {
            //uploads base64 image image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        //updating mongo
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();

        //todo: RealTime functionality =>socket.io

        res.status(201).json(newMessage)
    } catch (error) {
        console.log('Error in sendMessage controller: ', error.message);
        res.status(501).json({
            msg: 'internal server error'
        })
    }
}