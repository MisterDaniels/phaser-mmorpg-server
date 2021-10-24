const express = require('express');
const bodyParser = require('body-parser');
const { StatusCodes } = require('http-status-codes');
const { errors } = require('celebrate');

require('dotenv').config();

const routes = require('./routes');

const app = express();
const port = process.env.SERVER_PORT || 9000;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(routes);

app.use((req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Page not found'
    });
});

app.use(errors());

app.listen(port, () => {
    console.log(`[ϟ SERVER] is running on port ${ port }`);
});