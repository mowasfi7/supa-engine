module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TescoProduct', {
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
		name: DataTypes.STRING,
		cat_id: DataTypes.INTEGER.UNSIGNED,
		images: DataTypes.STRING,
		price: DataTypes.FLOAT.UNSIGNED,
		price_desc: DataTypes.STRING,
		details_html: DataTypes.STRING,
		promo_html: DataTypes.STRING
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'ts_products',
		timestamps: true
	});
}