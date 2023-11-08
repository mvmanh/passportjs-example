const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const expressSession = require('express-session');
const flash = require('connect-flash'); // Add this line


const app = express();
app.use(flash());
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
const port = 3000;

// Configure session
app.use(expressSession({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Configure the local strategy for Passport
/*passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(username, password)
    // Replace this with actual user authentication logic (e.g., querying a database)
    if (username === 'admin' && password === '111111') {
      return done(null, { id: 1, username: 'admin' });
    } else {
      return done(null, false, { message: 'Incorrect username or password' });
    }
  })
);*/

// Configure the Google Strategy
passport.use(new GoogleStrategy({
    clientID: 'your-google-client-id',
    clientSecret: 'your-google-client-secret',
    callbackURL: 'http://localhost:3000/auth/google/callback', // This callback URL should match the one you configured in your Google Developer Console
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
  ));

passport.serializeUser(function(user, done) {
    console.log(`serializeUser`)
    console.log(user)
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser(function(user, done) {
    console.log(`deserializeUser`)
    console.log(user)
    done(null, user);
});
  

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

// Set up a route for the Google login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

// Callback route after Google authentication
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/profile');
  }
);

// Route to display the user profile after successful authentication
app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.user)
      res.render('profile.ejs', { user: req.user });
    } else {
      res.redirect('/');
    }
  });

app.get('/logout', (req, res) => {
  req.logout(err => {
    console.log(err)
    res.redirect('/');
  });
  
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
