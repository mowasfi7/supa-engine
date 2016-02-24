module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AldiProduct', {
  		id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  		url: { type: DataTypes.STRING, unique: true },
		category: DataTypes.STRING,
		name: DataTypes.STRING,
		image: DataTypes.STRING,
		price: DataTypes.FLOAT.UNSIGNED,
		measure: DataTypes.STRING,
		price_desc: DataTypes.STRING,
		//description: DataTypes.STRING(1280),
		limited: DataTypes.STRING
	}, {
		underscored: true,
		tableName: 'al_products',
		timestamps: true
	});
}