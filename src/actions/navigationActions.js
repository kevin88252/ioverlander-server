import objectFromQueryString from '../helpers/objectFromQueryString'

export const RESTORE_STATE = 'RESTORE_STATE'
export const CURRENT_ROUTE = 'CURRENT_ROUTE'

export function restoreState (state) {
  return { type: RESTORE_STATE, state: state }
}

export function updateCurrentRoute (route) {
  return { type: CURRENT_ROUTE, route }
}
