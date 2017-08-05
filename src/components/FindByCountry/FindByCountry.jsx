import React, { PropTypes } from 'react'
import { AllHtmlEntities } from 'html-entities'
import { connect } from 'react-redux'
import NavLink from '../NavLink/NavLink'
import getSlug from 'speakingurl'

const entities = new AllHtmlEntities()

class FindByCountry extends React.Component {

  render () {
    return <main className='content'>
      <div className='row'>
        <div className='small-12 columns'>
          <h2 style={{ marginBottom: 0, marginTop: 15 }}>Download Places by Country</h2>
          <h5 style={{ marginTop: 0, marginBottom: 15 }}>Links which are grey cannot be downloaded as the country has no places to download</h5>

          <h6 style={{ marginBottom: 0 }}>Jump to:</h6>
          {this.props.placesData.map((region, i) => {
            return <a key={i} style={{ marginRight: 10, display: 'inline-block' }} href={`#${getSlug(region.name)}`}>{region.name}</a>
          })}

          {this.props.placesData.map((region, i) => {
            return <section key={i}>
              <h3 style={{ marginBottom: 15 }} id={getSlug(region.name)}>{region.name}</h3>
              <table>
              <thead>
                <tr>
                  <th>Country</th>
                  <th>View List</th>
                  <th>View On Map</th>
                  <th colSpan='3'>Download As</th>
                </tr>
              </thead>
                <tbody>
                  {(region.countries).map((country, i) => {
                    return <tr key={i}>
                      <td dangerouslySetInnerHTML={{__html: `${entities.encode(country.name)} (${country.places_count || 0} places)`}} />
                      <td><NavLink href={`/country_places_list/${country.id}/1`}>List</NavLink></td>
                      <td><a href={`/?lat=${country.latitude}&lng=${country.longitude}&zoom=7`}>Map</a></td>
                      <td><a disabled={country.places_count < 1} download={`iOverlander-places-${getSlug(country.name)}.gpx`} href={`/api/download/${country.id}/gpx`}>GPX</a></td>
                      <td><a disabled={country.places_count < 1} download={`iOverlander-places-${getSlug(country.name)}.csv`} href={`/api/download/${country.id}/csv`}>CSV</a></td>
                      <td><a disabled={country.places_count < 1} download={`iOverlander-places-${getSlug(country.name)}.json`} href={`/api/download/${country.id}/json`}>JSON</a></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </section>
          })}
        </div>
      </div>
    </main>
  }

}

FindByCountry.contextTypes = {
  dispatch: PropTypes.func
}

FindByCountry.propTypes = {
  placesData: PropTypes.array
}

export default connect(
  (state) => {
    return {
      placesData: state.placesData
    }
  }
)(FindByCountry)
