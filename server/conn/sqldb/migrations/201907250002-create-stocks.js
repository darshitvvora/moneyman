const {
    engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
    up(queryInterface, DataTypes) {
        return queryInterface.createTable('stocks', Object.assign(
            properties('stock', DataTypes),
            timestamps(['c', 'u', 'd'], DataTypes),
            {
                created_by: keys('users'),
                updated_by: keys('users'),
                deleted_by: keys('users'),
            },
        ), engine);
    },
    down(queryInterface) {
        return queryInterface.dropTable('stocks');
    },
};
