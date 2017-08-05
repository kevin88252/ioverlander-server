import request from 'superagent'

const tidyLatLng = (val) => {
  let split = val.toString().split('.')
  return `${split[0]}.${split[1].substr(0, 6)}`
}

const ROOT_URL = '//s3-us-west-2.amazonaws.com/ioverlander.com/images/jpgfiles'

export default (models) => function (req, res, next) {
  const getOptions = models.property_def_options.findAll({
    order: [['sort_order', 'DESC']]
  })
  const getDefs = models.property_defs.findAll()
  const getCountries = models.countries.findAll({
    attributes: ['name', 'id']
  })

  let CHECK_IN_IMAGES = null

  const getPlaceTypes = models.place_categories.findAll({
    attributes: ['id', 'name'],
    include: [{
      model: models.place_categories_property_defs,
      attributes: ['property_def_id'],
      include: [{
        model: models.property_defs,
        attributes: ['identifier']
      }]
    }]
  })

  const getPlace = models.places.findOne({
    where: { id: req.params.id.split('-')[0] },
    include: [{
      model: models.check_ins,
      include: [{
        model: models.check_in_translations,
        where: { locale: 'en' }
      }, models.blogs]
    }, {
      model: models.locations
    }, {
      model: models.place_categories
    }, {
      model: models.place_translations,
      where: {
        locale: 'en'
      }
    }]
  }).then((data) => {
    return models.users.findAll({
      where: {
        blog_id: { $in: data.check_ins.map(check_in => check_in.blog_id) }
      },
      raw: true
    }).then((users) => {
      data.dataValues.check_ins.forEach(check_in => {
        const user = users.filter(u => u.blog_id === check_in.blog_id)[0]
        const blog = check_in.blog
        check_in.dataValues.by = blog.name || user.name || blog.url || user.email.split('@')[0]
      })
      return data.dataValues
    })
  })

  let getImages = new Promise((resolve, reject) => {
    models.places.findOne({
      where: { id: req.params.id.split('-')[0] },
      include: [{
        model: models.check_ins,
        order: [['visited', 'DESC']]
      }]
    }).then((data) => {
      models.images.findAll({
        where: {
          imageable_type: {
            $in: ['CheckIn', 'CheckIn|BETA']
          },
          imageable_id: {
            $in: data.dataValues.check_ins.map(checkIn => checkIn.dataValues.id)
          }
        }
      }).then((images) => {
        const checkInImages = []

        images.forEach((img) => {
          let id = img.id.toString()
          while (id.length < 9) { id = '0' + id }
          const URL = [id.slice(0, 3), id.slice(3, 6), id.slice(6, 9)].join('/')

          if (img.imageable_type.split('|')[1] === 'BETA') {
            checkInImages.push({
              small: [ROOT_URL, URL, 'image-small.jpg'].join('/'),
              medium: [ROOT_URL, URL, 'image-medium.jpg'].join('/'),
              large: [ROOT_URL, URL, 'image-large.jpg'].join('/')
            })
          } else if (img.jpgfile_file_name) {
            const file_name = img.jpgfile_file_name.replace('JPG', 'jpg')
            checkInImages.push({
              tiny: [ROOT_URL, URL, 'tiny', file_name].join('/'),
              small: [ROOT_URL, URL, 'small', file_name].join('/'),
              medium: [ROOT_URL, URL, 'medium', file_name].join('/'),
              large: [ROOT_URL, URL, 'large', file_name].join('/')
            })
          }
        })
        CHECK_IN_IMAGES = checkInImages
        resolve()
      })
    })
  })

  Promise.all([getPlace, getOptions, getDefs, getImages, getPlaceTypes, getCountries]).then((queries) => {
    const data = queries[0]
    const check_ins = data.check_ins
    const category = data.place_category.dataValues
    const location = data.location.dataValues
    const propertyTypes = queries[2]
    const propertyValues = queries[1]
    const placeTypes = queries[4]
    const countries = queries[5]
    const propertyTypeMap = {}
    const amenities = {}
    const countryIds = {}

    propertyTypes.filter((type) => type.dataValues.is_amenity).forEach((type) => {
      if (!propertyTypeMap[type.dataValues.identifier]) {
        propertyTypeMap[type.dataValues.identifier] = {
          'description': type.dataValues.description,
          'amenities': {
            'I\'m not sure': 'unknown'
          }
        }
      }

      if (type.dataValues.name === 'Big Rig Friendly') {
        propertyTypeMap[type.dataValues.identifier].amenities['Yes'] = 'big_rig_yes'
        propertyTypeMap[type.dataValues.identifier].amenities['No'] = 'big_rig_no'
      }

      propertyValues.filter((value) => {
        return new RegExp(type.dataValues.name_regex, 'g').test(value.dataValues.identifier)
      }).forEach((val) => {
        propertyTypeMap[type.dataValues.identifier].amenities[val.dataValues.name] = val.dataValues.identifier
      })
    })

    countries.forEach((c) => {
      countryIds[c.dataValues.id] = c.dataValues.name
    })

    const checkIns = check_ins.sort((a, b) => {
      return a.dataValues.visited < b.dataValues.visited
    }).map((checkIn) => {
      const checkInValues = checkIn.dataValues
      return {
        by: checkInValues.by,
        blog_id: checkInValues.blog_id,
        visited: checkInValues.visited,
        comment: checkInValues.check_in_translations[0].dataValues.comment
      }
    })

    // Parse BLOB fields into JSON Objects
    Object.keys(data).forEach((key) => {
      if (data[key] instanceof Buffer) {
        data[key] = JSON.parse(data[key].toString())
      }
    })

    // Map all the properties into yes/no and titles
    Object.keys(data.properties_blob).forEach((key) => {
      const key_text = propertyTypes.filter((obj) => obj.identifier === key)[0].name
      const val_text = propertyValues.filter((obj) => obj.identifier === data.properties_blob[key])
      amenities[key_text] = val_text.length ? val_text[0].name : null
    })

    const responseData = {
      id: data.id,
      name: data.name,
      place_type: category.name,
      place_type_icon: category.icon,
      place_type_id: category.id,
      blog_id: data.blog_id,
      attributes: amenities,
      country: data.country_id,
      location: {
        lat: tidyLatLng(location.latitude),
        lng: tidyLatLng(location.longitude),
        altitude: location.altitude,
        id: location.id
      },
      description: data.place_translations[0].dataValues.description,
      author: data.blog_id,
      date_verified: data.date_verified,
      check_ins: checkIns,
      images: CHECK_IN_IMAGES,
      placeTypes: {},
      propertyTypes: propertyTypeMap,
      countries: countryIds
    }

    // Place Types
    placeTypes.forEach((type) => {
      responseData.placeTypes[type.id] = {
        name: type.name,
        attributes: type.place_categories_property_defs
      }
    })

    request
      .get(`http://nominatim.openstreetmap.org/search/${responseData.location.lat},${responseData.location.lng}?format=jsonv2&addressdetails=1`)
      .timeout(1000)
      .end((err, response) => {
        if (err) {
          responseData.nearTo = 'lots of wonderful places'
          res.json(responseData)
          return false
        } else {
          const nearTo = response.body[0].address.city || response.body[0].address.town || response.body[0].address.village

          if (nearTo) { responseData.nearTo = nearTo }
          res.json(responseData)
        }
      })
  }).catch((e) => { console.log(e, e.stack); res.status(500); res.json({ err: 'Place not found' }) })
}
