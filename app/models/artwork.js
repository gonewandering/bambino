// Example model
var Gallery = require('../models/gallery');
var GalleryArt = require('../models/galleryArt');

module.exports = function (sequelize, DataTypes) {

  var Artwork = sequelize.define('Artwork', {
  pieceId: DataTypes.STRING,
	square: DataTypes.STRING,
	display: DataTypes.STRING,
	full: DataTypes.STRING,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  size: DataTypes.STRING,
  medium: DataTypes.STRING,
  created: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {

        models.Artwork.belongsToMany(models.Gallery, {
          through: {
            model: models.GalleryArt,
            unique: true
          }
        });

        models.Gallery.belongsToMany(models.Artwork, {
          through: {
            model: models.GalleryArt,
            unique: true
          }
        });
      }
    }
  });

  return Artwork;
};
