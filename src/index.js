const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { StatusCodes } = require('http-status-codes');
const { errors } = require('celebrate');
const passport = require('passport');
const mongoose = require('mongoose');

require('dotenv').config();

const routes = require('./routes');

const app = express();
const port = process.env.SERVER_PORT || 9000;

const uri = `${ process.env.MONGO_URI }/${ process.env.DATABASE_NAME }`;
mongoose.connect(uri, {
    useNewUrlParser: true
});

mongoose.connection.on('error', (err) => {
    console.log(`[ϟ SERVER] database error: ${ err }`);
    process.exit(1);
});

mongoose.connection.on('connected', () => {
    console.log(`[ϟ SERVER] database is running in ${ uri }`);
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN
}));

require('./authentication');
app.use(passport.initialize());

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