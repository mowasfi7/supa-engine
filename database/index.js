var Sequelize = require('sequelize');

var sequelize = new Sequelize('mysql://vmg39id2c3aki0jr:wnua547bm1zuerms@t6xm9fde86ceioyy.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/heroku_app_db');

var SuperValuCategory = sequelize.import(__dirname + '\\models\\SuperValuCategory'),
    SuperValuProduct = sequelize.import(__dirname + '\\models\\SuperValuProduct'),
    TescoCategory = sequelize.import(__dirname + '\\models\\TescoCategory');

SuperValuCategory.belongsTo(SuperValuCategory, {
  as: 'Parent',
  foreignKey: 'parent_id'
});

SuperValuCategory.hasMany(SuperValuCategory, {
  as: 'Children',
  foreignKey: 'parent_id'
});

SuperValuProduct.belongsTo(SuperValuCategory, {
  as: 'Category',
  foreignKey: 'cat_id'
});

SuperValuCategory.hasMany(SuperValuProduct, {
  as: 'Products',
  foreignKey: 'id'
});

SuperValuCategory.sync();
SuperValuProduct.sync();
TescoCategory.sync({force: true});

exports.SuperValuCategory = SuperValuCategory;
exports.SuperValuProduct = SuperValuProduct;
exports.TescoCategory = TescoCategory;