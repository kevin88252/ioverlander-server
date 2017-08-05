/* globals history */
import React, { PropTypes } from 'react'
import PlaceCard from '../PlaceCard/PlaceCard'
import filters from './filters.json'
import ReactPaginate from 'react-paginate'
import getSlug from 'speakingurl'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { searchForPlacesAction } from '../../actions/searchForPlacesAction'

if (process.env.BROWSER) {
  require('./countryPlacesList.scss')
}

class CountryPlacesList extends React.Component {
  constructor (props) {
    super(props)

    const defaultPlaceTypeValues = {}
    Object.keys(props.searchResults.placeTypes).forEach((type, i) => {
      type = props.searchResults.placeTypes[i]
      const untick = props.searchResults.filter.excludeTypes.indexOf(type.id.toString()) > -1
      defaultPlaceTypeValues[type.id] = !untick
    })

    const defaultAmenityValues = {}
    Object.keys(filters.amenities).forEach((type) => {
      const alreadyTicked = props.searchResults.filter.amenities.indexOf(filters.amenities[type]) > -1
      defaultAmenityValues[filters.amenities[type]] = alreadyTicked
    })

    const lastVisitedRanges = [
        ['', "Any"],
        [3, "3 months"],
        [6, "6 months"],
        [12, "1 year"],
        [24, "2 years"],
        [36, "3 years"],
        [60, "5 years"],
    ]

    this.state = {
      placeTypes: Object.assign({}, defaultPlaceTypeValues),
      amenities: Object.assign({}, defaultAmenityValues),
      lastVisited: props.searchResults.filter.lastVisited || '',
      currentPage: props.searchResults.currentPage
    }

    this.lastVisitedRanges = lastVisitedRanges;
    this.constructFilterQuery = this.constructFilterQuery.bind(this)
    this.toggleField = this.toggleField.bind(this)
    this.paginate = this.paginate.bind(this)

  }

  paginate (e) {
    const newPage = e.selected

    this.setState({
      currentPage: newPage + 1
    })

    setImmediate(() => this.constructFilterQuery())
    scrollTo(document.querySelector('main'), 50)
  }

  constructFilterQuery (e) {
    this.toggleField(e)

    const fields = [...this.refs.form.elements]
    const filter = {
      amenities: [],
      excludedTypes: [],
      lastVisited: ''
    }

    fields.forEach((field) => {
      if (field.id.includes('placeType') && !field.checked) {
        filter.excludedTypes.push(field.value)
      }

      if (field.id.includes('amenities') && field.checked) {
        filter.amenities.push(field.value)
      }
      if (field.name == 'last_visited' && field.checked) {
        filter.lastVisited = field.value
      }
    })
    
    // TODO: fix code for query string in history
    let query = '?'
    Object(['amenities', 'excludedTypes']).forEach((field) => {
      if (filter[field].length) {
        query += `${field}=${filter[field].join(',')}&`
      }
    })
    if (this.state['lastVisited']) { query += `lastVisited=${this.state['lastVisited']}&` }
    query = query.substr(0, query.length - 1)

    if (window.history) {
      history.replaceState({}, document.title, `/country_places_list/${this.props.searchResults.currentCountry}/${this.state.currentPage}${query}`)
    }
    this.context.dispatch(searchForPlacesAction({
      params: {
        country: e && e.target.name === 'country' ? e.target.value : this.props.searchResults.currentCountry,
        page: this.state.currentPage,
        amenities: filter.amenities,
        excludedTypes: filter.excludedTypes,
        lastVisited: filter.lastVisited,
        filter: filter
      }
    }))

    return query
  }

  toggleField (e) {
    if (!e) { return false }

    const target = e.target
    let stateTarget = null

    if (target.id.includes('placeType')) {
      stateTarget = 'placeTypes'
    } else if (target.id.includes('amenities')) {
      stateTarget = 'amenities'
    } else if (target.id.includes('last_visited')) {
      this.setState({'lastVisited': target.value})
      return
    }

    const newValues = Object.assign({}, this.state[stateTarget])

    newValues[target.value] = !newValues[target.value]

    const newState = {}
    newState[stateTarget] = newValues

    this.setState(newState)
  }

  selectAll (fieldType) {
    return (e) => {
      const enabled = e.target.checked

      const newState = Object.assign({}, this.state)
      Object.keys(newState[fieldType]).forEach((key) => {
        newState[fieldType][key] = enabled
      })

      this.setState(newState)
      setImmediate(() => this.constructFilterQuery())
    }
  }

