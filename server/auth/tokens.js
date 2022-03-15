const jwt = require('jsonwebtoken')
const helper = require('../helper/serialize')
const models = require('../models')
require('dotenv').config()


const AUTH_TOKEN_SECRET = process.env.AuthTokenSecret;
const REFRESH_TOKEN_SECRET = process.env.RefreshTokenSecret;


const createTokens = async (user) => {
    const createToken = await jwt.sign({
            user: {id: user._id}
        },
        AUTH_TOKEN_SECRET,
        {expiresIn: '15m'}
    )

    const createRefreshToken = await jwt.sign(
        {
            user: {id: user._id}
        },
        REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )

    const verifyToken = jwt.decode(createToken, AUTH_TOKEN_SECRET)
    const verifyRefresh = jwt.decode(createRefreshToken, REFRESH_TOKEN_SECRET)

    return {
        accessToken: createToken,
        refreshToken: createRefreshToken,
        accessTokenExpiredAt: verifyToken.exp * 1000,
        refreshTokenExpiredAt: verifyRefresh.exp * 1000,
    }

}


const refreshTokens = async (refreshToken) => {
    const user = await getUserByToken(refreshToken);

    if (user) {
        return {
            ...helper.serializeUser(user),
            ...(await createTokens(user))
        }
    }
    return {}
}

const getUserByToken = async (token) => {
    let userId = -1;
    try {
        userId = jwt.verify(token, AUTH_TOKEN_SECRET).user.id
    }catch (err){
        return {}
    }

    const user = await  models.getUserById(userId)
    return user
}

module.exports = {
    createTokens,
    refreshTokens
}