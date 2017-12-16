// process.env.DEBUG = 'iOverlander:Server,Reduxible:API,*';

const request = require('supertest')
const test = require('tape')

const app = require('../../src/server.js')


test('GET /api/countries', (t) => {
  request(app)
    .get('/api/countries')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      // test res.body
      t.error(err, 'No error')
      t.end()
    })
})

test.onFinish((t)=>{
  app.closeDB()
})
