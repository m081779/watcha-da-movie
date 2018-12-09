const LocalStrategy    = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');


module.exports = (passport) => {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => done(null, user.id));

  // used to deserialize the user
  passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    usernameField     : 'email',
    passwordField     : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  (req, email, password, done) => {


      process.nextTick(() => {

          User.findOne({ 'local.email' :  email }, (err, user) => {
              if (err) return done(err);

              if (user) {
                  return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
              } else {

                  const newUser            = new User();
                  newUser.local.email    = email;
                  newUser.local.password = newUser.generateHash(password);

                  // save the user
                  newUser.save((err) => {
                      if (err) throw err;
                      return done(null, newUser);
                  });
              }
          });
      });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  (req, email, password, done) => { // callback with email and password from our form


      User.findOne({ 'local.email' :  email }, (err, user) => {
          if (err) return done(err);

          if (!user)  return done(null, false, req.flash('loginMessage', 'No user found.'));

          if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

          return done(null, user);
      });
  }));
};
