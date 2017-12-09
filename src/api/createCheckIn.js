import sequelize from 'sequelize'
import moment from 'moment'
// import { validate } from '../components/CheckIn/Forms/CheckInDetails'

export default (models) => function (req, res) {
  if (!req.user) {
    res.status(403)
    res.json({
      loggedIn: false
    })
    return
  }

  // TODO: validate server side
  //const errors = validate(req.body)

  if (Object.keys(errors).length) {
    res.json({
      errors: errors
    })
  } else {
    const check_in = models.check_ins.build({
      blog_id: req.user.blog_id,
      place_id: parseInt(req.body.place, 10),
      location_id: parseInt(req.body.location, 10),
      rating: req.body.rating,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      visited: moment(req.body.visited).format('YYYY-MM-DD HH:mm:ss.SSSSSS')
    })

    check_in.save().then((record) => {
      models.check_in_translations.build({
        check_in_id: record.dataValues.id,
        locale: 'en',
        created_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        comment: req.body.comment
      }).save().then((checkIn) => {
        res.json({
          saved: true,
          id: checkIn.check_in_id
        })
      })
    }).catch((e) => {
      res.json({
        saved: false,
        err: e
      })
    })
  }
}
