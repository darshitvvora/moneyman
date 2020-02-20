const {
    engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
    up(queryInterface, DataTypes) {
        return queryInterface.createTable('daily_data', Object.assign(
            properties('dailyData', DataTypes),
            timestamps(['c', 'u', 'd'], DataTypes),
            {
                created_by: keys('users'),
                updated_by: keys('users'),
                deleted_by: keys('users'),
                stock_id: keys('stocks'),
            },
        ), engine);
    },
    down(queryInterface) {
        return queryInterface.dropTable('daily_data');
    },
};
