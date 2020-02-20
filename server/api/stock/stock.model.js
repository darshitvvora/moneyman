const properties = require('./stock.property');

module.exports = (sequelize, DataTypes) => {
    const Stock = sequelize.define('Stock', Object
        .assign(properties(DataTypes)), {
        tableName: 'stocks',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_on',
        updatedAt: 'updated_on',
        deletedAt: 'deleted_on',
    });

    Stock.associate = (db) => {
        Stock.belongsTo(db.User, {
            as: 'Creator',
            foreignKey: 'created_by',
        });

        Stock.belongsTo(db.User, {
            as: 'Destroyer',
            foreignKey: 'deleted_by',
        });
    };

    return Stock;
};
