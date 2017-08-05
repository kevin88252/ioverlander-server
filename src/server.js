require('babel-register')({
  extensions: ['.es6', '.es', '.jsx', '.js']
})

// dotenv loads a local ".env" file and adds any variables defined inside to process.env
require('dotenv').config()

// Dependencies
const debug = require('debug')('iOverlander:Server')
const express = require('express')
const helmet = require('helmet')
const flash = require('connect-flash')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const multer = require('multer')
const ReactRouter = require('react-router-dom').StaticRouter
const matchPath = require('react-router-dom').matchPath
const config = require('config')

// Local dependencies
const Html = require('./components/Html').default
const enableApi = require('./api')
const passport = require('./helpers/authenticationStrategy').default
const middlewares = require('./helpers/middleware')
const upload = multer({ dest: 'tmp/' })
const routes = require('./config/routes').default
const makeClientConfig = require('./client_config').default
const createApplicationStore = require('./store/ApplicationStore').default
const setUser = require('./actions/setUser').setUser
const Container = require('./components/Container').default

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
app.use(middlewares.checkRole(routes))

enableApi(app)

// Handle Requests
app.use((req, res, next) => {
  debug('SessionUser exists? ', !!req.user)
  const appStore = createApplicationStore()
  const context = {}
  const actionsToDispatch = []

  console.log(req.user ? req.user.role : 'NOT_LOGGED_IN')

  routes.some(route => {
    const match = matchPath(req.url, Object.assign(
      {},
      { exact: true },
      route
    ))

    if (match && route.action) {
      if (Array.isArray(route.action)) {
        route.action.forEach(action => actionsToDispatch.push([action, match]))
      } else {
        actionsToDispatch.push([route.action, match])
      }
    }
  })

  const waitForRender = actionsToDispatch.length
    ? Promise.all(actionsToDispatch.map(action => {
      return appStore.dispatch(action[0](action[1], req.user))
    })) : Promise.resolve()

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
      jsUrl: config.get('assets.urlPrefix') + 'bundle.js',
      cssUrl: config.get('assets.compileAssets') ? config.get('assets.urlPrefix') + 'style.css' : false,
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
  let greenlock = require('greenlock-express')
  greenlock.create({
    server: 'https://acme-v01.api.letsencrypt.org/directory',
    email: config.get('email.address'),
    agreeTos: true,
    approveDomains: [config.get('domain')],
    app
  }).listen(80, 443)
  debug('Listening on ' + config.get('baseUrl'))
}
