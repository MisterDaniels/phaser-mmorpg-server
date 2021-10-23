const { celebrate, Segments, Joi } = require('celebrate');
var express = require('express');
var routes = express.Router();

const { ServerController, AuthenticationController } = require('./controllers');

routes.get('/status', ServerController.status);
routes.get('/token', AuthenticationController.token);

routes.post('/signup', celebrate({
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required()
    })
}), AuthenticationController.signup);

routes.post('/login', AuthenticationController.login);
routes.post('/logout', AuthenticationController.logout);
routes.post('/forgot-password', AuthenticationController.forgotPassword);

routes.put('reset-password', AuthenticationController.resetPassword);

module.exports = routes;