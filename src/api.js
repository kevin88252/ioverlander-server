'use strict'

const debugLib = require('debug')
const cache = process.env.NODE_ENV === 'production' ? require('express-redis-cache')({
  expire: 60 * 60,
  host: 'localhost'
}) : { route: function () { return function (req, res, next) { next() } } }

const countriesApiEndpoint = require('./api/countries').default
const locationsApiEndpoint = require('./api/locations').default
const placeApiEndpoint = require('./api/place').default
const regionsApiEndpoint = require('./api/regions').default
const blogsApiEndpoint = require('./api/blogs').default
const downloadCountryAPI = require('./api/downloadCountryData').default
const searchAPI = require('./api/search').default
const blogCheckInsAPI = require('./api/blogCheckIns').default
const staticContentAPI = require('./api/staticPage').default
const createCheckInAPI = require('./api/createCheckIn').default
const updatePlaceDetails = require('./api/updatePlace').default
const checkEmailInUse = require('./api/checkEmail').default
const createUser = require('./api/createUser').default
const resetPassword = require('./api/sendPasswordReset').default
const checkPasswordResetToken = require('./api/checkResetToken').default
const updatePassword = require('./api/updatePassword').default
const updateUser = require('./api/updateUser').default
const placeTypesApiEndpoint = require('./api/placeTypes').default

const debug = debugLib('Reduxible:API')

module.exports = (app, models) => {
  debug('Loading API Routes into server')
  app.get('/api/place/:id', cache.route(), placeApiEndpoint(models))
  app.get('/api/locations/:north/:south/:east/:west', cache.route(), locationsApiEndpoint(models))
  app.get('/api/countries', cache.route(), countriesApiEndpoint(models))
  app.get('/api/regions', cache.route(), regionsApiEndpoint(models))
  app.get('/api/placeTypes', cache.route(), placeTypesApiEndpoint(models))
  app.get('/api/blogs/:id', cache.route(), blogsApiEndpoint(models))
  app.get('/api/download/:country/:format', cache.route(), downloadCountryAPI(models))
  app.get('/api/search/:country/:page', cache.route(), searchAPI(models))
  app.get('/api/blogs/:id/check_ins/:page', cache.route(), blogCheckInsAPI(models))
  app.get('/api/staticContent/:page', cache.route(), staticContentAPI())

  app.post('/api/checkEmail', cache.route(), checkEmailInUse(models))
  app.post('/api/check_ins/create', createCheckInAPI(models))
  app.post('/api/place/update', updatePlaceDetails(models))

  app.post('/api/user/create', createUser(models))
  app.post('/api/user/update', updateUser(models))
  app.post('/api/user/resetPassword', resetPassword(models))
  app.post('/api/user/updatePassword', updatePassword(models))
  app.get('/api/user/checkPasswordResetToken', checkPasswordResetToken(models))
}
