import React, { PropTypes } from 'react'
import initializeMap from '../../helpers/initialiseMap'
import NavLink from '../NavLink/NavLink'
import Lightbox from '../Lightbox/Lightbox'
import getSlug from 'speakingurl'
import constructStaticAssetUrl from '../../helpers/staticAssetUrl'
import { connect } from 'react-redux'

let L

if (global.window) {
  L = require('leaflet')
}

if (process.env.BROWSER) {
  require('./blogDetails.scss')
}

class BlogDetails extends React.Component {

  constructor (props) {
    super(props)
    this.addMarkersToMap = this.addMarkersToMap.bind(this)
    this.openVehicleLightbox = this.openVehicleLightbox.bind(this)
  }

  addMarkersToMap () {
    const latLngs = this.props.selectedBlog.check_ins.map((check_in) => {
      if (check_in.location.latitude !== -90 && check_in.location.longitude !== 0) {
        return [check_in.location.latitude, check_in.location.longitude]
      }
    }).filter(l => l)

    if (latLngs.length) {
      const polyline = L.polyline(latLngs, {
        color: 'red',
        opacity: 1,
        weight: 2.5
      }).addTo(this.map)
      this.map.fitBounds(polyline.getBounds())
    }
  }

  componentDidMount () {
    this.map = initializeMap(this.refs.map)
    this.addMarkersToMap()
  }

  openVehicleLightbox (e) {
    e.preventDefault()
    this.refs.vehicle.open()
  }

  render () {
    const countries = this.props.selectedBlog.countries
    const truncateCountries = countries.length > 4
    const checkIns = this.props.selectedBlog.check_ins
    let countriesText

    if (truncateCountries) {
      countriesText = `${checkIns.length} check-ins across ${countries.slice(0, 4).join(', ')} and ${countries.length - 4} other countr${countries.length - 4 === 1 ? 'y' : 'ies'}`
    } else if (countries.length > 1) {
      countriesText = `${checkIns.length} check-ins across ${countries.slice(0, 3).join(', ')} and ${countries[countries.length - 1]}`
    } else if (countries.length === 1) {
      countriesText = `${checkIns.length} check-in${checkIns.length > 1 ? 's' : ''} in ${countries[0]}`
    } else if (!countries.length) {
      countriesText = `No check-ins (yet!)`
    }

    return <main className='content blogDetails is-flex'>
      <div><div className='row'>
        <header className='small-12 columns'>
          <img src={constructStaticAssetUrl('icons/other.png')} />
          <h2 className='h3'>{this.props.selectedBlog.userName}</h2>
          <h3 className='h5'>{countriesText}</h3>
        </header>
        <div className='small-12 columns'>
          <div className='blogDetails-action-btns'>
            {this.props.selectedBlog.url && <a href={this.props.selectedBlog.url} target='_blank' className='btn btn-primary'>Visit Website</a>}
            {checkIns.length > 0 && <NavLink href={`/blogs/${getSlug([this.props.selectedBlog.id, this.props.selectedBlog.name].join(' '))}/check_ins/1`} className='btn btn-primary'>View Check-Ins ({checkIns.length.toString()})</NavLink>}
            {this.props.selectedBlog.vehicle && <button onClick={this.openVehicleLightbox} className='btn btn-primary'>View Garage</button>}
            <button disabled className='btn btn-primary'>View Places Contributed ({this.props.selectedBlog.placeCount})</button>
          </div>
        </div>
      </div></div>
      <div className='blogDetails-map' ref='map' />
      {this.props.selectedBlog.vehicle && <Lightbox ref='vehicle' small={true}>
        <h3 style={{
          margin: '20px 0',
          textAlign: 'center'
        }}>{this.props.selectedBlog.vehicle.description} - "{this.props.selectedBlog.vehicle.name}"</h3>
      </Lightbox>}
    </main>
  }

}

BlogDetails.contextTypes = {
  dispatch: PropTypes.func
}

BlogDetails.propTypes = {
  selectedBlog: PropTypes.object
}

export default connect((state) => {
  return {
    selectedBlog: state.selectedBlog
  }
})(BlogDetails)
