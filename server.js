
const express  = require('express');
const app      = express();
const PORT     = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');
const path     = require('path');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');

const config = require('./config/database');

// configuration ===============================================================
mongoose.Promise = Promise;
mongoose
  .connect(config.database)
  .then( result => {
    console.log(`Connected to database '${result.connections[0].name}' on ${result.connections[0].host}:${result.connections[0].port}`)
  })
  .catch(err => console.log('There was an error with your connection:', err));

require('./config/passport')(passport); // pass passport for configuration

app.use(express.static('public'))
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.set('view engine', 'ejs'); // set up ejs for templating

const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
  uri: config.database,
  collection: 'sessions'
});

store
  .on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
  });

// required for passport
app.use(session({
   secret: 'sdf897ghjty78s97d8gd4bgf4d65st4fg453g43r5tgh786g4b65dz1s',
   cookie: { maxAge: 24 * 60 * 60 * 1000 },
   resave: true,
   saveUninitialized: false,
   store: store
 })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
