import React, { PropTypes } from 'react'
import NavLink from '../NavLink/NavLink'
import EditCheckInDetails from './Forms/CheckInDetails'
import UploadImagesForm from './Forms/UploadImages'
import EditPlaceDetailsForm from './Forms/PlaceDetails'
import request from 'superagent'
import { connect } from 'react-redux'

if (process.env.BROWSER) {
  require('./checkIn.scss')
}

class CheckIn extends React.Component {

  constructor (props) {
    super()
    this.state = {
      isLoading: false,
      isUploading: false,
      isProcessing: false,
      previewImages: [],
      editPlaceDetails: false,
      placeLat: props.selectedPlace && props.selectedPlace.location ? props.selectedPlace.location.lat : null,
      placeLng: props.selectedPlace && props.selectedPlace.location ? props.selectedPlace.location.lng : null
    }

    this.uploadImages = this.uploadImages.bind(this)
    this.resolveUploadText = this.resolveUploadText.bind(this)
  }

  uploadImages (e) {
    e.preventDefault()

    if (!this.refs.uploadImageForm.refs.files.files.length) {
      this.setState({ editPlaceDetails: true })
      return
    }

    this.setState({
      isUploading: true
    })

    this.resolveUploadText()

    const req = request
      .post('/photos/upload')

    const files = [...this.refs.uploadImageForm.refs.files.files]
    files.forEach((file) => {
      req.attach('photos', file)
    })
    req.field('check_in_id', this.refs.uploadImageForm.refs.check_in.value)

    req.on('progress', (e) => {
      if (e.percent === 100) {
        this.setState({
          isUploading: false,
          isProcessing: true
        })
        this.resolveUploadText()
      }
    })

    req.end((err, res) => {
      this.setState({
        isProcessing: false,
        previewImages: res.body.previews
      })
      this.resolveUploadText()
    })
  }

  resolveUploadText () {
    if (this.state.isUploading && !this.state.isProcessing) {
      this.setState({ uploadText: 'Uploading...' })
    } else if (this.state.isProcessing && !this.state.isUploading) {
      this.setState({ uploadText: 'Uploaded, processing...' })
    } else if (!this.state.isProcessing && !this.state.isUploading && this.refs.uploadImageForm && this.refs.uploadImageForm.refs.files && this.refs.uploadImageForm.refs.files.files.length > 0) {
      this.setState({ uploadText: 'Upload the photos!' })
    } else {
      this.setState({ uploadText: 'No photos? Lets continue..' })
    }
  }

  componentDidUpdate () {
    const thisForm = this.props.formState.checkIn
    if (thisForm && thisForm.errors && this.state.isLoading !== false) {
      this.setState({ isLoading: false })
    }

    if (thisForm && thisForm.saved && this.state.checkInSaved !== true) {
      this.setState({ checkInSaved: true, checkInId: thisForm.id })
    }
  }

  componentDidMount () {
    this.resolveUploadText()
  }

  getChildContext () {
    return {
      updatePlaceDetails: this.updatePlaceDetails,
      resetLocation: this.resetLocation,
      updateLatLng: this.updateLatLng,
      resolveUploadText: this.resolveUploadText,
      uploadImages: this.uploadImages,
      setState: this.setState.bind(this),
      onSubmit: this.onSubmit,
      moveMapMarker: this.moveMapMarker
    }
  }

  render () {
    if (this.props.selectedPlace.err) {
      return <main className='content is-flex' style={{ display: 'block', textAlign: 'center' }}>
        <div className='row'>
          <div className='small-12 medium-centered medium-6 large-6 columns center check-in-form'>
            <h4>Uh oh! You seem to have gone off the map!</h4>
            <NavLink href={`/`}>Back to the homepage?</NavLink>
          </div>
        </div>
      </main>
    }

    if (this.state.hasUpdatedPlace) {
      return <main className='content is-flex'>
        <div className='row'>
          <div className='small-12 medium-centered medium-6 large-6 columns center check-in-form'>
            <h4>Hooray! You're all checked in</h4>
            <p>Thanks for checking in, it helps keep our information up-to-date for other overlanders.</p>
            <p>Your updates may take a little while to appear as we refresh every few hours. They'll be there though, just you wait!</p>
            <NavLink href={`/places/${this.props.selectedPlace.id}`}>Back to {this.props.selectedPlace.name}</NavLink>
          </div>
        </div>
      </main>
    }

    if (this.state.checkInSaved && !this.state.editPlaceDetails) {
      return <UploadImagesForm ref='uploadImageForm' {...this.props} state={this.state} />
    }

    if (this.state.editPlaceDetails) {
      return <EditPlaceDetailsForm ref='editPlaceDetailsForm' {...this.props} state={this.state} />
    }

    return <EditCheckInDetails ref='editCheckInDetailsForm' {...this.props} state={this.state} />
  }

}

CheckIn.contextTypes = {
  dispatch: PropTypes.func
}

CheckIn.childContextTypes = {
  updatePlaceDetails: PropTypes.func,
  resetLocation: PropTypes.func,
  updateLatLng: PropTypes.func,
  resolveUploadText: PropTypes.func,
  uploadImages: PropTypes.func,
  getAttributesForPlaceType: PropTypes.func,
  setState: PropTypes.func,
  onSubmit: PropTypes.func,
  moveMapMarker: PropTypes.func
}

CheckIn.propTypes = {
  selectedPlace: PropTypes.object,
  formState: PropTypes.object,
  store: PropTypes.object
}

export default connect((state) => {
  return {
    selectedPlace: state.selectedPlace
  }
})(CheckIn)
