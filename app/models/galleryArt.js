// Example model

module.exports = function (sequelize, DataTypes) {

  var GalleryArt = sequelize.define('GalleryArt', { 
	order: DataTypes.INTEGER,
	active: DataTypes.BOOLEAN
  }, {
    classMethods: { }
  });

  return GalleryArt;
};

