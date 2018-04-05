process.env.NODE_ENV = "test"

const path = require('path')
const request = require('supertest')
const test = require('tape')

const setup = require('./setup.js')
const timeout = 5000

let app;

test('setup', (t) => {
  setup.create((err)=>{
    if (err) {
      console.error(err)
      t.end()
    }
    app = require('../../src/server.js')
    t.end()
  })
})

/*

  * TESTS TO WRITE:
    * app.post('/api/user/update', updateUser(models))
    * app.post('/api/user/resetPassword', resetPassword(models))
    * app.post('/api/user/updatePassword', updatePassword(models))
    * app.get('/api/user/checkPasswordResetToken', checkPasswordResetToken(models))

    * app.post('/login', middlewares.login())
    * app.get('/logout', middlewares.logout())
    * app.get('/getUserInfo', middlewares.getUserInfo())
*/

test('POST /api/user/create - no blog', (t) => {
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
      // !! why is there no id returned?? this is bad.
      t.ok(results.id)

      t.end()
    })
})

test('POST /api/user/create - with blog', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/api/user/create')
    .send({
      user_email: 'deolinda_correa@ioverlander.com',
      user_password: 'waterplz',
      user_name: 'Deolinda Correa',
      blog_name: 'DeolindaWalks',
      blog_url: 'dw.ioverlander.com'
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      console.log(results)
      t.equal(results.saved, true)
      // !! why is there no id returned?? this is bad.
      t.ok(results.id)

      t.end()
    })
})

// currently returns a 302 and redirect to /user/sign_in
// it should return a 4xx client error and a "user not found" message
test('POST /login - user not in db', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/login')
    .send({
      username: 'notauser@ioverlander.com',
      password: 'wtfbro'
    })
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
    .send({
      username: 'user@ioverlander.com',
      password: 'wtfbro'
    })
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
    .send({
      username: 'user@ioverlander.com',
      password: 'wtfbro'
    })
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
test('POST /login - user in db, good password', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/login')
    .send({
      username: 'gauchito_gil@ioverlander.com',
      password: 'wtfbro'
    })
    .expect('Content-Type', /text\/html/)
    .expect(302)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.end()
    })
})

test('POST /api/user/update - no session', (t) => {
  t.timeoutAfter(timeout)

  request(app)
    .post('/api/user/update')
    .send({
      user_email: 'gauchito_gil@ioverlander.com',
      user_password: 'wtfbro',
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

test('teardown', (t) => {
  // allow connection pool to drain
  setTimeout(() => {
    setup.drop(t.end)
  }, timeout)
})

test.onFinish(()=>{
  // allow connection pool to drain
  setTimeout(() => {
    app.closeDB()
  }, timeout)
})