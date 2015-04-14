// Example model

module.exports = function (sequelize, DataTypes) {

  var Gallery = sequelize.define('Gallery', { 
	slug: DataTypes.STRING,
	title: DataTypes.STRING,
  description: DataTypes.TEXT,
	created: DataTypes.DATE,
	active: DataTypes.BOOLEAN,
	order: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        models.Gallery.belongsToMany(models.Page, { through: models.pageGallery });
        models.Page.belongsToMany(models.Gallery, { through: models.pageGallery });
      }
    }
  });

  return Gallery;
};

