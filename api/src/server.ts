import errorHandler from 'errorhandler';

import { builder } from './app';
import { store, enrichqueue } from './init';

const app = builder(store, enrichqueue);

/**
 * Error Handler. Provides full stack - remove for production
 */
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), async () => {
  await store.initialize();
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});

export default server;
