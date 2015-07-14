module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SuperValuCategory', {
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
		name: DataTypes.STRING,
		parent_id: DataTypes.INTEGER.UNSIGNED
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'sv_categories',
		timestamps: true
	});
}