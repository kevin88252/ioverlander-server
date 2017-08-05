import React, { PropTypes } from 'react'
import createValidatedForm from '../../Validation/ValidatedForm'
import { onChange } from '../../../actions/validation/validationActions'
import request from 'superagent'
import initialiseMap from '../../../helpers/initialiseMap'
import constructStaticAssetUrl from '../../../helpers/staticAssetUrl'
import { connect } from 'react-redux'
let L

if (global.window) {
  L = require('leaflet')
}

export const FIELDS = [
  'placeName',
  'placeCategory',
  'placeDescription',
  'placeWebsite',
  'placeOpen',
  'placeCountry',
  'placeLatitude',
  'placeLongitude',
  'placeAltitude'
]

export const validateFields = (fields) => {
  const errors = {}

  ;['placeName', 'placeDescription', 'placeCountry', 'placeOpen', 'placeCategory', 'placeLatitude', 'placeLongitude'].forEach((val) => {
    if (!fields[val]) {
      errors[val] = 'This field is required'
    }
  })

  ;['placeLatitude', 'placeLongitude', 'placeAltitude'].forEach((val) => {
    if (fields[val] && isNaN(parseInt(fields[val], 10)) && !errors[val]) {
      errors[val] = 'This value needs to be numeric'
    }
  })

  return errors
}

class UpdatePlaceDetailsForm extends React.Component {
  constructor () {
    super()
    this.state = {
      availableAttributes: [],
      isUpdatingPlace: false
    }

    this.getAttributesForPlaceType = this.getAttributesForPlaceType.bind(this)
    this.updateLatLng = this.updateLatLng.bind(this)
    this.resetLocation = this.resetLocation.bind(this)
    this.moveMapMarker = this.moveMapMarker.bind(this)
    this.resetLocation = this.resetLocation.bind(this)
    this.updatePlaceDetails = this.updatePlaceDetails.bind(this)
  }

  updatePlaceDetails () {
    const values = {}
    const elements = [...this.refs.updatePlaceDetailsForm.elements]

    elements.forEach((el) => {
      if (el.type !== 'radio' && el.value) {
        values[el.name] = el.value
      } else if (el.type === 'radio' && el.value && !values[el.name]) {
        const radioSetName = el.name
        const element = elements.filter((el) => el.name === radioSetName && el.checked)[0]
        values[el.name] = element ? element.value : 'unknown'
      }
    })

    this.setState({
      isUpdatingPlace: true
    })

    return new Promise((resolve, rej) => {
      request
        .post('/api/place/update')
        .type('form')
        .send(values)
        .end((err, res) => {
          if (err) {
            rej()
          }

          this.setState({
            isUpdatingPlace: false,
            hasUpdatedPlace: true
          })
          resolve()
        })
    })
  }

