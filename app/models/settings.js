module.exports = function (sequelize, DataTypes) {

  var Setting = sequelize.define('Setting', {
  key: DataTypes.STRING,
	value: DataTypes.STRING,
	create: DataTypes.DATE
  });

  return Setting;
};
