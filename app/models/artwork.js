// Example model
var Gallery = require('../models/gallery');
var GalleryArt = require('../models/galleryArt');

module.exports = function (sequelize, DataTypes) {

  var Artwork = sequelize.define('Artwork', { 
	square: DataTypes.STRING,
	display: DataTypes.STRING,
	full: DataTypes.STRING,
  title: DataTypes.STRING,
  size: DataTypes.STRING,
  medium: DataTypes.STRING,
  created: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {
        models.Artwork.belongsToMany(models.Gallery, { through: models.GalleryArt });
        models.Gallery.belongsToMany(models.Artwork, { through: models.GalleryArt });
      }
    }
  });

  return Artwork;
};
