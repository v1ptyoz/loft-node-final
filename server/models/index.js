const User = require('./schemas/users');
const News = require('./schemas/news');

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
