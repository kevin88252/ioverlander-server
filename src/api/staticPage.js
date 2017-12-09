import marked from 'marked'
import fs from 'fs'
import pageTitles from '../static_pages/pages.json'

export default () => function (req, res) {
  const fileName = req.params.page.replace(/\/$/g, '').replace(/-/g, '_').toLowerCase() + '.md'
  const pageTitle = Object.keys(pageTitles).filter((title) => pageTitles[title] === fileName)[0]

  fs.readFile(__dirname + '/../static_pages/' + fileName, (err, data) => {
    if (err) {
      res.json({
        html: "Not found",
        title: 'Page not found'
      })
    } else {
      res.json({
        html: marked(data.toString()),
        title: pageTitle
      })
    }
  })
}
