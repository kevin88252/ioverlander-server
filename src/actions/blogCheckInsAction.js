import asyncApiAction from '../helpers/asyncApiAction'
let config = require('config')

const BLOG_CHECK_INS = 'BLOG_CHECK_INS'

function setBlogCheckIns (data) {
  return {
    type: BLOG_CHECK_INS,
    checkIns: data,
    pageTitle: `Check-ins by ${data.blog.name} | iOverlander`
  }
}

export function blogCheckInsAction (route) {
  return asyncApiAction(`${config.get('apiEndpoint')}/blogs/${route.params.id}/check_ins/${route.params.page}`, setBlogCheckIns, setBlogCheckIns, { err: 'An error occured' }, route)
}
