const User = require('./schemas/users');
const News = require('./schemas/news');

module.exports.getUserByName = async (username) => {
    return User.findOne({username})
}

module.exports.getUserById = async (id) => {
    return User.findById({_id: id});
}

module.exports.updateUser = async (user, data) => {
    const {surName, firstName, middleName, avatar, newPassword} = data;
    if (surName) user.surName = surName;
    if (firstName) user.firstName = firstName;
    if (middleName) user.middleName = middleName;
    if (avatar) user.image = avatar;
    if (newPassword) {
        user.hash = user.setPassword(newPassword);
    }
    await user.save();
    return user;
}

module.exports.createUser = async (data) => {
    const {username, surName, firstName, middleName, password} = data;
    const newUser = new User({
        username,
        surName,
        firstName,
        middleName,
        image: '',
        permission: {
            chat: {C: true, R: true, D: true, U: true},
            news: {C: true, R: true, D: true, U: true},
            settings: {C: true, R: true, D: true, U: true},
        }
    })
    newUser.setPassword(password);
    const user = await newUser.save();
    return user;
}

module.exports.getNews = async () => {
    return await News.find();
}