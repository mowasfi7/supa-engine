module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TescoCategory', {
		id: { type: DataTypes.INTEGER, unique: true },
		name: DataTypes.STRING,
		parent_id: DataTypes.INTEGER
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'ts_categories',
		timestamps: true
	});
}