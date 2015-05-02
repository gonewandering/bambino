// Example model

module.exports = function (sequelize, DataTypes) {

  var Page = sequelize.define('Page', {
    	slug: DataTypes.STRING,
    	title: DataTypes.STRING,
    	template: DataTypes.STRING,
    	meta: DataTypes.TEXT,
    	created: DataTypes.DATE,
    	active: DataTypes.BOOLEAN,
      content: DataTypes.TEXT,
      post: DataTypes.BOOLEAN
    }
  );

  return Page;
};
