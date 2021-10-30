const { StatusCodes } = require("http-status-codes");

module.exports = {

    async status(req, res) {
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Ok'
        });
    }

}