var config = require('config')
import asyncApiAction from '../helpers/asyncApiAction'

const GET_PLACE_TYPES = 'GET_PLACE_TYPES'

function getPlaceTypes (data) {
  return {
    type: GET_PLACE_TYPES,
    placeTypes: data
  }
}

export function getPlaceTypesFromAPI (route) {
  return asyncApiAction(`${config.apiEndpoint}/placeTypes`, getPlaceTypes, getPlaceTypes, { err: 'An error occured' }, route)
}
