const User = require('./schemas/users');
const News = require('./schemas/news');
const Messages = require('./schemas/messages');

module.exports.getUserByName = async (username) => {
    return User.findOne({ username })
}

module.exports.getUserById = async (id) => {
    return User.findById({ _id: id });
}

module.exports.getUsers = async () => {
    return User.find();
}

module.exports.updateUserPermissions = async (id, permission) => {
    await User.findByIdAndUpdate(id, { permission: permission })
}

module.exports.deleteUser = async (id) => {
    await User.findByIdAndDelete(id)
}

module.exports.updateUser = async function (user, data) {
    const { surName, firstName, middleName, avatar, newPassword } = data;
    if (surName) user.surName = surName;
    if (firstName) user.firstName = firstName;
    if (middleName) user.middleName = middleName;
    user.image = avatar;
    if (newPassword) {
        await user.setPassword(newPassword);
    }
    await user.save();
    return user;
}

module.exports.createUser = async (data) => {
    const { username, surName, firstName, middleName, password } = data;
    const newUser = new User({
        username,
        surName,
        firstName,
        middleName,
        image: '',
        permission: {
            chat: { C: true, R: true, D: true, U: true },
            news: { C: true, R: true, D: true, U: true },
            settings: { C: true, R: true, D: true, U: true },
        }
    })
    newUser.setPassword(password);
    const user = await newUser.save();
    return user;
}

module.exports.getNews = async () => {
    return await News.find();
}

module.exports.createNews = async ({ text, title, user }) => {
    const news = new News({
        text,
        title,
        user
    })
    await news.save();
    return news;
}

module.exports.deleteNews = async (id) => {
    await News.findByIdAndDelete(id);
}

module.exports.updateNews = async (id, title, text) => {
    await News.findByIdAndUpdate(id, { title: title, text: text })
}

module.exports.getMessagesBySenderIdAndRecipientId = async (senderId, recipientId) => {
    const record = await Messages.findOne({ "sender": senderId, "recipient": recipientId })
    return record;
}

module.exports.createSenderAndPutMessage = async (senderId, recipientId, roomId, text) => {
    const sender = new Messages({
        sender: senderId,
        recipient: recipientId,
        data: {
            senderId,
            recipientId,
            roomId,
            messages: []
        }
    })
    sender.data.messages.push(text);
    await sender.save();
    return sender;
}

module.exports.addMessageForSender = async (senderId, recipientId, roomId, text) => {
    const record = await Messages.findOne({ "sender": senderId, "recipient": recipientId, "data.roomId": roomId });
    record.data.messages.push(text);
    await record.save();
    return record;
}

module.exports.dropAllMessages = async () => {
    const messages = await Messages.find();
    messages.forEach(async message => {
        await Messages.findByIdAndDelete(message._id)
    })
}
