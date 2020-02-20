const {
    engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
    up(queryInterface, DataTypes) {
        return queryInterface.createTable('watchlists', Object.assign(
            properties('watchlist', DataTypes),
            timestamps(['c', 'u', 'd'], DataTypes),
            {
                created_by: keys('users'),
                updated_by: keys('users'),
                deleted_by: keys('users'),
                stock_id: keys('stocks'),
                user_id: keys('users'),
            },
        ), engine);
    },
    down(queryInterface) {
        return queryInterface.dropTable('watchlists');
    },
};