  componentDidMount () {
    this.getAttributesForPlaceType({ target: this.refs.placeCategory })

    if (!this.map) {
      const LAT = this.props.selectedPlace.location.lat
      const LNG = this.props.selectedPlace.location.lng

      this.map = initialiseMap(document.getElementById('location-map'), [LAT, LNG], 12)

      this.map.on('click', (e) => {
        this.updateLatLng(e.latlng.lat, e.latlng.lng)
      })

      this.marker = new L.Marker([LAT, LNG], {
        riseOnHover: true,
        icon: new L.Icon({
          iconUrl: constructStaticAssetUrl('assets/icons/' + this.props.selectedPlace.place_type_icon + '-pin.png'),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30]
        })
      }).addTo(this.map)
    }
  }

  componentDidUpdate (prevProps) {
    const fields = this.props.fields

    if (fields.placeLatitude.value !== prevProps.fields.placeLatitude.value || fields.placeLongitude.value !== prevProps.fields.placeLatitude.value) {
      this.moveMapMarker(fields.placeLatitude.value, fields.placeLongitude.value)
    }

    if (fields.placeCategory.value.toString() !== this.state.attributesType) {

      console.log(fields.placeCategory.value, this.state.attributesType)

      this.getAttributesForPlaceType({ target: this.refs.placeCategory })
    }
  }

  getAttributesForPlaceType (e) {
    const type = e ? e.target.value : this.props.selectedPlace.place_type_id
    const attributes = this.props.selectedPlace.placeTypes[type].attributes
    this.setState({ attributesType: type, availableAttributes: attributes.map((attr) => attr.property_def.identifier) })
  }

  updateLatLng (lat, lng) {
    if (typeof lat === 'object') {
      lat = this.refs.lat.value
      lng = this.refs.lng.value
    }

    this.map.setView([lat, lng], this.map.getZoom())
    this.marker.setLatLng([lat, lng])

    this.refs.lat.value = lat
    this.props.store.dispatch(onChange('UpdatePlaceDetailsForm', this.refs.lat.name, this.refs.lat.value))

    this.refs.lng.value = lng
    this.props.store.dispatch(onChange('UpdatePlaceDetailsForm', this.refs.lng.name, this.refs.lng.value))
  }

  moveMapMarker (lat, lng) {
    this.map.setView([lat, lng], this.map.getZoom())
    this.marker.setLatLng([lat, lng])
  }

  resetLocation (e) {
    e.preventDefault()
    this.updateLatLng(this.props.selectedPlace.location.lat, this.props.selectedPlace.location.lng)
  }

  render () {
    const { fields: { placeName, placeCategory, placeDescription, placeWebsite, placeOpen, placeCountry, placeAltitude, placeLongitude, placeLatitude } } = this.props

    return <main className='content is-flex' style={{ display: 'block' }}>
      <div className='row'>
        <div className='check-in-center small-12 medium-12 large-8 columns'>
          <h4>Let's get everything in order</h4>
          {!this.props.newPlace && <p>Here are the current details for <strong>{this.props.selectedPlace.name}</strong>. Does anything look wrong? Edit it below so future visitors know what to expect.</p>}
          {this.props.newPlace && <p>Fill in the details for your new place below and we're all done!</p>}
        </div>

        <form ref='updatePlaceDetailsForm' method='POST' action='/api/place/update' className='small-12 medium-12 large-8 columns input-form check-in-form check-in-center' onSubmit={this.props.onSubmit(this.updatePlaceDetails)}>
          <h4>General</h4>

          <label htmlFor='placeName'>
            <p>Place Name {placeName.touched && placeName.error && <span className='error'>{placeName.error}</span>}</p>
            <input type='text' id='placeName' name='placeName' {...placeName} />
          </label>

          <label htmlFor='placeCategory'>
            <p>Place Type {placeCategory.touched && placeCategory.error && <span className='error'>{placeCategory.error}</span>}</p>
            <select ref='placeCategory' name='placeCategory' id='placeCategory' {...placeCategory} onChange={placeCategory.onChange(this.getAttributesForPlaceType)}>
              {Object.keys(this.props.selectedPlace.placeTypes).map((type, i) => {
                return <option key={i} value={type}>{this.props.selectedPlace.placeTypes[type].name}</option>
              })}
            </select>
          </label>

          <label htmlFor='placeDescription'>
            <p>Description {placeDescription.touched && placeDescription.error && <span className='error'>{placeDescription.error}</span>}</p>
            <textarea id='placeDescription' name='placeDescription' {...placeDescription}></textarea>
          </label>

          <label htmlFor='placeWebsite'>
            <p>Place Website</p>
            <input type='text' id='placeWebsite' name='placeWebsite' placeholder='example.com' {...placeWebsite} />
          </label>

          <label htmlFor='placeOpen'>
            <p>Open {placeOpen.touched && placeOpen.error && <span className='error'>{placeOpen.error}</span>}</p>
            <select id='placeOpen' name='placeOpen' {...placeOpen} >
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </label>

          <hr className='check-in-hr' />

          <h4>Location</h4>
          <p>Click on the map or type in the latitude/longitude fields to update this places location.</p>

          <div className='row'>

            <div className='small-12 medium-6 columns'>

              <label htmlFor='placeCountry'>
                <p>Country {placeCountry.touched && placeCountry.error && <span className='error'>{placeCountry.error}</span>}</p>
                <select id='placeCountry' name='placeCountry' {...placeCountry}>
                  <option value=''>Please Select...</option>
                  {Object.keys(this.props.selectedPlace.countries).sort().map((id) => {
                    return <option key={id} value={id}>{this.props.selectedPlace.countries[id]}</option>
                  })}
                </select>
              </label>

              <label htmlFor='placeLatitude'>
                <p>Latitude {placeLatitude.touched && placeLatitude.error && <span className='error'>{placeLatitude.error}</span>}</p>
                <input type='text' ref='lat' name='placeLatitude' {...placeLatitude} />
              </label>

              <label htmlFor='placeLongitude'>
                <p>Longitude {placeLongitude.touched && placeLongitude.error && <span className='error'>{placeLongitude.error}</span>}</p>
                <input type='text' ref='lng' name='placeLongitude' {...placeLongitude} />
              </label>

              <label htmlFor='placeAltitude'>
                <p>Altitude (.masl) {placeAltitude.touched && placeAltitude.error && <span className='error'>{placeAltitude.error}</span>}</p>
                <input type='text' name='placeAltitude' {...placeAltitude} />
              </label>

            </div>

            <div className='small-12 medium-6 columns'>
              <div id='location-map' />
              {!this.props.newPlace && <button onClick={this.resetLocation} className='btn'>Reset location</button>}
            </div>

          </div>

          {!!Object.keys(this.props.selectedPlace.propertyTypes).filter((type) => {
            return this.state.availableAttributes.indexOf(type) > -1
          }).length && <hr className='check-in-hr' /> && <h4>Amenities</h4>}

          {Object.keys(this.props.selectedPlace.propertyTypes).filter((type) => {
            return this.state.availableAttributes.indexOf(type) > -1
          }).map((prop) => {
            const key = prop.split('_').map((v) => v.substr(0, 1).toUpperCase() + v.substr(1, 30)).join(' ')
            const currentValue = this.props.defaultUnknown ? 'Unknown' : this.props.selectedPlace.attributes[key] || 'Unknown'

            return <fieldset key={key} className='check-in-amenity'>
              <h5>{key}</h5>
              <p>{this.props.selectedPlace.propertyTypes[prop].description}</p>

              {Object.keys(this.props.selectedPlace.propertyTypes[prop].amenities).map((label, i) => {
                if (label === 'I\'m not sure') { label = 'Unknown' }
                return <label key={i} className='check-in-amenity-toggle'>
                  <input key={i} type='radio' defaultChecked={label === currentValue} name={prop} defaultValue={this.props.selectedPlace.propertyTypes[prop].amenities[label]} />
                  <span>{label}</span>
                </label>
              })}
            </fieldset>
          })}

          <input type='hidden' name='placeId' value={this.props.newPlace ? 'create' : this.props.selectedPlace.id} />

          <hr className='check-in-hr' />

          <button className='btn' disabled={this.state.isUpdatingPlace}>{this.state.isUpdatingPlace ? 'Saving place...' : this.props.newPlace ? 'Create this place' : 'Update this place (and complete check-in)!'}</button>

        </form>
      </div>
    </main>
  }
}

