process.env.NODE_ENV = 'test'
const exec = require('child_process').exec
const pgtools = require('pgtools')
const config = require('config')

const dbconfig = {
  user: config.db.username,
  password: config.db.password,
  port: 5432,
  host: config.db.host
}

const sessionconfig = {
  user: config.sessionDb.username,
  password: config.sessionDb.password,
  port: 5432,
  host: config.sessionDb.host
}

function createDB (next) {
  // creating database
  console.log('creating test database')
  pgtools.createdb(dbconfig, config.db.database, (err, res) => {
    if (err && err.name !== 'duplicate_database') {
      next(err)
      process.exit(-1)
    }
    console.log('test database created')

    exec('psql -U ' + config.db.username + ' -d ' + config.db.database + ' < dev_light.sql', function(err) {
      if (err) {
        next(err)
        process.exit(-1)
      }
      console.log('test database populated')
      next()
    });
  })
}

function createSessionDB (next) {
  // creating database
  console.log('creating test session database')
  pgtools.createdb(sessionconfig, config.sessionDb.database, (err, res) => {
    if (err && err.name !== 'duplicate_database') {
      next(err)
      process.exit(-1)
    }
    console.log('test session database created')
    next()
  })
}

function dropDB (next) {
  pgtools.dropdb(dbconfig, config.db.database, (err, res) => {
    if (err) {
      if (next) next(err)
      else console.error(err)
      process.exit(-1)
    }
    console.log('test database dropped')
    if (next) next()
  })
}


function dropSessionDB (next) {
  pgtools.dropdb(sessionconfig, config.sessionDb.database, (err, res) => {
    if (err) {
      if (next) next(err)
      else console.error(err)
      process.exit(-1)
    }
    console.log('test session database dropped')
    if (next) next()
  })
}

module.exports.createDB = createDB
module.exports.dropDB = dropDB
module.exports.createSessionDB = createSessionDB
module.exports.dropSessionDB = dropSessionDB


