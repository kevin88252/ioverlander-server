import React, { PropTypes } from 'react'
import initialiseMap from '../../helpers/initialiseMap'
import CreateNewPlaceForm from './CreateNewPlaceForm'
import { onChange } from '../../actions/validation/validationActions'
import constructStaticAssetUrl from '../../helpers/staticAssetUrl'
import { connect } from 'react-redux'
let L

if (global.window) {
  L = require('leaflet')
}

if (process.env.BROWSER) {
  require('./createPlace.scss')
}

class CreateNewPlace extends React.Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      lat: null,
      lng: null,
      placeType: null,
      stage: 1
    }
  }

  componentDidMount () {
    this.map = initialiseMap(this.refs.map)

    this.map.on('click', (e) => {
      this.setState({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })

      if (!this.marker) { this.createMarker(this.state.lat, this.state.lng) }
    })
  }

  createMarker (lat, lng) {
    this.marker = new L.Marker([lat, lng], {
      riseOnHover: true,
      icon: new L.Icon({
        iconUrl: constructStaticAssetUrl('icons/other-pin.png'),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
      })
    })

    this.marker.addTo(this.map)
  }

  componentDidUpdate (prevProps, prevState) {
    if ((this.state.lat || this.state.lng) && !this.marker) {
      this.createMarker(this.state.lat, this.state.lng)
    } else if (this.state.lat !== prevState.lat || this.state.lng !== prevState.lng) {
      this.marker.setLatLng([this.state.lat, this.state.lng])
      this.map.setView([this.state.lat, this.state.lng], this.map.getZoom())
    }

    if (this.state.stage === 3 && prevState.stage !== 3) {
      this.context.dispatch(onChange('UpdatePlaceDetailsForm', 'placeLatitude', this.state.lat))
      this.context.dispatch(onChange('UpdatePlaceDetailsForm', 'placeLongitude', this.state.lng))
      this.context.dispatch(onChange('UpdatePlaceDetailsForm', 'placeCategory', this.state.placeType))
      this.context.dispatch(onChange('UpdatePlaceDetailsForm', 'placeOpen', 'Yes'))
    }
  }

  render () {
    const fullWidthStyles = { width: '100%', margin: '15px 0 0 0', minHeight: '36px' }

    if (this.state.stage === 3) {
      return <CreateNewPlaceForm {...this.props} newPlaceCategory={this.state.placeType} defaultUnknown={true} newPlace={true} />
    }

    return <main className='content is-flex' style={{ display: this.state.stage !== 1 ? 'block' : 'flex' }} >
      {this.state.stage === 2 && <div className='row'>
        <div className='small-12 medium-12 columns'>

          <h3 style={{ textAlign: 'center', marginTop: 10 }}>What type of place is this?</h3>

          <form className='select-place-type' onSubmit={(e) => { e.preventDefault(); this.setState({ stage: 3, type: e.target.value }) }}>
            <button type='submit' style={{ flex: '1 0 100%', marginBottom: 10 }}
              disabled={!this.state.placeType} className='btn'>{this.state.placeType ? 'I\'ve chosen!' : 'Choose a place type to continue'}</button>
            {this.props.placeTypes.map((type) => {
              const ID = type.id
              return <div className='place-type'>
                <input type='radio' name='place-type' value={ID} id={ID} onChange={(e) => this.setState({ placeType: type.id })} />
                <label htmlFor={ID}>
                  <img src={constructStaticAssetUrl('icons/'+type.icon+'.png')} alt={type} />
                  <strong>{type.name}</strong>
                  <p>{type.description}</p>
                </label>
              </div>
            })}
            <button type='submit' style={{ flex: '1 0 100%' }}
              disabled={!this.state.placeType} className='btn'>{this.state.placeType ? 'I\'ve chosen!' : 'Choose a place type to continue'}</button>
          </form>
        </div>
      </div>}

      {this.state.stage === 1 && <header>
        <div className='row' style={{ textAlign: 'center' }}>
          <div className='small-12 medium-12 columns'>
            <h4 style={{ margin: '5px 0 0 0' }}>Add a new place</h4>
            <p style={{ margin: '10px 0' }}>Enter co-ordinates for your new place, or click anywhere on the map to pick a location</p>
          </div>
        </div>
      </header>}
      {this.state.stage === 1 && <div className='homepage-map' ref='map' />}
      {this.state.stage === 1 && <footer style={{ marginBottom: -20 }}>
        <form className='row filter-bar' onSubmit={(e) => { e.preventDefault(); this.setState({ stage: 2 }) }}>
          <div className='small-12 medium-4 columns'>
            <input style={fullWidthStyles} type='text' ref='lat' placeholder='Latitude' value={this.state.lat} onChange={(e) => this.setState({ lat: e.target.value })} />
          </div>
          <div className='small-12 medium-4 columns'>
            <input style={fullWidthStyles} type='text' ref='lng' placeholder='Longitude' value={this.state.lng} onChange={(e) => this.setState({ lng: e.target.value })} />
          </div>
          <div className='small-12 medium-4 columns'>
            <button style={fullWidthStyles} type='submit' className='btn' disabled={!this.state.lng || !this.state.lat}>That's the spot!</button>
          </div>
        </form>
      </footer>}

    </main>
  }
}

CreateNewPlace.contextTypes = {
  dispatch: PropTypes.func
}

CreateNewPlace.propTypes = {
  store: PropTypes.object
}

export default connect((state) => {
  return {
    placeTypes: state.placeTypes,
    selectedPlace: state.selectedPlace
  }
})(CreateNewPlace)
