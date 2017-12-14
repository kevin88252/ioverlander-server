// process.env.DEBUG = 'iOverlander:Server,Reduxible:API,*';

const request = require('supertest')
const test = require('tape')

const app = require('../../src/server.js');

test('GET /api/place_properties', (t) => {
  request(app)
    .get('/api/place_properties')
    .expect('Content-Type', /text\/html/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error');
      t.end()
    });
});

test.onFinish((t)=>{
  app.closeDB()
})
