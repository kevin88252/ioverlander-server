/* globals history */
import React, { PropTypes } from 'react'
import request from 'superagent'
import showMapLoader from '../../actions/showMapLoader'
import { navigate } from '../../actions/navigationActions'
import { getCountryPlaceCounts } from '../../actions/getCountryPlaceCounts'
import { getPlacesByLatLng } from '../../actions/getPlacesByLatLng'
import ReactDOMServer from 'react-dom/server'
import initializeMap from '../../helpers/initialiseMap'
import PlaceCard from '../PlaceCard/PlaceCard'
import getVisibleMapTiles from '../../helpers/getVisibleMapTiles'
import Lightbox from '../Lightbox/Lightbox'
import constructStaticAssetUrl from '../../helpers/staticAssetUrl'
import { connect } from 'react-redux'

let L

if (process.env.BROWSER) {
  require('./homepageMap.scss')
  require('./placeTypeFilter.scss')
}

if (global.window) {
  L = require('leaflet')

  L.OverlanderOverviewIcon = L.Icon.extend({
    createIcon: function () {
      var div = document.createElement('div')
      var numdiv = document.createElement('div')
      var numberSpan = document.createElement('span')
      numdiv.setAttribute('class', 'number-marker')
      numdiv.setAttribute('style', `background-image: url(${constructStaticAssetUrl('/icons/blue-orb.png')})`)
      numdiv.appendChild(numberSpan)
      numberSpan.innerHTML = this.options['number']
      div.appendChild(numdiv)
      this._setIconStyles(div, 'icon')
      return div
    }
  })
}

const PLACE_TYPES = {}

const generatePopupForLocation = (location) => {
  return ReactDOMServer.renderToString(<PlaceCard location={location} />)
}

