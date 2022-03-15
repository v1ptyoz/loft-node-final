const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newsSchema = new Schema({
    created_at: {type: Date},
    text: {type: String},
    title: {type: String},
    user: {
        firstName: {type: String},
        image: {type: String},
        middleName: {type: String},
        surName: {type: String},
        username: {type: String},
    }
}, {
    versionKey: false,
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
})

const News = mongoose.model('news', newsSchema);

module.exports = News;