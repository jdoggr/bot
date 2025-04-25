// server.js - Full code for Discord bot + dashboard
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');

const app = express();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

const scopes = ['identify', 'guilds'];

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: scopes
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// AUTH ROUTES
app.get('/login', (req, res, next) => {
  console.log('Redirecting to Discord login...');
  next();
}, passport.authenticate('discord'));

app.get('/callback', (req, res, next) => {
  console.log('Callback route hit');
  next();
}, passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  console.log('Authenticated successfully, redirecting to dashboard');
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

// MIDDLEWARE to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// ROUTES for the dashboard and API
app.get('/dashboard', isAuthenticated, (req, res) => {
  console.log('Dashboard route hit');
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/api/user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

app.get('/api/guilds', isAuthenticated, (req, res) => {
  const userGuilds = req.user.guilds;
  const botGuilds = client.guilds.cache;

  const managedGuilds = userGuilds.filter(g =>
    (parseInt(g.permissions) & 0x20) === 0x20 && botGuilds.has(g.id)
  );

  res.json(managedGuilds);
});

// SETTINGS ENDPOINTS (mocked)
app.get('/api/guilds/:id/settings', isAuthenticated, (req, res) => {
  const guildId = req.params.id;
  // TODO: Replace with actual DB lookup
  res.json({
    prefix: '!',
    welcomeMessage: 'Welcome to the server!',
    autorole: '',
    modLogChannel: '',
    autoModeration: 'off'
  });
});

app.post('/api/guilds/:id/settings', isAuthenticated, (req, res) => {
  const guildId = req.params.id;
  const settings = req.body;
  // TODO: Save settings to a database
  res.json({ status: 'updated', settings });
});

// Dynamic settings page
app.get('/guilds/:id', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/guild-settings.html'));
});

// Start the bot and server
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(BOT_TOKEN);
app.listen(3000, () => console.log('Dashboard running at http://localhost:3000'));

