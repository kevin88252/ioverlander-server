/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const places = sequelize.define('places', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    place_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    duplicate_of_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    date_verified: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    properties_blob: {
      type: 'blob(4096)',
      allowNull: true,
      defaultValue: undefined
    },
    import_properties_blob: {
      type: 'blob(4096)',
      allowNull: true,
      defaultValue: undefined
    },
    cleaned: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: undefined
    },
    guid: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: undefined
    }
  }, {
    tableName: 'places', underscored: true,
    classMethods: {
      associate: (models) => {
        places.hasMany(models.check_ins)
        places.belongsTo(models.locations)
        places.belongsTo(models.place_categories)
        places.belongsTo(models.countries)
        places.hasMany(models.place_translations)
      }
    }
  })

  return places
}
