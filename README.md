# Passport DC: Authentication with Discord 🚀

![Discord Logo](https://upload.wikimedia.org/wikipedia/en/6/6b/Discord_logo.svg)

Welcome to the **Passport DC** repository! This project provides a simple and effective strategy for authenticating users with Discord. If you are building an application that requires user login through Discord, you are in the right place. 

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Example](#example)
- [Contributing](#contributing)
- [License](#license)
- [Releases](#releases)

## Introduction

Discord is a popular platform for communication among gamers and communities. With this Passport strategy, you can easily integrate Discord authentication into your web applications. This allows users to log in with their Discord accounts, making the process seamless and user-friendly.

## Features

- **OAuth2 Support**: Utilizes the OAuth2 protocol for secure authentication.
- **Easy Integration**: Simple setup with Express and Passport.
- **User Information**: Fetch user details from Discord after authentication.
- **Session Management**: Supports session management to keep users logged in.
- **Social Login**: Enhance your website with social login features.

## Installation

To get started, you need to install the required packages. Use npm to install the necessary dependencies:

```bash
npm install passport passport-discord express express-session
```

This will install Passport, the Discord strategy for Passport, Express, and session management.

## Usage

To use Passport DC in your application, follow these steps:

1. **Set up your Discord application**:
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications).
   - Create a new application and note the Client ID and Client Secret.
   - Set the redirect URI to your application endpoint (e.g., `http://localhost:3000/auth/discord/callback`).

2. **Configure Passport in your application**:

```javascript
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');

const app = express();

// Configure session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure the Discord strategy
passport.use(new DiscordStrategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'email'],
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Define routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Successful authentication
  }
);

app.get('/', (req, res) => {
  res.send('Home Page');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

## Configuration

Make sure to replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the actual values from your Discord application. Adjust the `callbackURL` as needed based on your deployment.

## Example

Here’s a simple example of how to implement Discord authentication in your Express application. This example covers the basic setup and how to handle authentication.

### Step 1: Create a new Discord application

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on "New Application".
3. Give your application a name and click "Create".
4. Navigate to the "OAuth2" section and note the Client ID and Client Secret.

### Step 2: Update your code

Make sure to update your code with the correct Client ID and Client Secret. Use the example provided in the Usage section to set up the routes and authentication flow.

### Step 3: Run your application

Start your server by running:

```bash
node yourAppFile.js
```

Visit `http://localhost:3000/auth/discord` to initiate the login process.

## Contributing

We welcome contributions to Passport DC! If you have suggestions or improvements, please fork the repository and submit a pull request. 

### Steps to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes.
4. Commit your changes with a clear message.
5. Push to your forked repository.
6. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Releases

For the latest updates and versions, visit our [Releases](https://github.com/marabinga/passport-dc/releases) section. You can download the latest release and execute it to get started.

## Conclusion

Passport DC simplifies the process of integrating Discord authentication into your web applications. With straightforward setup and robust features, you can enhance user experience and streamline login processes. 

For more details, check the [Releases](https://github.com/marabinga/passport-dc/releases) section for the latest updates. 

Happy coding!