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
    clientID: '398234135372-b4bnplinbq6mu3j088lj0tk73vku7egu.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'https://passport-login-6tmp.onrender.com/auth/google/callback', // This callback URL should match the one you configured in your Google Developer Console
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(`accessToken: ${accessToken}`)
    console.log(`refreshToken: ${refreshToken}`)
    //console.log(profile)
    return done(null, profile);
  }
  ));

passport.serializeUser(function(user, done) {
    console.log(`serializeUser`)

    done(null, user);
});

// Deserialize user from session
passport.deserializeUser(function(user, done) {
    console.log(`deserializeUser`)
    done(null, user);
});
  

// Define routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/profile')
} else {
  res.send('Welcome to the homepage!<br> Click <a href="/auth/google">here</a> to login.');
}
  
});

// Set up a route for the Google login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })
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
      res.render('profile.ejs', { user: req.user, msg: JSON.stringify(req.user) });
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
