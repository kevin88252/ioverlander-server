// process.env.DEBUG = 'iOverlander:Server,Reduxible:API,*';

const request = require('supertest')
const test = require('tape')
const _ = require('lodash')

const app = require('../../src/server.js')

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
*/

// note: a bad request does not return
// 404, instead returns a generic iOverlander
// html page
test('POST /api/checkEmail - no email', (t) => {
  request(app)
    .post('/api/checkEmail')
    .send({email: 'nogooddogs@bademail.zz'})
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.equals(results.exists, false)
      t.end()
    })
})

test('POST /api/checkEmail - email exists', (t) => {
  request(app)
    .post('/api/checkEmail')
    .send({ email: 'user@ioverlander.com'})
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.equals(results.exists, true)
      t.end()
    })
})

test.onFinish((t)=>{
  app.closeDB()
})

function testFields(t, expected, results) {
  const fields = Object.keys(results)
  const inExpected = _.difference(expected.sort(), fields.sort())
  const inResults = _.difference(fields.sort(), expected.sort())

  if (inExpected.length) t.fail('fields "' + inExpected + '" are missing in query results')
  else t.pass('all expected fields are present in query results')
  if (inResults.length) t.fail('extra fields "' + inResults + '" are present in query results')
  else t.pass('no extra fields are present in query results')
}
