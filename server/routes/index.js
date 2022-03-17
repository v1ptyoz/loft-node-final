const express = require('express');
const router = express.Router();
const db = require('../models');
const helper = require('../helper/serialize');
const passport = require('passport');
const token = require('../auth/tokens');
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

const UPLOAD_DIR = path.join(process.cwd(), 'server/upload');

router.post('/registration', async (req, res) => {
    const { username } = req.body;
    const user = await db.getUserByName(username);

    if (user) {
        return res.status(409).json({ message: 'Пользователь уже существует' });
    }

    try {
        const newUser = await db.createUser(req.body);
        res.status(201).json({
            ...helper.serializeUser(newUser)
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message })
    }
})

router.post('/login', async (req, res, next) => {
    passport.authenticate(
        'local',
        { session: false },
        async (err, user, info) => {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(400).json({ message: 'Не верный логин или пароль!' })
            }

            if (user) {
                const generatedToken = await token.createTokens(user);
                res.json({
                    ...helper.serializeUser(user),
                    ...generatedToken
                })

            }
        })(req, res, next)
})

router.get('/refresh-token', async (req, res) => {
    const refreshToken = req.headers['authorization'];
    const data = await token.refreshTokens(refreshToken)
    res.json({ ...data })
})


const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (!user || err) {
            return res.status(401).json({
                code: 401,
                message: 'Unauthorized'
            })
        }
        req.user = user
        next()
    })(req, res, next)
}

router.get('/profile', auth, async (req, res) => {
    const user = req.user;

    res.json({
        ...helper.serializeUser(user)
    })
})

router.patch('/profile', auth, async (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = UPLOAD_DIR;
    form.parse(req, async (err, fields, files) => {
        const {firstName, surName, middleName, oldPassword, newPassword} = fields;
        let avatar = null
        if (Object.entries(files).length > 0) {
            const ext = files.avatar.originalFilename.split('.')[files.avatar.originalFilename.split('.').length-1]
            fs.renameSync(path.join(UPLOAD_DIR, files.avatar.newFilename), path.join(UPLOAD_DIR, files.avatar.newFilename + `.${ext}`))
            avatar = files.avatar.newFilename + `.${ext}`
        }
        const user = await db.getUserByName(req.user.username);
        if (oldPassword && newPassword) {
            if (!user.validPassword(oldPassword)) {
                res.status(409).json({
                    message: "Старый пароль неверен"
                })
            } else {
                const updatedUser = await db.updateUser(user, {surName, firstName, middleName, avatar, newPassword})
                res.json({
                    ...helper.serializeUser(updatedUser)
                })
            }
        } else {
            const updatedUser = await db.updateUser(user, {surName, firstName, middleName, avatar})
            res.json({
                ...helper.serializeUser(updatedUser)
            })
        }
    })
})

router.get('/news', async (req, res) => {
    const news = await db.getNews();
    return res.json(news.map(news => helper.serializeNews(news)))
})

router.post('/news', auth, async (req, res) => {
    const {title, text} = req.body;
    const user = helper.serializeUser(req.user);
    await db.createNews({title, text, user});
    const news = await db.getNews();
    return res.json(news.map(news => helper.serializeNews(news)))
})

router.delete('/news/:id', auth, async (req, res) => {
    await db.deleteNews(req.params.id)
    const news = await db.getNews();
    return res.json(news.map(news => helper.serializeNews(news)))
})

router.patch('/news/:id', auth, async (req, res) => {
    await db.updateNews(req.params.id, req.body.title, req.body.text)
    const news = await db.getNews();
    return res.json(news.map(news => helper.serializeNews(news)))
})

router.get('/users', auth, async (req, res) => {
    const users = await db.getUsers();
    return res.json(users.map(user => helper.serializeUser(user)))
})

router.patch('/users/:id/permission', auth, async (req, res) => {
    await db.updateUserPermissions(req.params.id, req.body.permission);
    const users = await db.getUsers();
    return res.json(users.map(user => helper.serializeUser(user)))
})

router.delete('/users/:id', auth, async (req, res) => {
    await db.deleteUser(req.params.id)
    const users = await db.getUsers();
    return res.json(users.map(user => helper.serializeUser(user)))
})

module.exports = router