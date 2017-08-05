/* globals history */
import React, { PropTypes } from 'react'
import moment from 'moment'
import NavLink from '../NavLink/NavLink'
import getSlug from 'speakingurl'
import ReactPaginate from 'react-paginate'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { blogCheckInsAction } from '../../actions/blogCheckInsAction'

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

class BlogCheckInList extends React.Component {
  constructor (props) {
    super(props)
    this.goToPage = this.goToPage.bind(this)
  }

  goToPage (e) {
    const pageNum = e.selected + 1
    const URL = `/blogs/${this.props.checkIns.blogId}/check_ins/${pageNum}` + window.location.search
    blogCheckInsAction({
      params: {
        id: this.props.checkIns.blogId,
        page: pageNum
      }
    })
    history.replaceState({ path: URL }, document.title, URL)
  }

  render () {
    const totalPages = this.props.checkIns.pages

    return <main className='content searchResults'>
      <div className='row'>
        <div className='small-12 columns'>
          <h2 style={{ marginBottom: 0, marginTop: 15 }}>Check-ins by {this.props.checkIns.blog.name}</h2>
          <h5 style={{ marginTop: 0, marginBottom: 15 }}>{this.props.checkIns.total} check-ins | Page {this.props.checkIns.currentPage} of {this.props.checkIns.pages}</h5>
        </div>
      </div>

      <div className='row'>
        <div className='small-12-columns'>
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              initalSelected={this.props.checkIns.currentPage}
              containerClassName='searchResults-pagination'
              clickCallback={this.goToPage}
              />
            )
          }
        </div>
      </div>

      <div className='row'>
        <div className='small-12 columns results'>
          {this.props.checkIns.results.map((checkIn, i) => <div key={i}>
            <h5 style={{ margin: '0 0 15px 0' }}><NavLink href={`/places/${getSlug([checkIn.place.id, checkIn.place.name].join(' '))}`}>{checkIn.place.name}</NavLink>, {moment(checkIn.visited.split(' ')[0], 'YYYY-MM-DD').format('Do MMMM YYYY')}</h5>
            <span dangerouslySetInnerHTML={{__html: checkIn.check_in_translations[0].comment
              .replace(/\n/g, '<br>')
              .replace(URL_REGEX, (match) => {
                return `<a href='${match}' target='_blank'>${match}</a>`
              })}} />
          </div>)}
        </div>
      </div>
    </main>
  }
}

BlogCheckInList.propTypes = {
  checkIns: PropTypes.object
}

export default connect((state) => {
  return {
    checkIns: state.checkIns
  }
}, (dispatch) => {
  return bindActionCreators({
    blogCheckInsAction
  }, dispatch)
})(BlogCheckInList)
