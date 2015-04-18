module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SuperValuCategory', {
		id: { type: DataTypes.INTEGER.UNSIGNED, unique: true },
		name: DataTypes.STRING,
		parent_id: DataTypes.INTEGER.UNSIGNED,
	  	priority: DataTypes.INTEGER.UNSIGNED,
	  	children_count: { type: DataTypes.INTEGER, defaultValue: 0 }
	}, {
		paranoid: true,
		underscored: true,
		tableName: 'sv_categories',
		timestamps: true
	});
}