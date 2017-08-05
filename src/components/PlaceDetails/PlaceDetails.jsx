import React, { PropTypes } from 'react'
import moment from 'moment'
import initializeMap from '../../helpers/initialiseMap'
import Lightbox from '../Lightbox/Lightbox'
import NavLink from '../NavLink/NavLink'
import getSlug from 'speakingurl'
import ImageGallery from 'react-image-gallery'
import ErrorHandler from '../ErrorHandler/ErrorHandler'
import constructStaticAssetUrl from '../../helpers/staticAssetUrl'

import { connect } from 'react-redux'

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

let L

if (process.env.BROWSER) {
  require('./placeDetails.scss')
}

if (global.window) {
  L = require('leaflet')
}

class PlaceDetails extends React.Component {

  constructor (props) {
    super(props)
    this.addMarker = this.addMarker.bind(this)
    this.createMap = this.createMap.bind(this)
    this.openReadMore = this.openReadMore.bind(this)
    this.onImageError = this.onImageError.bind(this)

    this.state = {
      excludeImageIndexes: []
    }
  }

  addMarker () {
    const place = this.props.selectedPlace
    new L.Marker([place.location.lat, place.location.lng], {
      icon: new L.Icon({
        iconUrl: constructStaticAssetUrl('icons/' + place.place_type_icon + '-pin.png'),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
      })
    }).addTo(this.map)
  }

  createMap () {
    const place = this.props.selectedPlace
    this.map = initializeMap(this.refs.map, [place.location.lat, place.location.lng], 14)
  }

  openReadMore (e) {
    e.preventDefault()

    this.refs[e.target.getAttribute('data-key')].open()
  }

  componentDidMount () {
    if (!this.props.selectedPlace.err) {
      this.createMap()
      this.addMarker()
    } else {
      document.title = 'Place not found - iOverlander'
    }
  }

  onImageError (e) {
    if (e.target.src.includes('large')) {
      e.target.src = e.target.src.replace('large', 'medium')
    }
  }

