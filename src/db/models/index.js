'use strict'

var fs = require('fs')
var path = require('path')
var Sequelize = require('sequelize')
var env = process.env.NODE_ENV || 'development'
let config = require('config')

let dbConfig = config.get('db')

var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  storage: dbConfig.storage || null,
  define: {
    underscored: true,
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
})

var db = {}

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function (file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

db.closeDB = (db) => {
  db.connectionManager.close().then(() => console.log('closing DB connection'))
}

module.exports = db
