// process.env.DEBUG = 'iOverlander:Server,Reduxible:API,*';

const request = require('supertest')
const test = require('tape')

const app = require('../../src/server.js')

/*
  TO DO

  * build and load test database with expected values
  * 

*/

test('GET /api/countries', (t) => {
  request(app)
    .get('/api/countries')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      var results = res.body;
      t.equal(Object.keys(results).length, 214, '214 countries in the test database')
      // why is `count` a string??
      t.equal(results.Mexico.count, '172', 'Mexico has count')
      t.equal(typeof results.Mexico.latitude, 'number', 'Mexico has latitude')
      t.equal(typeof results.Mexico.longitude, 'number', 'Mexico has longitude')
      t.end()
    })
})

test('GET /api/regions', (t) => {
  request(app)
    .get('/api/regions')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      var results = res.body;
      t.equal(results.length, 9, '9 regions returned')
      results.forEach((r) => {
        t.ok(r.name, 'region ' + r.name+ ' has name')
        t.ok(r.countries.length, 'region ' + r.name+ ' has countries')
      })
      t.end()
    })
})

test.onFinish((t)=>{
  app.closeDB()
})
