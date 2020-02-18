/* eslint no-process-env:0 */

const path = require('path');
const dotenv = require('dotenv');
const _ = require('lodash');
const shared = require('./shared');

const root = path.normalize(`${__dirname}/../../..`);

const env = dotenv.config({ path: path.join(root, '.env') }).parsed;
const { DOMAIN, PREFIX } = env;

// All configurations will extend these options
// ============================================
var all = {
    env: env.NODE_ENV,

    // Root path of server
    root,

    // dev client port
    clientPort: env.CLIENT_PORT || 3015,

    // Server port
    port: env.PORT || 9015,

    // Server IP
    ip: env.IP || '0.0.0.0',

    // Should we populate the DB with sample data?
    seedDB: false,

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        session: 'moneyman-secret'
    },

    google: {
        clientID: env.GOOGLE_ID || 'id',
        clientSecret: env.GOOGLE_SECRET || 'secret',
        callbackURL: `${env.DOMAIN || ''}/auth/google/callback`
    }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    env,
    shared || {},
);
