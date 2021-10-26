const { celebrate, Segments, Joi } = require('celebrate');
var express = require('express');
const { StatusCodes } = require('http-status-codes');
const passport = require('passport');
var routes = express.Router();

const { ServerController, AuthenticationController } = require('./controllers');

routes.get('/status', ServerController.status);
routes.get('/token', AuthenticationController.token);

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
}), (req, res, next) => {
    passport.authenticate('login', (err, user) => {
        if (err) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                statusCode: StatusCodes.UNAUTHORIZED,
                message: err.message
            });
        }

        req.login(user, { session: false }, (err) => {
            if (err) return next(err);

            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK,
                user
            });
        });
    })(req, res, next);
});
routes.post('/logout', AuthenticationController.logout);
routes.post('/forgot-password', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required()
    })
}), AuthenticationController.forgotPassword);

routes.put('/reset-password', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required()
    })
}), AuthenticationController.resetPassword);

module.exports = routes;