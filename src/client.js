import createApplicationStore from './store/ApplicationStore'
import React from 'react'
import ReactDOM from 'react-dom'
import Container from './components/Container'
import debugLib from 'debug'
import markercluster from 'leaflet.markercluster'
import { restoreState, updateCurrentRoute, navigate as navigateAction } from './actions/navigationActions'

import { BrowserRouter as ReactRouter } from 'react-router-dom'

if (process.env.NODE_ENV !== 'production') {
  debugLib.enable('Reduxible, Reduxible:*')
}

const debug = debugLib('Reduxible')

window.React = ReactDOM

const ApplicationStore = createApplicationStore()
debug('Created ApplicationStore on client', ApplicationStore.getState())

// Restore state from the server + enrich with correct routes
ApplicationStore.dispatch(restoreState(window.app))

debug('Restored state', ApplicationStore.getState())

// Render the container with the store - Now if the currentRoute handler changes, so does the DOM!
ReactDOM.render(<ReactRouter>
  <Container store={ApplicationStore} />
</ReactRouter>,
  document.getElementById('app'))

debug('Rendered to Client')

window.store = ApplicationStore
window.navigateAction = navigateAction