  render () {
    const excludedTypes = Object.keys(this.state.placeTypes).filter(type => !this.state.placeTypes[type])
    const includedAmenities = Object.keys(this.state.amenities).filter(type => this.state.amenities[type])
    const excludeQS = excludedTypes.length ? `exclude=${excludedTypes.join(',')}` : ''
    const includeQS = includedAmenities.length ? `amenities=${includedAmenities.join(',')}` : ''
    const downloadQueryString = excludeQS || includeQS ? `?${[excludeQS, includeQS].join('&')}` : ''

    return <main className='content searchResults'>
      <div className='row'>
        <div className='small-12 columns'>
          <h2 style={{ marginBottom: 0, marginTop: 15 }}>Places in {this.props.searchResults.countryName}</h2>
          <h5 style={{ marginTop: 0, marginBottom: 15 }}>{this.props.searchResults.total} results | Page {this.props.searchResults.currentPage} of {this.props.searchResults.pages} {includeQS || excludeQS ? '| Filters applied' : ''}</h5>
        </div>
        <div className='small-12 columns'>
          <p style={{ margin: 0 }}>Download as:
            <a style={{ marginLeft: 5 }} download={`iOverlander-places-${getSlug(this.props.searchResults.countryName)}.gpx`} href={`/api/download/${this.props.searchResults.currentCountry}/gpx${downloadQueryString}`}>GPX</a>
            <a style={{ marginLeft: 5 }} download={`iOverlander-places-${getSlug(this.props.searchResults.countryName)}.csv`} href={`/api/download/${this.props.searchResults.currentCountry}/csv${downloadQueryString}`}>CSV</a>
            <a style={{ marginLeft: 5 }} download={`iOverlander-places-${getSlug(this.props.searchResults.countryName)}.json`} href={`/api/download/${this.props.searchResults.currentCountry}/json${downloadQueryString}`}>JSON</a>
          </p>
        </div>
      </div>

      <div className='row'>
        <div className='small-12-columns'>
          <ReactPaginate pageNum={this.props.searchResults.pages}
            pageRangeDisplayed={5}
            marginPagesDisplayed={2}
            forceSelected={this.state.currentPage - 1}
            containerClassName='searchResults-pagination'
            clickCallback={this.paginate} />
        </div>
      </div>

      <form ref='form' className='row'>
        <div className='small-3 columns searchResults-filters'>
          <section className='searchResults-filters-group'>
            <h5>Country</h5>
            <fieldset>
              <select name='country' id='country' defaultValue={this.props.searchResults.currentCountry} onChange={this.constructFilterQuery}>
                {Object.keys(filters.countries).map((country, i) => {
                  return <option key={i} value={filters.countries[country]}>{country}</option>
                })}
              </select>
            </fieldset>
          </section>

          <section className='searchResults-filters-group'>
            <h5>Place Types</h5>
            <fieldset>
              <ul>
                <li>
                  <input onChange={this.selectAll('placeTypes')} defaultChecked={true} defaultValue='all' id='select-all-types' type='checkbox' />
                  <label htmlFor='select-all-types'>Select/Deselect All</label>
                  <br />
                </li>
                {this.props.searchResults.placeTypes.map((type, i) => {
                  return <li key={i}>
                    <input type='checkbox' checked={this.state.placeTypes[type.id.toString()]} value={type.id} onChange={this.constructFilterQuery} id={`placeType-${i}`} />
                    <label htmlFor={`placeType-${i}`}>{type.name}</label>
                  </li>
                })}
              </ul>
            </fieldset>
          </section>

         <section className='searchResults-filters-group'>
            <h5>Place last visited</h5>
            <fieldset>
              <ul>
                {this.lastVisitedRanges.map((i) => {
                  return <li key={i[0]}>
                    <input type='radio' checked={this.state.lastVisited==i[0]} value={i[0]} onChange={this.constructFilterQuery} name='last_visited' id={`last_visited-${i[0]}`} />
                    <label htmlFor={`last_visited-${i}`}>{i[1]}</label>
                  </li>
                })}
              </ul>
            </fieldset>
          </section>

         

          <section className='searchResults-filters-group'>
            <h5>Required Amenities</h5>
            <fieldset>
              <ul>
                {Object.keys(filters.amenities).map((type, i) => {
                  return <li key={i}>
                    <input id={`amenities-${i}`} checked={this.state.amenities[filters.amenities[type]]} type='checkbox' onChange={this.constructFilterQuery} value={filters.amenities[type]} />
                    <label htmlFor={`amenities-${i}`}>{type}</label>
                  </li>
                })}
              </ul>
            </fieldset>
          </section>
        </div>
        <div className='small-9 columns results'>
          {this.props.searchResults.results.map((location, i) => <PlaceCard useNavLink={true} key={i} location={location} truncate={400} />)}
        </div>
      </form>

      <div className='row'>
        <div className='small-12-columns'>
          <ReactPaginate pageNum={this.props.searchResults.pages}
            pageRangeDisplayed={5}
            marginPagesDisplayed={2}
            forceSelected={this.state.currentPage - 1}
            containerClassName='searchResults-pagination'
            clickCallback={this.paginate} />
        </div>
      </div>
    </main>
  }

}

CountryPlacesList.contextTypes = {
  dispatch: PropTypes.func
}

CountryPlacesList.propTypes = {
  searchResults: PropTypes.object
}

export default connect((state) => {
  return {
    placeTypes: state.placeTypes,
    searchResults: state.searchResults
  }
}, (dispatch) => {
  return bindActionCreators({
    searchForPlacesAction
  }, dispatch)
})(CountryPlacesList)
