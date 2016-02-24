module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AutoComplete', {
		product: { type: DataTypes.STRING }
	}, {
		tableName: 'products'
	});
}