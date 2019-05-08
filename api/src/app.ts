import express from 'express';
import compression from 'compression';  // compresses requests
import bodyParser from 'body-parser';
import lusca from 'lusca';
import dotenv from 'dotenv';
import passport from 'passport';

import { DATADIR } from './util/secrets';
import { Db } from './db';
import * as controller from './controller';
import { authenticate } from './config/passport';
import { Validator } from './validate';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env.example' });

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('db', new Db(DATADIR));
app.set('validator', new Validator());
app.use(compression());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// Public api
app.get('/api/projects', controller.listProjects);
app.get('/api/projects/:id', controller.getProject);
app.post('/api/projects', controller.createProject);
app.post('/api/projects/:id', controller.editProject);
app.get('/api/projects/:id/history', controller.getProjectHistory);
// Protected api
const protected_api = passport.authenticate('bearer', { session: false });
app.post('/api/auth', protected_api, authenticate);
app.get('/api/pending/projects', protected_api, controller.listPendingProjects);
app.get('/api/pending/projects/:id', protected_api, controller.getPendingProject);
app.delete('/api/pending/projects/:id', protected_api, controller.denyProject);
app.post('/api/pending/projects/:id', protected_api, controller.approveProject);

export default app;
