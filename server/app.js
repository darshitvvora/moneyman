/**
 * Main application file
 */


const express = require('express');
const http = require('http');

const config = require('./config/environment');
const db = require('./conn/sqldb');

//import initWebSocketServer from './config/websockets';
import expressConfig from './config/express';
import registerRoutes from './routes';

const logger = require('./components/logger');


// Setup server
var app = express();
var server = http.createServer(app);
//const wsInitPromise = initWebSocketServer(server);
expressConfig(app);
registerRoutes(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function() {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
}

process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    logger.error('uncaughtException', err);
});

db.sequelizeMoneyman
    .authenticate()
    .then(startServer)
    .catch((err) => {
        logger.error('Server failed to start due to error: %s', err);
    });


// Expose app
exports = module.exports = app;
