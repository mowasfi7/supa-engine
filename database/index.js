var Sequelize = require('sequelize');

var sequelize = new Sequelize('mysql://b1d25f459067c4:892f2bb8@us-cdbr-iron-east-02.cleardb.net/heroku_275eaf3adeef76c?reconnect=true');

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