UpdatePlaceDetailsForm.propTypes = {
  formState: PropTypes.object,
  selectedPlace: PropTypes.object,
  state: PropTypes.object,
  fields: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  defaultUnknown: PropTypes.bool,
  newPlace: PropTypes.bool
}

UpdatePlaceDetailsForm.contextTypes = {
  updatePlaceDetails: PropTypes.func,
  resetLocation: PropTypes.func,
  updateLatLng: PropTypes.func,
  setState: PropTypes.func,
  moveMapMarker: PropTypes.func
}

UpdatePlaceDetailsForm.displayName = 'UpdatePlaceDetailsForm'

export { UpdatePlaceDetailsForm }

export default connect((state) => {
  return {
    selectedPlace: state.selectedPlace
  }
})(createValidatedForm(UpdatePlaceDetailsForm, FIELDS, validateFields, {
  placeName: (props) => props.selectedPlace.name,
  placeCategory: (props) => props.selectedPlace.place_type_id,
  placeDescription: (props) => props.selectedPlace.description,
  placeWebsite: (props) => props.selectedPlace.attributes.website,
  placeOpen: (props) => props.selectedPlace.attributes.Open,
  placeCountry: (props) => props.selectedPlace.country,
  placeLatitude: (props) => props.state.placeLat,
  placeLongitude: (props) => props.state.placeLng,
  placeAltitude: (props) => props.selectedPlace.location.altitude
}))
