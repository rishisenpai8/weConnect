import mongoose from 'mongoose'

const objectId = mongoose.Schema.Types.ObjectId

const messageSchema = mongoose.Schema({
    senderId: {
        type: objectId,
        ref: 'User',
        required: true,
    },
    recieverId: {
        type: objectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String
    },
    image: {
        type: String
    },

}, { timestamps: true })

const Message = mongoose.model('Message', messageSchema);

export default Message