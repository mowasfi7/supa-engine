module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SuperValuProduct', {
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
		name: DataTypes.STRING,
		cat_id: DataTypes.INTEGER.UNSIGNED,
		small_image: DataTypes.STRING,
		med_image: DataTypes.STRING,
		lrg_image: DataTypes.STRING,
		unit_price: DataTypes.FLOAT.UNSIGNED,
		unit_measure: DataTypes.STRING,
		price_desc: DataTypes.STRING,
		promo_text: DataTypes.STRING,
		promo_desc: DataTypes.STRING,
		promo_id: DataTypes.INTEGER.UNSIGNED,
		promo_count: DataTypes.INTEGER.UNSIGNED,
		promo_grp_id: DataTypes.INTEGER.UNSIGNED,
		promo_grp_name: DataTypes.STRING
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'sv_products',
		timestamps: true
	});
}