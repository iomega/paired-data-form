import passport from 'passport';
import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  if (password == 'foobar') {
    return done(undefined, {'username': 'someone'});
  } else {
    return done(undefined, false, { message: 'Incorrect password.' });
  }
}));

