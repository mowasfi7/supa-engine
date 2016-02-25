module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SuperValuProduct', {
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
		name: DataTypes.STRING,
		cat_id: DataTypes.INTEGER.UNSIGNED,
		image: DataTypes.STRING,
		price: DataTypes.FLOAT.UNSIGNED,
		measure: DataTypes.STRING,
		price_desc: DataTypes.STRING,
		promo: DataTypes.STRING,
		limited: DataTypes.STRING(8)
	}, {
		underscored: true,
		tableName: 'sv_products',
		timestamps: true
	});
}