const { StatusCodes } = require("http-status-codes");

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

    logout(req, res) {
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Ok'
        });
    },

    token(req, res) {
        const { refreshToken } = req.body;

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: `Refresh token request for token: ${ refreshToken }`
        });
    },

    forgotPassword(req, res) {
        const { email } = req.body;

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: `Forgot password requested for email: ${ email }`
        });
    },
    
    resetPassword(req, res) {
        const { email } = req.body;
        
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: `Reset password requested for email: ${ email }`
        });
    }

}