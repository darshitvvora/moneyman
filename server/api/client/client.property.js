const { CLIENT_TYPE } = require('../../config/constants');

module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: false,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  name: DataTypes.STRING,
  type: {
    type: DataTypes.ENUM,
    values: [...Object.values(CLIENT_TYPE)],
    defaultValue: CLIENT_TYPE.FREE,
  },
  updated_by: DataTypes.INTEGER,
  created_by: DataTypes.INTEGER,
  deleted_by: DataTypes.INTEGER,
});
