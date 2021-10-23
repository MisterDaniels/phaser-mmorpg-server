const { StatusCodes } = require("http-status-codes");

module.exports = {

    status(req, res) {
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Ok'
        });
    }

}