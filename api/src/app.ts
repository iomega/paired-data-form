import express from 'express';
import compression from 'compression';  // compresses requests
import lusca from 'lusca';
import passport from 'passport';
import asyncHandler from 'express-async-handler';

import * as controller from './controller';
import { okHandler } from './config/passport';
import { Validator } from './validate';
import { store, enrichqueue } from './init';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('store', store);
app.set('validator', new Validator());
app.set('enrichqueue', enrichqueue);
app.use(compression());
app.use(express.json({limit: '1mb'}));
app.use(passport.initialize());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// Public api
app.get('/api/projects', asyncHandler(controller.listProjects));
app.get('/api/projects/:id', asyncHandler(controller.getProject));
app.get('/api/projects/:id/enriched', asyncHandler(controller.getEnrichedProject));
app.post('/api/projects', asyncHandler(controller.createProject));
app.post('/api/projects/:id', asyncHandler(controller.editProject));
app.get('/api/projects/:id/history', asyncHandler(controller.getProjectHistory));
app.get('/api/stats', asyncHandler(controller.getStats));
// Protected api
const protected_api = passport.authenticate('bearer', { session: false });
app.post('/api/auth', protected_api, okHandler);
app.get('/api/pending/projects', protected_api, asyncHandler(controller.listPendingProjects));
app.get('/api/pending/projects/:id', protected_api, asyncHandler(controller.getPendingProject));
app.delete('/api/pending/projects/:id', protected_api, asyncHandler(controller.denyProject));
app.post('/api/pending/projects/:id', protected_api, asyncHandler(controller.approveProject));

app.use(controller.notFoundHandler);

export default app;
