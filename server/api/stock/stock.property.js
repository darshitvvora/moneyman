const { EXCHANGE } = require('../../config/constants');

module.exports = DataTypes => ({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    symbol: DataTypes.STRING,
    industry: DataTypes.STRING,
    ISIN_code: DataTypes.STRING,
    group: DataTypes.STRING,
    moneycontrol_sym: DataTypes.STRING,
    exchange: {
        type: DataTypes.ENUM,
        values: [...Object.values(EXCHANGE)],
        defaultValue: EXCHANGE.NSE,
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
});
