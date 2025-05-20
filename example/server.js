var express = require('express')
    , session = require('express-session')
    , passport = require('passport')
    , Strategy = require('../lib').Strategy
    , app = express();

passport.serializeUser(function (user, done) {
    // this is were the user may be saved to the database
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    // this is were the user may be retrieved from the database
    done(null, obj);
});

const scopes = ['identify', 'connections', 'email', 'guilds', 'guilds.join']
const prompt = 'none'

passport.use(new Strategy({
    clientID: '889368430472495115',
    clientSecret: 'hWXgCQl1bOYvUxwGgmwG9U9RgsygkVKP',
    callbackURL: 'https://congenial-enigma-675x6grv5593r69q-5000.app.github.dev/callback',
    scope: scopes,
    prompt: prompt,
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function (req, res) { });
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function (req, res) { res.redirect('/info') } // auth success
);
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/info', checkAuth, function (req, res) {
    res.json(req.user)
});


function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}


app.listen(5000, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:5000/')
})