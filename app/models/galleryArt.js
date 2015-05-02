// Example model

module.exports = function (sequelize, DataTypes) {

  var GalleryArt = sequelize.define('GalleryArt', {
    GalleryId: DataTypes.INTEGER,
    ArtworkId: DataTypes.INTEGER,
  	order: DataTypes.INTEGER,
  	active: DataTypes.BOOLEAN
  }, {
    classMethods: { }
  });

  return GalleryArt;
};
