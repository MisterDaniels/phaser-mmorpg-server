const { celebrate, Segments, Joi } = require('celebrate');
var express = require('express');
const { StatusCodes } = require('http-status-codes');
const passport = require('passport');
const jwt = require('jsonwebtoken');
var routes = express.Router();

const tokenList = {};
const { ServerController, AuthenticationController, ChatController } = require('./controllers');

routes.get('/status', ServerController.status);

routes.post('/token', celebrate({
    [Segments.BODY]: Joi.object().keys({
        refreshToken: Joi.string().required()
    })
}), (req, res) => {
    const { refreshToken } = req.body;

    if (!(refreshToken in tokenList)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            statusCode: StatusCodes.UNAUTHORIZED,
            message: 'Unauthorized'
        });
    }

    const body = {
        email: tokenList[refreshToken].email,
        _id: tokenList[refreshToken]._id,
        name: tokenList[refreshToken].name
    }

    const token = jwt.sign({ user: body }, process.env.JWT_SECRET, { expiresIn: 300 });

    res.cookie('jwt', token);
    tokenList[refreshToken].token = token;

    return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        token
    });
}, AuthenticationController.token);
routes.post('/signup', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        username: Joi.string().required()
    })
}), passport.authenticate('signup', {
    session: false
}), AuthenticationController.signup);

routes.post('/login', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
}), async (req, res, next) => {
    passport.authenticate('login', async (err, user) => {
        if (err) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                statusCode: StatusCodes.UNAUTHORIZED,
                message: err.message
            });
        }

        req.login(user, { session: false }, (err) => {
            if (err) return next(err);

            const body = {
                _id: user._id,
                email: user.email,
                name: user.username
            };

            const token = jwt.sign({ user: body }, process.env.JWT_SECRET, { expiresIn: 300 });
            const refreshToken = jwt.sign({ user: body }, process.env.JWT_REFRESH_SECRET, { expiresIn: 86400 });

            res.cookie('jwt', token);
            res.cookie('refreshJwt', refreshToken);

            tokenList[refreshToken] = {
                token,
                refreshToken,
                email: user.email,
                _id: user._id,
                name: user.username
            }

            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK,
                token,
                refreshToken
            });
        });
    })(req, res, next);
});
routes.post('/logout', AuthenticationController.logout, (req, res) => {
    const refreshToken = req.cookies.refreshJwt;
    if (refreshToken in tokenList) delete tokenList[refreshToken];

    return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Logged out'
    });
});
routes.post('/forgot-password', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required()
    })
}), AuthenticationController.forgotPassword);
routes.post('/chat', celebrate({
    [Segments.BODY]: Joi.object().keys({
        message: Joi.string().required()
    })
}), passport.authenticate('jwt', { session: false }), ChatController.chat);

routes.put('/reset-password', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    [Segments.QUERY]: Joi.object().keys({
        token: Joi.string().required()
    })
}), AuthenticationController.resetPassword);

module.exports = routes;