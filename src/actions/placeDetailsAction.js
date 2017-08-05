var config = require('config')
import asyncApiAction from '../helpers/asyncApiAction'

const SINGLE_PLACE_DATA = 'SINGLE_PLACE_DATA'

function setPlaceDetails (data) {
  return {
    type: SINGLE_PLACE_DATA,
    selectedPlace: data,
    pageTitle: `${data.name} | Places | iOverlander`
  }
}

export function placeDetailsAction (route) {
  const ID = route.params.id === 'new' ? 1 : route.params.id || route.params.place
  return asyncApiAction(`${config.get('apiEndpoint')}/place/${ID}`, setPlaceDetails, setPlaceDetails, { err: 'Place not found' }, route)
}