  render () {
    if (this.props.selectedPlace.err) {
      return <main className='content placeDetails is-flex'>
        <div className='row'>
          <div className='small-12 columns'>
            <h4>We can't find the place you're looking for :(</h4>
              <a style={{ display: 'block', margin: 'auto', textAlign: 'center' }} href='/'>Back to the homepage?</a>
          </div>
        </div>
      </main>
    }

    const attributeElements = []
    const place = this.props.selectedPlace
    const firstCheckIn = place.check_ins[place.check_ins.length - 1]
    const description = this.props.selectedPlace.description
      .replace(/\n/g, '<br><br>')
      .replace(URL_REGEX, (match) => {
        return `<a href='${match}' target='_blank'>${match}</a>`
      })

    const images = this.props.selectedPlace.images ? this.props.selectedPlace.images.filter((img, i) => this.state.excludeImageIndexes.indexOf(i) < 0).map((img) => {
      return {
        original: img.large,
        thumbnail: img.small
      }
    }) : []

    const getBlogUrl = (id, name) => {
      return '/blogs/' + getSlug([id, name].join(' '))
    }

    Object.keys(place.attributes).forEach((key, i) => {
      if (place.attributes[key]) {
        attributeElements.push(<dt key={`dt${i}`}>{key}</dt>)
        attributeElements.push(<dd key={`dd${i}`}>{place.attributes[key]}</dd>)
      }
    })

    return <main className='content placeDetails'>
      <div className='row'>
        <header className='small-12 columns'>
          <img src={constructStaticAssetUrl('icons/'+place.place_type_icon+'.png')} />
          <h2 className='h3'>{place.name} | {place.place_type}</h2>
          <h3 className='h5'>{place.nearTo ? `Near to ${place.nearTo} in ${place.countries[place.country]}` : `Somewhere in ${place.countries[place.country]}`}</h3>
        </header>
      </div>
      <div className='placeDetails-map' ref='map'>

      </div>
      <div className='row'>
        <div className='small-12 medium-6 medium-push-3 columns is-desc'>
          <h3 className='h4'>Description</h3>
          <p dangerouslySetInnerHTML={{__html: description}} />

          {images.length > 0 && <ImageGallery
            ref={i => this._imageGallery = i}
            items={images}
            slideInterval={2000}
            onImageError={this.onImageError} />}

          <a style={{width: '100%', marginBottom: 20, textAlign: 'center'}} className='btn show-for-small' href={`/places/${this.props.selectedPlace.id}/check_in`}>Been here? Check in!</a>
        </div>

        <div className='small-12 medium-3 medium-pull-6 columns'>
          <h4>Details</h4>
          <dl className='placeDetails-dl'>
            <dt>Last Visited:</dt>
            <dd>{moment(place.check_ins[0].visited.split(' ')[0], 'YYYY-MM-DD').fromNow()}</dd>

            <dt>Latitiude:</dt>
            <dd>{place.location.lat}</dd>
            <dt>Longitude:</dt>
            <dd>{place.location.lng}</dd>

            <dt>Altitude:</dt>
            <dd>{`${place.location.alt || 'Unknown'}`}</dd>

            {place.attributes.Website && <dt>Website:</dt>}
            {place.attributes.Website && <dd><a href={place.attributes.Website}>{place.attributes.Website}</a></dd>}

            <dt>Contributed by:</dt>
            <dd><NavLink href={getBlogUrl(firstCheckIn.blog_id, firstCheckIn.by)}>{firstCheckIn.by || 'Unnamed Blog'}</NavLink></dd>
          </dl>

          <h4>Amenities</h4>
          <dl className='placeDetails-dl'>
            {attributeElements.map((el) => el)}
          </dl>
        </div>

        <div className='small-12 medium-3 columns'>
          <a style={{width: '100%', marginBottom: 20, textAlign: 'center'}} className='btn check-in-btn' href={`/places/${this.props.selectedPlace.id}/check_in`}>Been here? Check in!</a>

          <h4>Latest Check-ins</h4>

          <ul className='placeDetails-checkins'>
            {place.check_ins.map((check_in, i) => {
              const IS_TRUNCATED = check_in.comment.length > 150
              const comment = check_in.comment
                .replace(/\n/g, '<br>')

              return <li key={i} className={IS_TRUNCATED ? 'is-truncated' : ''}>
                <h5>
                  <NavLink href={getBlogUrl(check_in.blog_id, check_in.by)}>{moment(check_in.visited.split(' ')[0], 'YYYY-MM-DD').format('ddd, MMM Do YYYY')}</NavLink>
                  &nbsp;by <NavLink title={check_in.by} href={getBlogUrl(check_in.blog_id, check_in.by)}>{check_in.by || 'Unnamed Blog'}</NavLink>
                </h5>
                <p dangerouslySetInnerHTML={{__html: IS_TRUNCATED ? `${comment.substr(0, 150)}... ` : comment}} />
                {IS_TRUNCATED && <button className='btn-link' data-key={`lightboxCheckIn-${i}`} onClick={this.openReadMore}>Read full check-in...</button>}

                {IS_TRUNCATED && <Lightbox small={true} ref={`lightboxCheckIn-${i}`}>
                  <h4 dangerouslySetInnerHTML={{__html: `Check-in: <a href='/blogs/${check_in.blog_id}'>${moment(check_in.visited.split(' ')[0], 'YYYY-MM-DD').format('ddd, MMMM Do YYYY')}</a> by <a href='/blogs/${check_in.blog_id}'>${check_in.by || 'Unnamed Blog'}</a>`}} />

                  <p dangerouslySetInnerHTML={{__html: comment.replace(URL_REGEX, (match) => {
                    return `<a href='${match}' target='_blank'>${match}</a>`
                  })}} />
                </Lightbox>}
              </li>
            })}
          </ul>
        </div>
      </div>
    </main>
  }

}

PlaceDetails.contextTypes = {
  dispatch: PropTypes.func
}

PlaceDetails.propTypes = {
  selectedPlace: PropTypes.object
}

export default connect((state) => {
  return {
    selectedPlace: state.selectedPlace,
    err: state.selectedPlace.err
  }
})(PlaceDetails)
