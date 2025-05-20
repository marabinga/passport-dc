const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy, addUserToGuild } = require('passport-dc');

const app = express();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new Strategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'email', 'guilds', 'guilds.join']
}, function (accessToken, refreshToken, profile, done) {
    // Attach accessToken to profile for later use
    profile.accessToken = accessToken;
    return done(null, profile);
}));

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('<a href="/auth/discord">Login with Discord</a> <br>Go to /join-guild to join the guild after login');
});

    app.get('/auth/discord', passport.authenticate('discord'));

    app.get('/auth/discord/callback',
        passport.authenticate('discord', { failureRedirect: '/' }),
        function (req, res) {
            res.redirect('/profile');
        }
    );

    app.get('/join-guild', ensureAuthenticated, (req, res) => {
        // Example: Add user to a guild after authentication
        const guildId = 'YOUR_GUILD_ID';
        const userId = req.user.id;
        const userAccessToken = req.user.accessToken;
        const botToken = 'YOUR_BOT_TOKEN';

        addUserToGuild(guildId, userId, userAccessToken, botToken, function (err) {
            if (err) {
                return res.status(500).send('Failed to join guild: ' + err.message);
            }
            res.send('Successfully joined the guild!');
        });
    });

    app.get('/profile', ensureAuthenticated, (req, res) => {
        res.json(req.user);
    });

    app.get('/logout', (req, res) => {
        req.logout(() => res.redirect('/'));
    });

    function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { return next(); }
    res.redirect('/auth/discord');
}

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});