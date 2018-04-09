/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {

  const Userstest = sequelize.define('users_test', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true
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
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
  })
  return Userstest
}
