var Sequelize = require('sequelize');

var sequelize = new Sequelize('mysql://b1d25f459067c4:892f2bb8@us-cdbr-iron-east-02.cleardb.net/heroku_275eaf3adeef76c?reconnect=true', {logging: false});

var SuperValuCategory = sequelize.import(__dirname + '\\models\\supervalu_category'),
    SuperValuProduct = sequelize.import(__dirname + '\\models\\supervalu_product'),
    TescoCategory = sequelize.import(__dirname + '\\models\\tesco_category'),
    TescoProduct = sequelize.import(__dirname + '\\models\\tesco_product');

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
  foreignKey: 'cat_id'
});

TescoCategory.belongsTo(TescoCategory, {
  as: 'Parent',
  foreignKey: 'parent_id'
});

TescoCategory.hasMany(TescoCategory, {
  as: 'Children',
  foreignKey: 'parent_id'
});

TescoProduct.belongsTo(TescoCategory, {
  as: 'Category',
  foreignKey: 'cat_id'
});

TescoCategory.hasMany(TescoProduct, {
  as: 'Products',
  foreignKey: 'cat_id'
});

SuperValuCategory.sync();
SuperValuProduct.sync();
TescoCategory.sync();
TescoProduct.sync();

exports.SuperValuCategory = SuperValuCategory;
exports.SuperValuProduct = SuperValuProduct;
exports.TescoCategory = TescoCategory;
exports.TescoProduct = TescoProduct;