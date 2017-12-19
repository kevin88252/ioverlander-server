import builder from 'xmlbuilder'

export default (models) => function (req, res) {
  const countryID = req.params.country
  const format = req.params.format
  const output = []
  const exclude = req.query.exclude ? req.query.exclude.split(',') : []
  const require_amenities = (req.query.amenities || '').split(',').filter(v => v)

  let maxLat = -10000
  let minLat = 0
  let maxLon = -10000
  let minLon = 0

  const where = {
    place_country_id: parseInt(countryID, 10),
    open_for_business: true
  }

  if (exclude.length) {
    where.place_category_id = {
      $notIn: exclude
    }
  }

  require_amenities.forEach((col) => {
    where[col] = true
  })

  models.place_properties.findAll({
    where: where,
    attributes: ['place_id']
  }).then((searchResults) => {
    const place_ids = searchResults.map((result) => result.place_id)

    return models.places.findAll({
      where: {
        id: {
          $in: place_ids
        }
      },
      include: [{
        model: models.locations
      }, {
        model: models.place_translations,
        where: {
          locale: 'en'
        },
        attributes: ['description']
      }, {
        model: models.place_categories,
        attributes: ['gpx_symbol']
      }, {
        model: models.countries,
        attributes: ['name']
      }]
    })
  }).then((rows) => {
    rows.filter(row => row.place_category).forEach((row) => {
      output.push({
        name: row.name,
        description: row.place_translations[0].description,
        latitude: row.location.latitude,
        longitude: row.location.longitude,
        altitude: row.location.altitude,
        url: `http://www.ioverlander.com/places/${row.id}`,
        gpx_icon: row.place_category.gpx_symbol
      })

      maxLon = Math.max(maxLon, parseFloat(row.location.longitude))
      maxLat = Math.max(maxLat, parseFloat(row.location.latitude))

      minLon = Math.min(minLon, parseFloat(row.location.longitude))
      minLat = Math.min(minLat, parseFloat(row.location.latitude))
    })

    switch (format) {
      case 'json':
        res.json(output)
        break
      case 'gpx':
        const xml = builder.create('gpx').att({
          'xmlns': 'http://www.topografix.com/GPX/1/1',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'creator': 'http://iOverlander.com/',
          'version': '1.1',
          'xsi:schemaLocation': 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd'
        })

        const meta = xml.ele('metadata')
        meta.ele('link', { 'href': 'http://www.ioverlander.com' }).ele('text', {}, 'iOverlander')
        meta.ele('time', {}, new Date().toISOString())
        meta.ele('bounds', {
          maxlat: maxLat,
          maxlon: maxLon,
          minlat: minLat,
          minlon: minLon
        })

        output.forEach((place) => {
          const wpt = xml.ele('wpt', {
            lat: place.latitude,
            lon: place.longitude
          })
          if (place.altitude) {
            wpt.ele('ele', place.altitude)
          }
          wpt.ele('name', {}, place.name)
          wpt.ele('desc', {}, place.description)
          wpt.ele('link', {
            href: place.url
          }).ele('text', {}, place.name)
          wpt.ele('sym', {}, place.gpx_icon)
        })

        res.set('Content-Type', 'application/gpx+xml')
        res.end(xml.toString())
        break
      case 'csv':
        let CSV = ''
        Object.keys(output[0]).forEach((key) => {
          CSV = CSV + `${key},`
        })
        CSV = CSV.substr(0, CSV.length - 1) + '\n'
        output.forEach((place) => {
          Object.keys(place).forEach((key) => {
            CSV = CSV + `"${place[key] ? place[key].toString().replace(/"/g, '""') : ''}",`
          })
          CSV = CSV.substr(0, CSV.length - 1) + '\n'
        })
        res.set('Content-Type', 'text/csv; charset=UTF-8')
        res.end(CSV)
    }
  })
}
