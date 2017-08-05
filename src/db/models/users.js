/* jshint indent: 1 */
var bcrypt = require('bcrypt-nodejs')

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    encrypted_password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    reset_password_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    remember_created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    sign_in_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0'
    },
    current_sign_in_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    last_sign_in_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: undefined
    },
    current_sign_in_ip: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    last_sign_in_ip: {
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
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    offline_maps_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 'f'
    }
  })

  User.tableName = 'users'
  User.prototype.verifyPassword = function verifyPassword (password) {
    return bcrypt.compareSync(password, this.encrypted_password)
  }
  User.associate = (models) => {
    User.belongsToMany(models.roles, {
      through: models.users_roles
    })
  }
  return User
}
