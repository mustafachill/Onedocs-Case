// IMPORTS
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cron = require('node-cron');
const pageRoute = require('./routes/pageRoute');
const userRoute = require('./routes/userRoute');
const apiRoute = require('./routes/api');

// EXPRESS
const app = express();

//CONNECT TO DB
mongoose
  .connect('mongodb://localhost/onedoccase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('DB Connected Successfully');
  })
  .catch((err) => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// TEMPLATE ENGINE
app.set('view engine', 'ejs');

// GLOBAL VARIABLES
global.userIN = null;

// MIDDLEWARES
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// SUPER DEBUG: Log ALL requests
app.use((req, res, next) => {
  console.log('🌟 REQUEST:', req.method, req.url);
  if (req.url.includes('/api/integrations/slack')) {
    console.log('🚨 SLACK REQUEST DETECTED:', req.method, req.url);
    console.log('🚨 Body:', req.body);
  }
  next();
});
app.use(
  session({
    secret: 'my_keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost/onedoccase',
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      secure: false, // set to true if using https
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use((req, res, next) => {
  userIN = req.session.userID;
  next();
});
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});
app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET'],
  })
);

// ROUTE
app.use('/', pageRoute);
app.use('/api', apiRoute);

// Auth routes
app.use('/login', express.static('public'));
app.use('/register', express.static('public'));
app.use('/', userRoute); // This will handle /login, /register, and /logout

// CRON
require('./cron/sendDocumentReminders');

// PORT
const port = 3000;
app.listen(port, () => {
  console.log(`App started on ${port}`);
});
