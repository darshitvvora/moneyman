const properties = require('./user.property');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', Object
        .assign(properties(DataTypes)), {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_on',
        updatedAt: 'updated_on',
        deletedAt: 'deleted_on'
    });

    User.associate = (db) => {
        User.belongsTo(db.Client, {
            foreignKey: 'client_id',
        });

        User.hasMany(db.Watchlist, {
            as: 'WatchlistCreator',
            foreignKey: 'created_by',
        });
    };

    return User;
};
