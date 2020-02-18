const properties = require('./dailyData.property');

module.exports = (sequelize, DataTypes) => {
  const DailyData = sequelize.define('DailyData', Object
    .assign(properties(DataTypes)), {
    tableName: 'daily_data',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_on',
    updatedAt: 'updated_on',
    deletedAt: 'deleted_on',
  });

    DailyData.associate = (db) => {

        DailyData.belongsTo(db.User, {
      as: 'Creator',
      foreignKey: 'created_by',
    });

        DailyData.belongsTo(db.User, {
      as: 'Destroyer',
      foreignKey: 'deleted_by',
    });
        DailyData.belongsTo(db.Stock, {
      as: 'Stock',
      foreignKey: 'stock_id',
    });
  };

  return DailyData;
};
