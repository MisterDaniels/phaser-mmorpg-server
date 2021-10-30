const { StatusCodes } = require("http-status-codes");
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

const smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_PROVIDER,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
    }
});

const handlebarsOptions = {
    viewEngin: {
        extName: '.hbs',
        defaultLayout: null,
        partialsDir: path.join(__sourceDir, '/templates/'),
        layoutsDir: path.join(__sourceDir, '/templates/')
    },
    viewPath: path.join(__sourceDir, '/templates/'),
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

        await smtpTransport.sendMail({
            to: userEmail,
            from: process.env.MAILER_EMAIL,
            template: 'forgot-password',
            subject: 'Phaser MMORPG password reset',
            context: {
                name: 'Joe',
                url: `http://localhost:${ process.env.PORT || 9000 }`
            }
        });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'An email has been set to your email address. Password reset link is only valid for 10 minutes'
        });
    },
    
    async resetPassword(req, res) {
        const userEmail = req.body.email;

        await smtpTransport.sendMail({
            to: userEmail,
            from: email,
            template: 'reset-password',
            subject: 'Phaser MMORPG password reset confirmation',
            context: {
                name: 'Joe'
            }
        });
        
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Password updated'
        });
    }

}