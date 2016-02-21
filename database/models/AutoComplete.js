module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AutoComplete', {
		product: { type: DataTypes.STRING }
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'products',
		timestamps: true
	});
}