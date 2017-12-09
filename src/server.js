// dotenv loads a local ".env" file and adds any variables defined inside to process.env
require('dotenv').config()

require('babel-register')({
  plugins: [
    [
      "babel-plugin-transform-require-ignore",
      {
        "extensions": [".scss", ".sass", ".css"]
      }
    ],
  ],
  extensions: ['.es6', '.es', '.jsx', '.js']
})

// Dependencies
const debug = require('debug')('iOverlander:Server')
const express = require('express')
const helmet = require('helmet')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const multer = require('multer')
const config = require('config')

// Local dependencies
const setupApi = require('./api')
const passport = require('./helpers/authenticationStrategy').default
const middlewares = require('./helpers/middleware')
const upload = multer({ dest: 'tmp/' })
//const routes = require('./config/routes').default
const makeClientConfig = require('./client_config').default
const setUser = require('./actions/setUser').setUser

debug('Server booting')
const app = express()

debug('Starting server')

// Middleware
// Security
app.use(helmet())

// Content Security Policy (CSP)
const inlineScriptNonce = Math.random().toString(36).substring(7)
if (process.env.NODE_ENV === 'production') {
  app.use(middlewares.contentSecurityPolicy(inlineScriptNonce))
}

// Gzip
app.use(compression())

// Cookies
app.use(cookieParser())

// Bodyparser for URLencoded forms
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Bodyparser for JSON uploads
app.use(bodyParser.json({ limit: '50mb' }))

// Sessions (in the DB)
app.use(middlewares.sessions())

// Authentication with passport
app.use(passport.initialize())
app.use(passport.session())

// Flash messages
app.use(flash())

// Template stuff
app.set('view engine', 'ejs');

// Healthcheck
app.get('/private/health', middlewares.healthCheck())

// CORS
app.use(middlewares.cors())

// Login/Logout
app.post('/login', middlewares.login())
app.get('/logout', middlewares.logout())

// Get logged in user
app.get('/getUserInfo', middlewares.getUserInfo())

// Upload of photos
app.post('/photos/upload', upload.array('photos', 5), middlewares.uploadUserImages())

// Required roles
// TODO: ROUTES
// app.use(middlewares.checkRole(routes))

setupApi(app)

// Handle Requests
app.use((req, res, next) => {
  let jsUrl = config.get('assets.urlPrefix')+'bundle'
  if (config.get('assets.fileHash')) {
    jsUrl +='.'+config.get('assets.fileHash')
  }
  jsUrl += '.js'

  let cssUrl = null
  if (config.get('assets.compileAssets')) {
    cssUrl = config.get('assets.urlPrefix')+'style'
    if (config.get('assets.fileHash')) {
      cssUrl +='.'+config.get('assets.fileHash')
    }
    cssUrl += '.css'
  } 
  res.render('index', {
      clientConfig: JSON.stringify(makeClientConfig()),
      jsUrl: jsUrl,
      cssUrl: cssUrl,
  })
})

// Start Server
app.listen(3000)
debug('Listening on port 3000')

