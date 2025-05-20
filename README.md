# passport-disocrd

[Passport](http://passportjs.org/) strategy for authenticating with [Discord](https://discord.com/) using OAuth 2.0.

This module lets you authenticate using Discord in your Node.js applications. By plugging into Passport, Discord authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware.

---

## Installation

```bash
npm install passport-disocord
```

---

## Usage

### Configure Strategy

```javascript
const passport = require('passport');
const DiscordStrategy = require('passport-disocrd').Strategy;

passport.use(new DiscordStrategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'YOUR_CALLBACK_URL',
    scope: ['identify', 'email', 'guilds', 'guilds.join']
}, function(accessToken, refreshToken, profile, done) {
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
const { addUserToGuild } = require('passport-disocrd');

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
- If you want to set options like nickname or roles, pass an options object before the callback:

```javascript
addUserToGuild(guildId, userId, accessToken, botToken, { nick: 'CoolUser' }, callback);
```

---

## License

MIT

---

## Links

- [Passport](http://passportjs.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Original passport-discord](https://github.com/nicholastay/passport-discord)