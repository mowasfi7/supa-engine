module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TescoProduct', {
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
		name: DataTypes.STRING,
		cat_id: DataTypes.INTEGER.UNSIGNED,
		image: DataTypes.STRING,
		price: DataTypes.FLOAT.UNSIGNED,
		price_desc: DataTypes.STRING,
		//details_html: DataTypes.STRING(1280),
		promo: DataTypes.STRING(1280)
	}, {
		underscored: true,
		tableName: 'ts_products',
		timestamps: true
	});
}