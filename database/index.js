var Sequelize = require('sequelize');

var sequelize = new Sequelize('mysql://b1d25f459067c4:892f2bb8@us-cdbr-iron-east-02.cleardb.net/heroku_275eaf3adeef76c?reconnect=true', {logging: false});

if(__dirname.substring(0, 3) == 'C:\\'){  //For windows
  var SuperValuCategory = sequelize.import(__dirname + '\\models\\SuperValuCategory'),
      SuperValuProduct = sequelize.import(__dirname + '\\models\\SuperValuProduct'),
      TescoCategory = sequelize.import(__dirname + '\\models\\TescoCategory'),
      TescoProduct = sequelize.import(__dirname + '\\models\\TescoProduct'),
      AldiProduct = sequelize.import(__dirname + '\\models\\AldiProduct');
}
else{
  var SuperValuCategory = sequelize.import(__dirname + '/models/SuperValuCategory'),
      SuperValuProduct = sequelize.import(__dirname + '/models/SuperValuProduct'),
      TescoCategory = sequelize.import(__dirname + '/models/TescoCategory'),
      TescoProduct = sequelize.import(__dirname + '/models/TescoProduct'),
      AldiProduct = sequelize.import(__dirname + '/models/AldiProduct');
}



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
AldiProduct.sync();

exports.SuperValuCategory = SuperValuCategory;
exports.SuperValuProduct = SuperValuProduct;
exports.TescoCategory = TescoCategory;
exports.TescoProduct = TescoProduct;
exports.AldiProduct = AldiProduct;