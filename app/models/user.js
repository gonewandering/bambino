// Example model

module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', { 
  name: DataTypes.STRING,
	email: DataTypes.STRING,
	password: DataTypes.STRING,
	create: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {

     } 
    }
  });

  return User;
};

