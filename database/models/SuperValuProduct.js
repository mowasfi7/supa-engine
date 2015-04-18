module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SuperValuProduct', {
		id: { type: DataTypes.INTEGER.UNSIGNED, unique: true },
		name: DataTypes.STRING,
		cat_id: DataTypes.INTEGER.UNSIGNED,
		small_image: DataTypes.STRING,
		med_image: DataTypes.STRING,
		lrg_image: DataTypes.STRING,
		type: DataTypes.INTEGER.UNSIGNED,
		unit_price: DataTypes.FLOAT,
		unit_measure: DataTypes.STRING,
		price_desc: DataTypes.STRING,
		qty: DataTypes.INTEGER.UNSIGNED,
		note: DataTypes.STRING,
		favourite: DataTypes.STRING,
		promo_text: DataTypes.STRING,
		promo_desc: DataTypes.STRING,
		promo_id: DataTypes.INTEGER.UNSIGNED,
		promo_count: DataTypes.INTEGER.UNSIGNED,
		promo_grp_id: DataTypes.INTEGER.UNSIGNED,
		promo_grp_name: DataTypes.STRING,
		promo_start: DataTypes.DATE,
		promo_end: DataTypes.DATE
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'sv_products',
		timestamps: true
	});
}