class HomePage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showTypeFilter: false,
      filteredTypes: PLACE_TYPES,
      selectAllChecked: true
    }

    props.placeTypes.forEach(type => {
      PLACE_TYPES[type.name] = true
    })

    this.addCountryLayer = this.addCountryLayer.bind(this)
    this.getMarkersInBounds = this.getMarkersInBounds.bind(this)
    this.doSearch = this.doSearch.bind(this)
    this.showHideDynamicLayers = this.showHideDynamicLayers.bind(this)
    this.addPlaceMarkers = this.addPlaceMarkers.bind(this)
    this.navigateToPlace = this.navigateToPlace.bind(this)
    this.togglePlaceFilter = this.togglePlaceFilter.bind(this)
    this.toggleLegend = this.toggleLegend.bind(this)
  }

  navigateToPlace (e) {
    e.preventDefault()
    this.context.dispatch(navigate(e.target.pathname))
  }

  getMarkersInBounds () {
    if (!this.alreadyRequestedBounds) {
      this.alreadyRequestedBounds = []
    }

    const tilesToRequest = getVisibleMapTiles(this.map).filter((bounds) => {
      return this.alreadyRequestedBounds.indexOf(`${bounds._northEast.lat}/${bounds._southWest.lat}/${bounds._northEast.lng}/${bounds._southWest.lng}`) < 0
    })

    const CHUNK_SIZE = 2
    const chunksToLoad = tilesToRequest.length / CHUNK_SIZE

    const loadChunk = (chunk) => {
      const tiles = tilesToRequest.slice(CHUNK_SIZE * chunk, (CHUNK_SIZE * chunk) + CHUNK_SIZE)
      tiles.forEach((bounds, i) => {
        const query = `${bounds._northEast.lat}/${bounds._southWest.lat}/${bounds._northEast.lng}/${bounds._southWest.lng}`
        this.context.dispatch(getPlacesByLatLng(query, i + (chunk * CHUNK_SIZE), tilesToRequest.length - 1))
        this.alreadyRequestedBounds.push(query)
      })

      if (chunk < chunksToLoad) {
        setTimeout(() => loadChunk(chunk + 1), 150)
      }
    }

    loadChunk(0)

    if (tilesToRequest.length > 0) {
      this.context.dispatch(showMapLoader(true, tilesToRequest.length, 0))
    }
  }

  addPlaceMarkers () {
    this.props.mapMarkers.filter(location => location.place).forEach((location) => {
      if (!this.mapLayers || !this.mapLayers[location.place.place_category.name]) {
        this.mapLayers = this.mapLayers || {}
        this.mapLayers[location.place.place_category.name] = L.markerClusterGroup({
          maxClusterRadius: 80,
          disableClusteringAtZoom: 10,
          chunkedLoading: true,
          zoomToBoundsOnClick: true,
          iconCreateFunction: function (cluster) {
            return L.divIcon({ html: '<div class="cluster-icon" style="background-image: url('+constructStaticAssetUrl('icons/' + location.place.place_category.icon + '.png')+')"><span>' + cluster.getChildCount() + '</span></div>' })
          }
        })
      }

      if (this.markerRegistry.indexOf(location.id) === -1) {
        let popup = new L.Popup({
          className: 'selected-location'
        }).setContent(generatePopupForLocation(location))

        let marker = new L.Marker([location.latitude, location.longitude], {
          riseOnHover: true,
          icon: new L.Icon({
            iconUrl: constructStaticAssetUrl('icons/' + location.place.place_category.icon + '-pin.png'),
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -30],
            className: (location.place.properties_blob.open_for_business.includes('yes') ? '' : ' is-closed')
          })
        })

        marker.bindPopup(popup)
        marker.addTo(this.mapLayers[location.place.place_category.name])
        this.markerRegistry.push(location.id)

        if (this.map.getZoom() > 6 && this.state.filteredTypes[location.place.place_category.name]) {
          this.mapLayers[location.place.place_category.name].addTo(this.map)
        }
      }
    })
  }

  addCountryLayer () {
    let countryMarkers = L.layerGroup()

    Object.keys(this.props.countryPlaceCounts).forEach((country) => {
      if (this.props.countryPlaceCounts[country].count) {
        const marker = new L.Marker([this.props.countryPlaceCounts[country].latitude, this.props.countryPlaceCounts[country].longitude], {
          icon: new L.OverlanderOverviewIcon({
            number: this.props.countryPlaceCounts[country].count
          })
        })

        marker.addTo(countryMarkers)
        marker.on('click', (marker) => {
          this.map.flyTo(marker.latlng, 8)
        })
      }
    })

    this.countryLayer = countryMarkers

    if (this.map.getZoom() <= 6) {
      this.map.addLayer(this.countryLayer)
    }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.countryPlaceCounts && this.props.countryPlaceCounts) {
      this.addCountryLayer()
    } else if (this.props.mapMarkers && this.props.mapMarkers.length) {
      this.addPlaceMarkers()
    }
  }

  componentDidMount () {
    let params = {}
    if (window.location.search) {
      window.location.search
        .split(/[\?\&]/g)
        .filter(val => val)
        .forEach((val) => {
          params[val.split('=')[0]] = val.split('=')[1]
        })
    }

    this.map = initializeMap(this.refs.map, (params.lat ? [params.lat, params.lng] : null), params.zoom)

    window.map = this.map

    // When remounted after moving in history, we need to have these set up
    this.markerRegistry = []
    this.locationLayer = L.layerGroup()

    // If we already have these in the store, re-add the layer
    if (this.props.countryPlaceCounts) {
      this.addCountryLayer()
    }

    this.context.dispatch(getCountryPlaceCounts())

    setTimeout(() => {
      this.showHideDynamicLayers()
    }, 150)

    this.map.on('moveend', () => {
      this.showHideDynamicLayers()
    })

    this.map.on('zoomend', () => {
      this.showHideDynamicLayers()
    })
  }

  showHideDynamicLayers (supressCall) {
    if (this.map.getZoom() <= 6) {
      if (this.countryLayer) { this.map.addLayer(this.countryLayer) }
      Object.keys(this.mapLayers || {}).forEach((layer) => {
        this.mapLayers[layer].removeFrom(this.map)
      })
    } else if (this.map.getZoom() > 6) {
      if (this.countryLayer) { this.map.removeLayer(this.countryLayer) }
      if (!supressCall) { this.getMarkersInBounds() }
      Object.keys(this.mapLayers || {}).forEach((layer) => {
        if (this.state.filteredTypes[layer]) {
          this.mapLayers[layer].addTo(this.map)
        } else {
          this.mapLayers[layer].removeFrom(this.map)
        }
      })
    }

    history.replaceState({
      path: window.location.pathname + window.location.search,
      title: document.title
    },
    document.title,
    window.location.pathname + `?lat=${this.map.getCenter().lat}&lng=${this.map.getCenter().lng}&zoom=${this.map.getZoom()}`)
  }

  doSearch (e) {
    e.preventDefault()
    var addressText = this.refs.search.value

    request.get(`//nominatim.openstreetmap.org/search/${addressText}?format=jsonv2`).end((err, res) => {
      const data = res.body[0]
      this.map.flyTo(L.latLng(data.lat, data.lon), 8)
    })
  }

  togglePlaceFilter () {
    this.setState({ showTypeFilter: !this.state.showTypeFilter })
  }

  toggleLegend () {
    if (this.refs.lightbox.state.isOpen) {
      this.refs.lightbox.close()
    } else {
      this.refs.lightbox.open()
    }
  }

  render () {
    const PLACE_TYPE_COUNT = Object.keys(this.state.filteredTypes).filter((type) => {
      return this.state.filteredTypes[type]
    }).length

    return <main className='content is-flex is-homepage' data-el='homepage-container'>
      <header>
        <div className='row filter-bar'>
          <div className='small-12 medium-3 columns'>
            <form data-el='place-search-form' className='form-group' onSubmit={this.doSearch}>
              <label htmlFor='search'>Zoom to Locations</label>
              <input data-el='place-search' type='text' ref='search' placeholder='Country, City, or GPS Co-ordinates' id='search' />
              <button type='submit'>Go</button>
            </form>
          </div>
          <div className='small-12 hide-for-small medium-3 columns filter-container'>
            <label>Place Types:</label>
            <button className='btn btn-block' onClick={this.togglePlaceFilter}>{PLACE_TYPE_COUNT} shown, {Object.keys(PLACE_TYPES).length - PLACE_TYPE_COUNT} hidden</button>

            {this.state.showTypeFilter && <div className='place-type-filter'>
              <ul className='place-type-filter-list'>
                <li className={this.state.selectAllChecked ? 'active' : ''}>
                  <input type='checkbox' value='' id='selectAll' checked={this.state.selectAllChecked} onChange={(e) => {
                    const filters = Object.assign({}, this.state.filteredTypes)

                    Object.keys(filters).forEach(filter => {
                      filters[filter] = !this.state.selectAllChecked
                    })

                    this.setState({ filteredTypes: filters, selectAllChecked: !this.state.selectAllChecked })

                    setImmediate(() => this.showHideDynamicLayers(true))
                  }} />
                  <label htmlFor='selectAll'>Select/Deselect All</label>
                </li>
                {Object.keys(this.state.filteredTypes).map((type, i) => {
                  return <li className={this.state.filteredTypes[type] ? 'active' : ''}>
                    <input checked={this.state.filteredTypes[type]} type='checkbox' id={`filter-${i}`} onChange={() => {
                      const thisFilter = {}
                      thisFilter[type] = !this.state.filteredTypes[type]
                      this.setState({
                        filteredTypes: Object.assign({}, this.state.filteredTypes, thisFilter)
                      })
                      setImmediate(() => this.showHideDynamicLayers(true))
                    }} />
                    <label htmlFor={`filter-${i}`}>{type}</label>
                  </li>
                })}
              </ul>
            </div>}
          </div>
          <div className='small-12 hide-for-small medium-4 columns filter-container'>
            <label>View Legend:</label>
            <button className='btn btn-block' onClick={this.toggleLegend}>See Legend</button>
          </div>
          <div className='small-4 columns'></div>
        </div>
      </header>
      <div className='homepage-map' ref='map' />
      {this.props.showLoadingWheel && <span className='homepage-map-loader'>Loading... ({this.props.tilesLoaded} of {this.props.tilesToLoad})</span>}

      <Lightbox small={true} ref='lightbox'>
        <div className='homepage-legend-container'>
          <ul className='homepage-legend'>
            {this.props.placeTypes.map(type => {
              return <li>
                <img src={constructStaticAssetUrl('icons/'+type.icon+'.png')} />
                <p>{type.name}</p>
              </li>
            })}
          </ul>
        </div>
      </Lightbox>
    </main>
  }
}

HomePage.contextTypes = {
  dispatch: PropTypes.func
}

HomePage.propTypes = {
  showLoadingWheel: PropTypes.bool,
  countryPlaceCounts: PropTypes.object,
  mapMarkers: PropTypes.array
}

export default connect(
  (state) => {
    return {
      showLoadingWheel: state.showLoadingWheel,
      countryPlaceCounts: state.countryPlaceCounts,
      mapMarkers: state.mapMarkers,
      placeTypes: state.placeTypes
    }
  }
)(HomePage)