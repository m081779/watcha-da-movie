var User = require('../models/user');
var Movie = require('../models/movie');
const moment = require('moment');
// const db = require('../models');
module.exports = function(app, passport) {

// =====================================
// HOME PAGE (with login links) ========
// =====================================
    app.get('/', function(req, res) {
      res.render('index.ejs'); // load the index.ejs file
    });

// =====================================
// LOGIN ===============================
// =====================================
    // show the login form
    app.get('/login', function(req, res) {
      // render the page and pass in any flash data if it exists
      res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }));

// =====================================
// SIGNUP ==============================
// =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
      // render the page and pass in any flash data if it exists
      res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }));
// =====================================
// PROFILE SECTION =====================
// =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
      User
        .findOne({'local.email': req.user.local.email})
        .populate('movies')
        .then(user => {
          res.render('profile', {movies: user.movies, user: user.local.email});
        })
        .catch(err=> res.json(err));
    });


// =====================================
// FACEBOOK ROUTES =====================
// =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {
      scope : ['public_profile', 'email']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
          successRedirect : '/profile',
          failureRedirect : '/'
    }));


// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', {
          scope : ['public_profile', 'email']
        }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));




// =====================================
// LOGOUT ==============================
// =====================================
    app.get('/logout', function(req, res) {
      req.logout();
      req.session.destroy(function (err) {
        if (!err) {
          res.clearCookie('connect.sid', {path: '/'}).redirect('/');
        } else {
          console.log('Error from session destroy:', err);
        }
      });
    });




//==================================================================
// Movie Routes ====================================================
//==================================================================
//post api route inserts movie in to database
app.post('/api/movie', (req,res) => {
  let newMovie =  new Movie({
    movie_name: req.body.movie_name,
    addedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    watchedAt: ''
  });
  Movie
    .create(newMovie)
    .then(result => {
      User
        .findOneAndUpdate({'local.email': req.user.local.email}, {$push: {movies: result._id}})
        .then(response => {
          res.sendStatus(200);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

//put api route modifies watched boolean of selected movie
app.put('/api/:movie', (req,res) => {
	let id = req.params.movie,
		watchedAt =  moment(new Date()).format("MM-DD-YYYY, h:mm a");

    Movie
      .update({_id: id}, {watchedAt: watchedAt, watched: true})
      .then(result => {
        res.sendStatus(200).end();
      })
      .catch(err => res.json(err));
});

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
