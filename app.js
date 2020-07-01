const express = require("express");
const path = require('path');
const mongoose = require('mongoose'); 
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo')(session);
// Bring in express handlebars
const exphbs = require("express-handlebars");
const connectDB = require("./config/db");

// Load config
dotenv.config({path: './config/config.env' });

// Passport config
require('./config/passport')(passport)

// Database connection
connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Method overide middleware
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Use morgan middleware in dev mode
if (process.env.NODE_ENV = "development") {
  app.use(morgan("dev"));
}

// Handlebars Helper
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs');

// Handlebars Middleware
app.engine('.hbs', exphbs({
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  }, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

// Session middleware
app.use(session({
  secret: "Super secret session text",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection})
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));
// Set server port
const PORT = process.env.PORT || 3000;
// Start server
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))