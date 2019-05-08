import passport from 'passport';
import { Strategy } from 'passport-http-bearer';
import { Request, Response } from 'express';

import { SHARED_TOKEN } from '../util/secrets';

/**
 * Sign in using token.
 */
passport.use(new Strategy((token, done) => {
  if (token === SHARED_TOKEN) {
    return done(undefined, {'username': 'admin'});
  } else {
    return done(undefined, false);
  }
}));

export const authenticate = (req: Request, res: Response) => {
  const message = 'OK';
  res.json({message});
};
