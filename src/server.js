require('babel-register')({
  extensions: ['.es6', '.es', '.jsx', '.js']
})

// dotenv loads a local ".env" file and adds any variables defined inside to process.env
require('dotenv').config()

if (process.env.NODE_ENV === 'production') {
  require('pmx').init()
}

var debug = require('debug')('iOverlander:Server')

var express = require('express')
var helmet = require('helmet')
var csp = require('helmet-csp')
var flash = require('connect-flash')
var React = require('react')
var ReactDOMServer = require('react-dom/server')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var Html = require('./components/Html').default
var enableApi = require('./api')
var passport = require('./helpers/authenticationStrategy').default
var Sequelize = require('sequelize')
var compression = require('compression')
var multer = require('multer')
var upload = multer({ dest: 'tmp/' })
var SequelizeStore = require('connect-session-sequelize')(session.Store)
var createUploadClient = require('./helpers/awsClient').default

var ReactRouter = require('react-router-dom').StaticRouter
var matchPath = require('react-router-dom').matchPath
var routes = require('./config/routes').default

var config = require('config')
var sessionDB = new Sequelize(config.get('sessionDb.database'), config.get('sessionDb.username'), config.get('sessionDb.password'),config.get('sessionDb'))

var makeClientConfig = require('./client_config').default

// Create session DB
sessionDB.sync()

debug('Server booting')

var createApplicationStore = require('./store/ApplicationStore').default
var setUser = require('./actions/setUser').setUser
var Container = require('./components/Container').default

const app = express()

debug('Starting server')

// Middleware
app.use(helmet())

const inlineScriptNonce = Math.random().toString(36).substring(7)
if (process.env.NODE_ENV === 'production') {
  app.use(csp(
    {
      directives: {
        scriptSrc: ["'self'", config.get('assets.host'), 'open.mapquestapi.com', `'nonce-${inlineScriptNonce}'`],
        styleSrc: ["'self'", config.get('assets.host'), 'fonts.googleapis.com', 'cdnjs.cloudflare.com', "'unsafe-inline'"],
        imgSrc: ["'self'", config.get('assets.host'),  '*.ioverlander.com', 'data:', '*.tile.openstreetmap.org', 'cdnjs.cloudflare.com', '*.tiles.mapbox.com', '*.mqcdn.com', '*.mapquestapi.com', 's3-us-west-2.amazonaws.com'],
        fontSrc: ["'self'", config.get('assets.host'), 'fonts.gstatic.com'],
        objectSrc: ["'none'"]
      }
    }
  ))
}

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.get('sessionSettings.secret'),
  store: new SequelizeStore({ db: sessionDB }),
  cookie: {
    secure: config.get('sessionSettings.secure'),
    domain: config.get('domain')
  }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Healthcheck
app.get('/private/health', (req, res) => {
  res.json({ UP: true })
})

// CORS
app.use(function (req, res, next) {
  if (req.hostname.indexOf('ioverlander') > -1 || req.hostname === 'localhost') {
    res.set('Access-Control-Allow-Origin', '*')
  }
  next()
})

// Login is special
// TODO: Make this middleware
app.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (info && info.message) { req.flash('error', info.message) }
    if (err) { return next(err) }
    if (!user) { return res.redirect('/users/sign_in') }
    req.logIn(user, function (err) {
      if (err) { return next(err) }
      req.session.save(() => {
        return res.redirect(req.session.targetUrl || '/blogs/' + user.blog_id)
      })
    })
  })(req, res, next)
})

// Logout is also special
// TODO: Make this middleware
app.get('/logout', function (req, res) {
  req.logout()
  req.session.destroy()
  res.set('Set-cookie', 'connect.sid=DEL;expires=Sun, 15 Jul 2012 00:00:01 GMT')
  res.redirect('/')
})

app.get('/getUserInfo', function (req, res, next) {
  res.json(req.user)
})

var models = require('./db/models')
var moment = require('moment')

// TODO: Make this middleware
app.post('/photos/upload', upload.array('photos', 5), (req, res, next) => {
  const images = []

  req.files.forEach((file, index) => {
    models.images.build({
      source_url: null,
      guid: null,
      blog_id: req.user.blog_id,
      imageable_id: req.body.check_in_id,
      imageable_type: 'CheckIn|BETA',
      pgfile_fingerprint: null,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      jpgfile_file_name: file.originalname,
      jpgfile_content_type: file.mimetype,
      jpgfile_file_size: file.size,
      jpgfile_updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      jpgfile_processing: false
    }).save().then((image) => {
      const client = createUploadClient(image.id)

      client.upload(`tmp/${file.filename}`, {}, function (err, versions, meta) {
        if (err) { throw err }
        versions.forEach(function (image) {
          if (image.url.indexOf('small') > -1) {
            images.push(image.url)
          }
        })

        if (index === (req.files.length - 1)) {
          res.status(200)
          res.json({
            previews: images
          })
        }
      })
    })
  })
})

enableApi(app)

// Handle Requests
app.use((req, res, next) => {
  debug('SessionUser exists? ', !!req.user)
  const appStore = createApplicationStore()
  const context = {}
  const actionsToDispatch = []

  routes.some(route => {
    const match = matchPath(req.url, route)

    if (match && route.action) {
      actionsToDispatch.push([route.action, match])
    }
  })

  console.log('ACTIONS', actionsToDispatch)
  const waitForRender = actionsToDispatch.length ?
    appStore.dispatch(actionsToDispatch[0][0](actionsToDispatch[0][1])) : Promise.resolve()

  waitForRender.then(() => {
    appStore.dispatch(setUser(req.user))
    appStore.dispatch({
      type: 'SET_FLASH',
      flashMessage: req.flash('error')
    })

    const routeComponent = React.createElement(ReactRouter, {
      location: req.url,
      context: context,
      children: React.createElement(Container, {
        store: appStore
      })
    })

    const routeHandler = React.createElement(Html, {
      html: ReactDOMServer.renderToString(routeComponent),
      clientConfig: makeClientConfig(),
      jsUrl: config.get('assets.urlPrefix')+'bundle.js',
      cssUrl: config.get('assets.compileAssets') ? config.get('assets.urlPrefix')+'style.css' : false,
      // title: route.title,
      appplicationState: 'window.app=' + JSON.stringify(appStore.getState()),
      store: appStore,
      nonce: inlineScriptNonce
    })

    const renderedComponent = ReactDOMServer.renderToString(routeHandler)

    res.set('Content-Type', 'text/html')
    res.end('<!DOCTYPE html>' + renderedComponent)
    debug('Response sent')
  }).catch((e) => {
    next(e)
  })
})

// Start Server
debug('Setting port')

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000)
  debug('Listening on port 3000')
} else {
// TODO: Refactor letsencrypt
  let greenlock = require('greenlock-express');
  greenlock.create({
    server: 'https://acme-v01.api.letsencrypt.org/directory',
    email: config.get('email.address'),
    agreeTos: true,
    approveDomains: [ config.get('domain')],
    app
  }).listen(80, 443)
  debug('Listening on '+config.get('baseUrl'))
}
