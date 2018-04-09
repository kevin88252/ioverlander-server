import bcrypt from 'bcrypt-nodejs'

export default (models) => function (req, res) {
  if (!req.user) {
    res.status(403)
    res.json({
      loggedIn: false
    })
    return
  }

  const account_updates = req.body

  const updateUser = models.users.findOne({
    where: {
      id: req.user.id
    }
  }).then(user => {
    if (!bcrypt.compareSync(account_updates.user_current_password, user.encrypted_password)) {
      return Promise.reject({ errors: { user_current_password: 'Your current password was incorrect' } })
    }

    const new_fields = {
      name: account_updates.user_name,
      email: account_updates.user_email
    }

    if (account_updates.user_password && account_updates.user_password_confirm) {
      new_fields.encrypted_password = bcrypt.hashSync(account_updates.user_password)
    }

    return user.update(new_fields)
  })

  const updateBlog = models.blogs.findOne({
    where: {
      id: req.user.blog_id
    }
  }).then(blog => {
    return blog.update({
      name: account_updates.blog_name,
      url: account_updates.blog_url
    })
  })

  return Promise.all([updateUser, updateBlog]).then(() => {
    res.json({ saved: true })
  }).catch((err) => {
    res.status(400)
    res.json(err)
  })

}
