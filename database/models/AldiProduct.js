module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AldiProduct', {
		path: { type: DataTypes.STRING, primaryKey: true },
		title: DataTypes.STRING,
		images: DataTypes.STRING,
		value: DataTypes.FLOAT.UNSIGNED,
		per: DataTypes.STRING,
		detailamount: DataTypes.STRING,
		description: DataTypes.STRING,
		limited: DataTypes.STRING
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'al_products',
		timestamps: true
	});
}