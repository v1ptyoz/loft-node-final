const express = require('express');
const router = express.Router();
const db = require('../models');
const helper = require('../helper/serialize');
const passport = require('passport');
const token = require('../auth/tokens')

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
    const user = await db.getUserByName(req.user.username);
    if (req.oldPassword && req.newPassword) {
        if (!user.validPassword(req.oldPassword)) {
            res.status(409).json({
                message: "Старый пароль неверен"
            })
        } else {
            const updatedUser = await db.updateUser(user, req.body)
            res.json({
                ...helper.serializeUser(updatedUser)
            })
        }
    } else {
        const updatedUser = await db.updateUser(user, req.body)
        res.json({
            ...helper.serializeUser(updatedUser)
        })
    }
})

router.get('/news', async (req, res) => {
    return await db.getNews()
})

module.exports = router