(function () {
  var models = require('../models')

  console.log('Syncing DB structure')
  models.place_properties.sync({
    force: true
  })

  console.log('Re-indexing Places')
  models.places.findAll({
    attributes: ['id', 'place_category_id', 'properties_blob', 'country_id'],
    order: [['id', 'ASC']]
  }).then((places) => {

    places.forEach((place) => {
      place = place.dataValues

      // console.log(place.check_ins[0].visited)

      const new_place_properties = models.place_properties.build({
        place_id: place.id,
        place_category_id: place.place_category_id,
        place_country_id: place.country_id
      })

      console.log('Re-indexing ID', place.id)

      const properties = ['open_for_business', 'electricity', 'internet', 'kitchen', 'restaurant', 'showers', 'water', 'restroom', 'big_rig_friendly', 'tent_friendly', 'pet_friendly']
      const current_properties = JSON.parse(place.properties_blob)

      properties.forEach(p => new_place_properties[p] = current_properties[p] && !/(_no|unknown)$/g.test(current_properties[p]))

      new_place_properties.save().then((p) => {
        console.log('Indexed new ID', place.id)
      }).catch((e) => {
        if (e.errors && e.errors.length && e.errors[0].type === 'unique violation' && e.errors[0].path === 'place_id') {
          models.place_properties.findOne({ where: { place_id: e.errors[0].value } }).then((place) => {
            place.update(new_place_properties.dataValues)
          })
          console.log('Updated existing ID', place.id)
        } else {
          console.log(e)
        }
      })
    })
  })
}())
