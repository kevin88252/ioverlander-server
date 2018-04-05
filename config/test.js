const path = require('path')

module.exports = {
  // Add dev speoific settings here
  publicApiEndpoint: "http://localhost:3000/api",
  assets: {
      compileAssets: false,
      outputPath: path.resolve(__dirname, '../build/'),
      host: 'localhost:8080',
      urlPrefix: 'http://localhost:8080/'
  },
  db: {
    username:"ioverlander",
    password:"password",
    database: "ioverlander-test",
    host: "localhost",
    pool: {
      max: 0,
      min: 0,
      idle: 0
    }
  },
  sessionDb: {
    username:"ioverlander",
    password:"password",
    host: "localhost",
    database: "ioverlander_node_sessions-test",
    pool: {
      max: 0,
      min: 0,
      idle: 0
    }
  },
  sessionSettings: {
    secret: 'insecure-session-secret',
  }
}
