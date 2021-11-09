const { StatusCodes } = require("http-status-codes");
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');

const { UserModel } = require('../models');

const smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_PROVIDER,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
    }
});

const handlebarsOptions = {
    viewEngine: {
        extName: '.hbs',
        defaultLayout: null,
        partialsDir: path.join(__sourceDir, 'templates'),
        layoutsDir: path.join(__sourceDir, 'templates')
    },
    viewPath: path.join(__sourceDir, 'templates'),
    extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

module.exports = {

    signup(req, res) {
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Signup successful'
        });
    },

    login(req, res) {
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Ok'
        });
    },

    logout(req, res, next) {        
        if (req.cookies && req.cookies.jwt) {
            res.clearCookie('jwt');
            res.clearCookie('refreshJwt');

            return next();
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'No cookie detected'
        });
    },

    token(req, res) {
        const { refreshToken } = req.body;

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: `Refresh token request for token: ${ refreshToken }`
        });
    },

    async forgotPassword(req, res) {
        const userEmail = req.body.email;
        const user = await UserModel.findOne({ email: userEmail });

        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'User not found'
            });
        }

        const buffer = crypto.randomBytes(20);
        const token = buffer.toString('hex');

        await UserModel.findByIdAndUpdate({ _id: user._id }, { resetToken: token, resetTokenExpiration: Date.now() + 600000  });

        await smtpTransport.sendMail({
            to: userEmail,
            from: process.env.MAILER_EMAIL,
            template: 'forgot-password',
            subject: 'Phaser MMORPG password reset',
            context: {
                name: user.username,
                url: `${ process.env.FRONT_SERVER_ENDPOINT || 'http://localhost:9006' }/reset-password?token=${ token }`
            }
        });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'An email has been set to your email address. Password reset link is only valid for 10 minutes'
        });
    },
    
    async resetPassword(req, res) {
        const userEmail = req.body.email;
        const user = await UserModel.findOne({ 
            resetToken: req.query.token, 
            resetTokenExpiration: { $gt: Date.now() }, 
            email: userEmail
        });

        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'Invalid token'
            });
        }

        user.password = req.body.password;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        await smtpTransport.sendMail({
            to: userEmail,
            from: process.env.MAILER_EMAIL,
            template: 'reset-password',
            subject: 'Phaser MMORPG password reset confirmation',
            context: {
                name: user.username
            }
        });
        
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Password updated'
        });
    },

    checkUserLoggedIn(req, res) {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                statusCode: StatusCodes.UNAUTHORIZED,
                message: 'User not logged in'
            });
        }

        return res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'User logged in'
        });
    }

}