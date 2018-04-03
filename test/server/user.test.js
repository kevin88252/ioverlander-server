process.env.NODE_ENV = "test"

const path = require('path')
const request = require('supertest')
const test = require('tape')
const _ = require('lodash')

const setup = require('./setup.js')
const timeout = 5000

let app;

test('setup', (t) => {
  setup.createDB((err)=>{
    if (err) t.end()
    setup.createSessionDB((err) => {
      if (err) t.end()
      app = require('../../src/server.js')
      t.end()
    })
  })
})


/*
  TO DO

  * build and load test database with expected values

  * TESTS TO WRITE:
    * app.post('/api/check_ins/create', createCheckInAPI(models))
    * app.post('/api/place/update', updatePlaceDetails(models))

    * app.post('/api/user/create', createUser(models))
    * app.post('/api/user/update', updateUser(models))
    * app.post('/api/user/resetPassword', resetPassword(models))
    * app.post('/api/user/updatePassword', updatePassword(models))
    * app.get('/api/user/checkPasswordResetToken', checkPasswordResetToken(models))

    * app.post('/login', middlewares.login())
    * app.get('/logout', middlewares.logout())
    * app.get('/getUserInfo', middlewares.getUserInfo())
*/

test('POST /api/user/create', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/api/user/create')
    .send({
      user_email: 'gauchito_gil@ioverlander.com',
      user_password: 'wtfbro',
      user_name: 'Gauchito Gil'
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.equal(results.saved, true)
      // why is there no id returned??
      t.equal(results.id, null)

      t.end()
    })
})

test('POST /api/user/update - bad password', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/api/user/update')
    .send({
      user_email: 'gauchito_gil@ioverlander.com',
      user_password: '',
      user_name: 'Gauchito Gil'
    })
    .expect('Content-Type', /json/)
    .expect(403)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body

      t.equal(results.loggedIn, false)
      t.end()
    })
})

// currently returns a 302 and redirect to /user/sign_in
// it should return a 4xx client error and a "user not found" message
test('POST /login - user not in db', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/login')
    .send({ username: 'notauser@ioverlander.com', password: 'wtfbro'})
    .expect('Content-Type', /text\/plain/)
    .expect(302)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.end()
    })
})

// currently returns a 302 and redirect to /user/sign_in
// it should return a 4xx client error and a "user with the given username/password combination was not found"
test('POST /login - user in db, bad password', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/login')
    .send({ username: 'user@ioverlander.com', password: 'wtfbro'})
    .expect('Content-Type', /text\/plain/)
    .expect(302)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.end()
    })
})

// currently returns a 302 and redirect to /user/sign_in
// it should return a 4xx client error and a "user with the given username/password combination was not found"
test('POST /login - user in db, bad password', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/login')
    .send({ username: 'user@ioverlander.com', password: 'wtfbro'})
    .expect('Content-Type', /text\/plain/)
    .expect(302)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.end()
    })
})


test.onFinish((t)=>{
  app.closeDB()
  setTimeout(()=>{
    setup.dropDB()
    setup.dropSessionDB()
  }, timeout)
})