// Example model

module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', { 
	username: DataTypes.STRING,
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

