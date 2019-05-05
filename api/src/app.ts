import express from 'express';
import compression from 'compression';  // compresses requests
import bodyParser from 'body-parser';
import lusca from 'lusca';
import dotenv from 'dotenv';
import passport from 'passport';
import { Response, Request } from 'express';

import { SHARED_TOKEN, DATADIR } from './util/secrets';
import { Db } from './db';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env.example' });

// API keys and Passport configuration
import * as passportConfig from './config/passport';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('secret', SHARED_TOKEN);
app.set('db', new Db(DATADIR));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

const somefunc = (req: Request, res: Response) => {
  res.json([{
    title: 'API Examples'
  }]);
};

// Public api
app.get('/api/projects', somefunc);
app.get('/api/projects/:id', somefunc);
app.post('/api/projects', somefunc); // New
app.post('/api/projects/:id', somefunc); // Edit
app.get('/api/projects/:id/history', somefunc);
// Protected api
const protected_api = passport.authenticate('bearer', { session: false });
app.get('/api/pending/projects', protected_api, somefunc);
app.get('/api/pending/projects/:id', protected_api, somefunc);
app.delete('/api/pending/projects/:id', protected_api, somefunc); // Deny project
app.post('/api/pending/projects/:id', protected_api, somefunc); // Approve project

export default app;