import sequelize from 'sequelize'
import moment from 'moment'
import bcrypt from 'bcrypt-nodejs'
//import { validateForm as validate } from '../components/UserRegistration/UserRegistration'

export default (models) => function (req, res) {
  // TODO: const errors = validate(req.body)

  if (Object.keys(errors).length) {
    res.json({
      errors: errors
    })
    return false
  }

  const new_user = models.users.build({
    email: req.body.user_email,
    encrypted_password: bcrypt.hashSync(req.body.user_password),
    sign_in_count: 0,
    name: req.body.user_name,
    blog_id: null,
    offline_maps_enabled: 'f',
    created_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')
  })

  const new_blog = models.blogs.build({
    name: req.body.blog_name,
    url: req.body.blog_url,
    created_by_id: null,
    created_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')
  })

  const new_user_role = models.users_roles.build({
    user_id: null,
    role_id: 4
  })

  new_blog.save().then((blog) => {
    new_user.blog_id = blog.id
    return new_user.save()
  }).then((user) => {
    new_user_role.user_id = user.id
    return new_user_role.save()
  }).then((role) => {
    res.json({ saved: true, id: role.user_id })
  })
}
