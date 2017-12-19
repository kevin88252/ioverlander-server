// process.env.DEBUG = 'iOverlander:Server,Reduxible:API,*';

const request = require('supertest')
const test = require('tape')

const app = require('../../src/server.js')

/*
  TO DO

  * build and load test database with expected values

  * TESTS TO WRITE:
    * app.post('/api/checkEmail', cache.route(), checkEmailInUse(models))
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
test('GET /api/bad_request', (t) => {
  request(app)
    .get('/api/bad_request')
    .expect('Content-Type', /text\/html/)
    .expect(404)
    .end(function(err, res) {
      t.error(err, 'No error')
      t.end()
    })
})

// Standard for requests like this is WSEN, not NSEW
test('GET /api/locations/:north/:south/:east/:west', (t) => {
  request(app)
    .get('/api/locations/20/-20/10/-20')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.ok(results.length, 'results returned')
      t.ok(results[0].id, 'results have id')
      t.end()
    })
})

test('GET /api/countries', (t) => {
  request(app)
    .get('/api/countries')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
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
      const results = res.body
      t.equal(results.length, 9, '9 regions returned')
      results.forEach((r) => {
        t.ok(r.name, 'region ' + r.name+ ' has name')
        t.ok(r.countries.length, 'region ' + r.name+ ' has countries')
      })
      t.end()
    })
})

test('GET /api/placeTypes', (t) => {
  request(app)
    .get('/api/placeTypes')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.equal(results.length, 21, '21 placeTypes returned')
      results.forEach((r, i) => {
        console.log(r.id)
        t.ok(r.id, 'placeType \'' + r.name + '\' has id')
        t.ok(r.identifier, 'placeType \'' + r.name + '\' has identifier')
        t.ok(r.name, 'placeType \'' + r.name + '\' has name')
        t.ok(r.name_regex, 'placeType \'' + r.name + '\' has name_regex')
        t.ok(r.description, 'placeType \'' + r.name + '\' has description')
        t.ok(r.places_count, 'placeType \'' + r.name + '\' has places_count')
        t.ok(r.sort_order, 'placeType \'' + r.name + '\' has sort_order')
        t.ok(r.created_at, 'placeType \'' + r.name + '\' has created_at')
        t.ok(r.updated_at, 'placeType \'' + r.name + '\' has updated_at')
        t.ok(r.icon, 'placeType \'' + r.name + '\' has icon')
        t.ok(r.gpx_symbol, 'placeType \'' + r.name + '\' has gpx_symbol')
      })
      t.end()
    })
})


test('GET /api/blogs/:id', (t) => {
  request(app)
    .get('/api/blogs/1')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.equal(results.id, '1', '/api/blogs/1 returned blog with id 1')
      t.equal(results.name, 'songoftheroad', 'blog 1 has name')
      t.ok(results.domain, 'returns domain field')
      t.ok(results.created_by_id, 'returns created_by_id field')
      t.ok(results.created_at, 'returns created_at field')
      t.ok(results.updated_at, 'returns updated_at field')
      t.ok(results.check_ins, 'returns check_ins field')
      t.ok(results.countries, 'returns countries field')
      t.ok(results.placeCount, 'returns placeCount field')
      t.ok(results.userName, 'returns userName field')

      if (results.description.length === 0 || results.description) t.pass('returns optional description field')
      else t.fail('returns description field')
      if (results.vehicle === null || results.vehicle) t.pass('returns optional vehicle field')
      else t.fail('returns vehicle field')
      t.end()
    })
})

// !! THESE TESTS ARE COMMENTED OUT BECAUSE THEY HANG THE TESTS RIGHT NOW !!

// // GET api/download/{4 || mexico}/csv is totally broken
// // Unhandled rejection SequelizeDatabaseError: relation "place_properties" does not exist
// test('GET /api/download/:country/:format', (t) => {
//   request(app)
//     .get('/api/download/4/csv')
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//       t.error(err, 'No error')
//       const results = res.body
//       console.log(results)
//       t.end()
//     })
// })

// // GET api/download/{4 || mexico}/0 is totally broken
// // Unhandled rejection SequelizeDatabaseError: relation "place_properties" does not exist
// test('GET /api/search/:country/:page', (t) => {
//   request(app)
//     .get('/api/search/4/0')
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//       t.error(err, 'No error')
//       t.end()
//     })
// })


test('GET /api/blogs/:id/check_ins/:page', (t) => {
  request(app)
    .get('/api/blogs/1/check_ins/1')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      t.equal(results.blogId, 1, '/api/blogs/1/check_ins/1 returned blog with id 1')
      t.equal(results.currentPage, 1, '/api/blogs/1/check_ins/1 returned page 1')

      t.equal(results.blog.id, '1', '/api/blogs/1/check_ins/1 returned blog with id 1')
      t.equal(results.blog.name, 'songoftheroad', 'blog 1 has name')
      t.ok(results.blog.domain, 'returns domain field')
      if (results.blog.description.length === 0 || results.blog.description) t.pass('returns optional description field')
      else t.fail('returns description field')
      t.ok(results.blog.created_at, 'returns created_at field')
      t.ok(results.blog.updated_at, 'returns updated_at field')
      t.ok(results.blog.created_by_id, 'returns created_by_id field')

      t.ok(results.total, 'returns total field')
      t.ok(results.pages, 'returns pages field')
      t.ok(results.results && typeof results === 'object', 'returns results field')
      t.ok(results.results[0], 'returns results field')

      t.end()
    })
})

// not sure what this request is supposed to return --
// it returns the 404 client page -- but with a 200
// wtf?
test('GET /api/staticContent/:page', (t) => {
  request(app)
    .get('/api/staticContent/1')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      t.error(err, 'No error')
      const results = res.body
      console.log(results)
      t.end()
    })
})

test.onFinish((t)=>{
  app.closeDB()
})
