import passport from 'passport';
import { Strategy } from 'passport-http-bearer';

/**
 * Sign in using Email and Password.
 */
passport.use(new Strategy((token, done) => {
  if (token === 'foobar') { // TODO use TOKEN_SECRET
    return done(undefined, {'username': 'admin'});
  } else {
    return done('Incorrect token.');
  }
}));
