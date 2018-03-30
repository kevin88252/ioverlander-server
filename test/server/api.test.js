// process.env.DEBUG = 'iOverlander:Server,Reduxible:API,*';

const request = require('supertest')
const test = require('tape')
const _ = require('lodash')

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
        t.ok(r.name, 'region ' + r.name + ' has name')
        t.ok(r.countries.length, 'region ' + r.name + ' has countries')
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
        const expectedFields = [
          'id',
          'identifier',
          'name',
          'name_regex',
          'description',
          'places_count',
          'sort_order',
          'created_at',
          'updated_at',
          'icon',
          'gpx_symbol'
        ]
        console.log('##', r.name)
        testFields(t, expectedFields, r)
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
      const expectedFields = [
        'id',
        'name',
        'domain',
        'description',
        'created_by_id',
        'countries',
        'created_at',
        'updated_at',
        'placeCount',
        'userName',
        'vehicle',
        'check_ins',
        'profile_image_id',
        'url'
      ]

      testFields(t, expectedFields, results)
      t.end()
    })
})

// // !! THESE TESTS ARE COMMENTED OUT BECAUSE THEY HANG THE TESTS RIGHT NOW !!

// // // GET api/download/{4 || mexico}/csv is totally broken
// // // Unhandled rejection SequelizeDatabaseError: relation "place_properties" does not exist
// // test('GET /api/download/:country/:format', (t) => {
// //   request(app)
// //     .get('/api/download/4/csv')
// //     .expect('Content-Type', /csv/)
// //     .expect(200)
// //     .end(function(err, res) {
// //       t.error(err, 'No error')
// //       const results = res.body
// //       console.log(results)
// //       t.end()
// //     })
// // })

// // // GET api/download/{4 || mexico}/0 is totally broken
// // // Unhandled rejection SequelizeDatabaseError: relation "place_properties" does not exist
// // test('GET /api/search/:country/:page', (t) => {
// //   request(app)
// //     .get('/api/search/4/0')
// //     .expect('Content-Type', /json/)
// //     .expect(200)
// //     .end(function(err, res) {
// //       t.error(err, 'No error')
// //       t.end()
// //     })
// // })


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

      let expectedFields = [
        'blog',
        'blogId',
        'currentPage',
        'pages',
        'results',
        'total'
      ]
      testFields(t, expectedFields, results)

      console.log('## results.blog')
      expectedFields = [
        'id',
        'name',
        'domain',
        'description',
        'created_at',
        'created_by_id',
        'updated_at',
        'profile_image_id',
        'url'
      ]
      testFields(t, expectedFields, results.blog)

      console.log('## results.results[0]')
      expectedFields = [
        'check_in_translations',
        'place',
        'place_id',
        'rating',
        'visited'
      ]

      testFields(t, expectedFields, results.results[0])
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

function testFields(t, expected, results) {
  const fields = Object.keys(results)
  const inExpected = _.difference(expected.sort(), fields.sort())
  const inResults = _.difference(fields.sort(), expected.sort())

  if (inExpected.length) t.fail('fields "' + inExpected + '" are missing in query results')
  else t.pass('all expected fields are present in query results')
  if (inResults.length) t.fail('extra fields "' + inResults + '" are present in query results')
  else t.pass('no extra fields are present in query results')
}
