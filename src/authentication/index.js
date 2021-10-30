const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const jwtStrategy = require('passport-jwt').Strategy;

const { UserModel } = require('../models');

passport.use('signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const { username } = req.body;

        const user = await UserModel.create({
            email,
            password,
            username
        });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return done(new Error('User not found'), false);
        }

        const valid = await user.isValidPassword(password);
        if (!valid) {
            return done(new Error('Invalid password'), false);
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.use(new jwtStrategy({
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: (req) => {
        let token = null;

        if (req && req.cookies) token = req.cookies.jwt;
        return token;
    }
}, async (token, done) => {
    try {
        return done(null, token.user);
    } catch (err) {
        return done(err);
    }
}));