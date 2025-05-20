# passport-dc
> [!NOTE]
> **Potential successor to [`passport-discord`](https://www.npmjs.com/package/passport-discord).**  
> This package aims to provide a modern, maintained, and improved Discord OAuth2 strategy for Passport.


[Passport](http://passportjs.org/) strategy for authenticating with [Discord](https://discord.com/) using OAuth 2.0.

This module lets you authenticate using Discord in your Node.js applications. By plugging into Passport, Discord authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware.

---

## Quick Start Example


A ready-to-use example is available [Here](#full-summary-code) or at [`example/`](./example) folder(more detailed).  
You can run it to see how to integrate `passport-dc` with an Express app.

## Installation

```bash
npm install passport-dc
```

---

## Usage

### Configure Strategy

```javascript
const passport = require('passport');
const DiscordStrategy = require('passport-dc').Strategy;

passport.use(new DiscordStrategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'YOUR_CALLBACK_URL',
    scope: ['identify', 'email', 'guilds', 'guilds.join']
}, function(accessToken, refreshToken, profile, done) {
    profile.refreshToken = refreshToken; // store this for later use
    // User profile returned from Discord
    // Save user to your DB here if needed
    return done(null, profile);
}));
```

### Authentication Routes

```javascript
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication
        res.redirect('/profile');
    }
);
```

### Session Support

```javascript
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
```

---

## Retrieving User Profile

The user's Discord profile will be available as `req.user` after authentication.  

```js
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}

app.get('/profile', checkAuth, function (req, res) {
    res.json(req.user)
});
```
---

Example structure:

```json
{
  "id": "852381000528035890",
  "username": "nanduwastaken",
  "avatar": "40914b2ae07f53ee8f81f0efd1a2ba64",
  "discriminator": "0",
  "email": "nanduisnotdumb@gmail.com",
  "verified": true,
  "provider": "discord",
  "accessToken": "atZNodYnY6W1ttya9ert56161OohGa",
  "avatarUrl": "https://cdn.discordapp.com/avatars/852381000528035890/40914b2ae07f53ee8f81f0efd1a2ba64.png?size=1024",
  "connections": [ ... ],
  "guilds": [ ... ],
  "fetchedAt": "2025-05-20T05:02:58.310Z"
}
```

---

## Adding a User to a Guild

This package exposes a helper to add a user to a Discord guild (server) using the `guilds.join` scope.

### Usage

```javascript
const { addUserToGuild } = require('passport-dc');

// Example usage after authentication:
addUserToGuild(
    'YOUR_GUILD_ID',        // Guild/server ID
    req.user.id,            // User's Discord ID
    req.user.accessToken,   // User's OAuth2 access token
    'YOUR_BOT_TOKEN',       // Your bot token (must be in the guild)
    function(err) {
        if (err) {
            // Handle error (user not added)
            console.error('Failed to add user to guild:', err.message);
        } else {
            // Success!
            console.log('User added to guild!');
        }
    }
);
```

- The bot must be in the guild and have the `guilds.join` scope and appropriate permissions.
- If you want to set options like nickname or roles, pass an options object before the callback: (The Bot needs to have permission to change nicknames and etc. [Read More]())

```javascript
addUserToGuild(guildId, userId, accessToken, botToken, { nick: 'CoolUser' }, callback);
```
---
## Refresh Token Usage

If you need to refresh a user's Discord access token (for example, to keep them authenticated without requiring a new login), you can use the [`passport-oauth2-refresh`](https://www.npmjs.com/package/passport-oauth2-refresh) package.


```javascript
const DiscordStrategy = require('passport-dc').Strategy;
const refresh = require('passport-oauth2-refresh');

const discordStrat = new DiscordStrategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'YOUR_CALLBACK_URL',
    scope: ['identify', 'email', 'guilds', 'guilds.join']
}, function(accessToken, refreshToken, profile, done) {
    profile.refreshToken = refreshToken; // Store for later refreshes
    // Save user and tokens to your DB here if needed
    return done(null, profile);
});

passport.use(discordStrat);
refresh.use(discordStrat);

// Later, when you need to refresh the access token:
// Make sure where ever you call this function to have the profile data, since it is passed into this function
refresh.requestNewAccessToken('discord', profile.refreshToken, function(err, accessToken, refreshToken) {
    if (err) {
        // Handle error
        console.error('Failed to refresh access token:', err);
        return;
    }
    // Use the new accessToken (and optionally update refreshToken)
    profile.accessToken = accessToken;
    if (refreshToken) {
        profile.refreshToken = refreshToken;
    }
    // Continue with your logic
});
```

- Make sure to store the `refreshToken` securely for each user.
- Use the refreshed `accessToken` for future API requests on behalf of the user.


---
## Full Summary Code

- For more detailed exmaples look at the examples at [`example/`](./example) folder.

<details>
    
<summary>Resulting Code</summary>

```js
const passport = require('passport');
const DiscordStrategy = require('passport-dc').Strategy;
const { addUserToGuild } = require('passport-dc');

// Configure the Discord strategy
passport.use(new DiscordStrategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'YOUR_CALLBACK_URL',
    scope: ['identify', 'email', 'guilds', 'guilds.join']
}, function(accessToken, refreshToken, profile, done) {
    profile.refreshToken = refreshToken; // store this for later use
    // User profile returned from Discord
    // Save user to your DB here if needed
    return done(null, profile);
}));

app.get('/', (req, res) => {
    res.send('Welcome! <a href="/auth/discord">Login with Discord</a>');
});

// Authentication routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication
        res.redirect('/profile');
    }
);

// Session support
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Middleware to check authentication
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}

// Profile route
app.get('/profile', checkAuth, function (req, res) {
    res.json(req.user);
});

// Example: Add user to guild after authentication
app.post('/add-to-guild', checkAuth, function(req, res) {
    addUserToGuild(
        'YOUR_GUILD_ID',        // Guild/server ID
        req.user.id,            // User's Discord ID
        req.user.accessToken,   // User's OAuth2 access token
        'YOUR_BOT_TOKEN',       // Your bot token (must be in the guild)
        function(err) {
            if (err) {
                console.error('Failed to add user to guild:', err.message);
                return res.status(500).send('Failed to add user to guild');
            }
            res.send('User added to guild!');
        }
    );
});
```

</details>

---

## License

MIT

---

## Links

- [Passport](http://passportjs.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Original passport-discord](https://github.com/nicholastay/passport-discord)
