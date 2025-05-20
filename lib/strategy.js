/**
 * Dependencies
 */
var OAuth2Strategy = require('passport-oauth2')
    , InternalOAuthError = require('passport-oauth2').InternalOAuthError
    , util = require('util')
    , https = require('https');


/**
 * Options for the Strategy.
 * @typedef {Object} StrategyOptions
 * @property {string} clientID
 * @property {string} clientSecret
 * @property {string} callbackURL
 * @property {Array} scope
 * @property {string} [authorizationURL="https://discord.com/api/oauth2/authorize"]
 * @property {string} [tokenURL="https://discord.com/api/oauth2/token"]
 * @property {string} [scopeSeparator=" "]
 */
/**
 * `Strategy` constructor.
 *
 * The Discord authentication strategy authenticates requests by delegating to
 * Discord via the OAuth2.0 protocol
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid. If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`       OAuth ID to discord
 *   - `clientSecret`   OAuth Secret to verify client to discord
 *   - `callbackURL`    URL that discord will redirect to after auth
 *   - `scope`          Array of permission scopes to request
 *                      Check the official documentation for valid scopes to pass as an array.
 * 
 * @constructor
 * @param {StrategyOptions} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://discord.com/api/oauth2/authorize';
    options.tokenURL = options.tokenURL || 'https://discord.com/api/oauth2/token';
    options.scopeSeparator = options.scopeSeparator || ' ';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'discord';
    this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherits from `OAuth2Strategy`
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Discord.
 *
 * This function constructs a normalized profile.
 * Along with the properties returned from /users/@me, properties returned include:
 *   - `connections`      Connections data if you requested this scope
 *   - `guilds`           Guilds data if you requested this scope
 *   - `fetchedAt`        When the data was fetched as a `Date`
 *   - `accessToken`      The access token used to fetch the (may be useful for refresh)
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
    var self = this;
    this._oauth2.get('https://discord.com/api/users/@me', accessToken, function (err, body, res) {
        if (err) {
            return done(new InternalOAuthError('Failed to fetch the user profile.', err))
        }

        try {
            var parsedData = JSON.parse(body);
        }
        catch (e) {
            return done(new Error('Failed to parse the user profile.'));
        }

        var profile = parsedData; // has the basic user stuff
        profile.provider = 'discord';
        profile.accessToken = accessToken;
        profile.avatarUrl = 'https://cdn.discordapp.com/avatars/' + profile.id + '/' + profile.avatar + '.png?size=1024' || null;

        self.checkScope('connections', accessToken, function (errx, connections) {
            if (errx) done(errx);
            if (connections) profile.connections = connections;
            self.checkScope('guilds', accessToken, function (erry, guilds) {
                if (erry) done(erry);
                if (guilds) profile.guilds = guilds;

                profile.fetchedAt = new Date();
                return done(null, profile)
            });
        });
    });
};

Strategy.prototype.checkScope = function (scope, accessToken, cb) {
    if (this._scope && this._scope.indexOf(scope) !== -1) {
        this._oauth2.get('https://discord.com/api/users/@me/' + scope, accessToken, function (err, body, res) {
            if (err) return cb(new InternalOAuthError('Failed to fetch user\'s ' + scope, err));
            try {
                var json = JSON.parse(body);
            }
            catch (e) {
                return cb(new Error('Failed to parse user\'s ' + scope));
            }
            cb(null, json);
        });
    } else {
        cb(null, null);
    }
}
/**
 * Options for the authorization.
 * @typedef {Object} authorizationParams
 * @property {any} permissions
 * @property {any} prompt
 */
/**
 * Return extra parameters to be included in the authorization request.
 *
 * @param {authorizationParams} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
    var params = {};
    if (typeof options.permissions !== 'undefined') {
        params.permissions = options.permissions;
    }
    if (typeof options.prompt !== 'undefined') {
        params.prompt = options.prompt;
    }
    return params;
};





/**
 * Add a user to a guild using the guilds.join scope.
 *
 * @param {string} guildId - The ID of the guild to add the user to.
 * @param {string} userId - The ID of the user to add.
 * @param {string} userAccessToken - The user's OAuth2 access token with guilds.join scope.
 * @param {string} botToken - Your bot token (must be in the guild).
 * @param {object} [options] - Optional parameters (nick, roles, mute, deaf).
 * @param {function} done - Callback function (err, res).
 * @access public
 */
Strategy.addUserToGuild = function (guildId, userId, accessToken, botToken, options, done) {
    if (typeof options === 'function') {
        done = options;
        options = {};
    }
    var payload = JSON.stringify(Object.assign({ access_token: accessToken }, options || {}));
    var https = require('https');
    var requestOptions = {
        hostname: 'discord.com',
        path: `/api/guilds/${guildId}/members/${userId}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    var req = https.request(requestOptions, function (res) {
        var body = '';
        res.on('data', function (chunk) { body += chunk; });
        res.on('end', function () {
            if (res.statusCode === 201 || res.statusCode === 204) {
                if (done) done();
            } else {
                throw new Error(
                    `Unable to make user id ${userId} join the guild id ${guildId}`
                );
            }
        });
    });

    req.on('error', function (e) {
        throw new Error(
            `Unable to make user id ${userId} join the guild id ${guildId}: ${e.message}`
        );
    });

    req.write(payload);
    req.end();
};



/**
 * Expose `Strategy`.
 */
module.exports = Strategy;