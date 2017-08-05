/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const categoryPropertyDefs = sequelize.define('place_categories_property_defs', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true
    },
    property_def_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined
    },
    place_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined
    }
  }, {
    underscored: true,
    timestamps: false
  })

  categoryPropertyDefs.tableName = 'place_categories_property_defs'
      
  categoryPropertyDefs.associate = (models) => {
    categoryPropertyDefs.belongsTo(models.property_defs)
  }

  return categoryPropertyDefs
}
