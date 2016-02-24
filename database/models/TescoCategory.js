module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TescoCategory', {
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
		name: DataTypes.STRING,
		parent_id: DataTypes.INTEGER.UNSIGNED
	}, {
		underscored: true,
		tableName: 'ts_categories',
		timestamps: true
	});
}