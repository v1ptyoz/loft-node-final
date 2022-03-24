const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    sender: { type: String },
    recipient: { type: String },
    data: {
        senderId: { type: String },
        recipientId: { type: String },
        roomId: { type: String },
        messages: {
            type: Array, default: [],
        }
    },
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const News = mongoose.model('messages', messagesSchema);

module.exports = News;