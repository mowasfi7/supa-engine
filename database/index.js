var Sequelize = require('sequelize');

var sequelize = new Sequelize('mysql://vmg39id2c3aki0jr:wnua547bm1zuerms@t6xm9fde86ceioyy.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/heroku_app_db');

var SVCategory = sequelize.define('SVCategory', {
  id: { type: Sequelize.INTEGER, unique: true },
  name: Sequelize.STRING,
  parent_id: Sequelize.INTEGER,
  priority: Sequelize.INTEGER,
  children_count: { type: Sequelize.INTEGER, defaultValue: 0 }
}, {
  paranoid: true,
  underscored: true,
  tableName: 'sv_categories',
  timestamps: true
});

var SVProduct = sequelize.define('SVProduct', {
  id: { type: Sequelize.INTEGER, unique: true },
  name: Sequelize.STRING,
  cat_id: Sequelize.INTEGER,
  small_image: Sequelize.STRING,
  med_image: Sequelize.STRING,
  lrg_image: Sequelize.STRING,
  type: Sequelize.INTEGER,
  unit_price: Sequelize.FLOAT,
  unit_measure: Sequelize.STRING,
  price_desc: Sequelize.STRING,
  qty: Sequelize.INTEGER,
  note: Sequelize.STRING,
  favourite: Sequelize.STRING,
  promo_text: Sequelize.STRING,
  promo_desc: Sequelize.STRING,
  promo_id: Sequelize.INTEGER,
  promo_count: Sequelize.INTEGER,
  promo_grp_id: Sequelize.INTEGER,
  promo_grp_name: Sequelize.STRING,
  promo_start: Sequelize.DATE,
  promo_end: Sequelize.DATE
}, {
  paranoid: true,
  underscored: true,
  tableName: 'sv_products',
  timestamps: true
});

SVCategory.belongsTo(SVCategory, {
  as: 'Parent',
  foreignKey: 'parent_id'
});

SVCategory.hasMany(SVCategory, {
  as: 'Children',
  foreignKey: 'parent_id'
});

SVProduct.belongsTo(SVCategory, {
  as: 'Category',
  foreignKey: 'cat_id'
});

SVCategory.hasMany(SVProduct, {
  as: 'Products',
  foreignKey: 'id'
});

SVCategory.sync();
SVProduct.sync();

exports.SVCategory = SVCategory;
exports.SVProduct = SVProduct;