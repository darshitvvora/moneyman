/**
 * Main application routes
 */
import path from 'path';
const { name, version } = require('../package.json');
import errors from './components/errors';
const logger = require('./components/logger');


const stockRoute = require('./api/stock');
const watchlistRoute = require('./api/watchlist');
const userRoute = require('./api/user');

export default function(app) {
    // Insert routes below
    app.get('/api/health', (req, res) => res.json({ name, version }));
    app.use('/api/user', userRoute);
    app.use('/api/stock', stockRoute);
    app.use('/api/watchlist', watchlistRoute);
    app.use('/auth', require('./auth').default);

   // app.use(app.express.static(app.get('appPath')));
    app.use(logger.transports.sentry.raven.errorHandler());

    // All undefined asset or api routes should return a 404
    // eslint-disable-next-line no-unused-vars
    app.use((e, req, res, next) => {
        logger.error(e);
        return (res.status(e.statusCode || e.code || 500)
            .json({ message: e.message, stack: e.stack }));
    });

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the app.html
    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
        });
}
