const path = require('path')

module.exports = {
  // Add dev speoific settings here
  assets: {
      compileAssets: false,
      outputPath: path.resolve(__dirname, '../build/'),
      host: 'localhost:8080',
      urlPrefix: 'http://localhost:8080/'
  },

  db: {
    username:"ioverlander",
    password:"password",
    database: "ioverlander_production",
    host: "localhost",
  },
  sessionDb: {
    username:"ioverlander",
    password:"password",
    host: "localhost",
    database: "ioverlander_node_sessions",
  },
  sessionSettings: {
    secret: 'insecure-session-secret',
  }
}
