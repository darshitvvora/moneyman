const properties = require('./watchlist.property');

module.exports = (sequelize, DataTypes) => {
    const Watchlist = sequelize.define('Watchlist', Object
        .assign(properties(DataTypes)), {
        tableName: 'watchlists',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_on',
        updatedAt: 'updated_on',
        deletedAt: 'deleted_on',
    });

    Watchlist.associate = (db) => {
        Watchlist.belongsTo(db.User, {
            as: 'Creator',
            foreignKey: 'created_by',
        });

        Watchlist.belongsTo(db.User, {
            as: 'Destroyer',
            foreignKey: 'deleted_by',
        });
        Watchlist.belongsTo(db.Stock, {
            as: 'Stock',
            foreignKey: 'stock_id',
        });
        Watchlist.belongsTo(db.User, {
            as: 'User',
            foreignKey: 'user_id',
        });
    };

    return Watchlist;
};
