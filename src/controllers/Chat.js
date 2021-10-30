const { StatusCodes } = require("http-status-codes");

const { ChatModel } = require('../models');

module.exports = {

    async chat(req, res) {
        const { message } = req.body;
        const { email } = req.user;

        const chat = await ChatModel.create({
            email,
            message
        });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            chat
        });
    }

}