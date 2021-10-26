const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

passport.use('signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, pass, done) => {
    const { username } = req.body;

    if (username === 'error') {
        return done(new Error('Invalid user'));
    }

    return done(null, {
        name: 'Joe'
    });
}));

passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, pass, done) => {
    if (email !== 'joe@test.com') {
        return done(new Error('User not found'));
    }

    if (pass !== 'test') {
        return done(new Error('Invalid password'));
    }

    return done(null, {
        name: 'Joe'
    });
}));