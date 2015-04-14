// Example model

module.exports = function (sequelize, DataTypes) {

  var PageGallery = sequelize.define('PageGallery', { 
	order: DataTypes.INTEGER,
	active: DataTypes.BOOLEAN,
	default: DataTypes.BOOLEAN
  }, {
    classMethods: { }
  });

  return PageGallery;
};