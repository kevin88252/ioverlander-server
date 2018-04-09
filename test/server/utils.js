process.env.NODE_ENV = 'test'
const exec = require('child_process').exec
const pgtools = require('pgtools')
const config = require('config')

const dbconfig = {
  user: config.db.username,
  password: config.db.password,
  port: 5432,
  host: config.db.host,
  db: config.db.database,
  populate: true
}

const sessionconfig = {
  user: config.sessionDb.username,
  password: config.sessionDb.password,
  port: 5432,
  host: config.sessionDb.host,
  db: config.sessionDb.database,
  populate: false
}

function createDB (config, next) {
  // creating database
  pgtools.createdb(config, config.db, (err, res) => {
    if (err && err.name == 'duplicate_database') {
      return dropDB(config, ()=>{
        createDB(config, next)
      })
    } else if (err) {
      next(err)
    }
    console.log('"%s" created', config.db)
    if (config.populate) {
      exec('psql -U ' + config.user + ' -d ' + config.db + ' < dev_light.sql', function(err) {
        if (err) {
          next(err)
          process.exit(-1)
        }
        console.log('"%s" populated', config.db)
        next()
      })
    } else {
      next()
    }
  })
}

function dropDB (config, next) {
  if (!next) next = (err) => { if (err) return console.error(err) }
  pgtools.dropdb(config, config.db, (err, res) => {
    if (err) {
      if (err.name == 'invalid_catalog_name') return next()
      else next(err)
    } else {
      console.log('"%s" dropped', config.db)
      next()
    }
  })
}

module.exports.create = function (next) {
  createDB(dbconfig, (err) => {
    if (err) next(err)
    createDB(sessionconfig, next)
  })
}

module.exports.drop = function (next) {
  dropDB(dbconfig, (err) => {
    if (err) return console.error(err)
    dropDB(sessionconfig, next)
  })
}
