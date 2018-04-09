import React, { PropTypes } from 'react'
import constructStaticAssetUrl from '../helpers/staticAssetUrl'

class Html extends React.Component {
  render () {
    const searchResults = this.props.store.getState().searchResults
    return <html>
      <head>
        <title>{this.props.title || this.props.store.getState().pageTitle}</title>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href={constructStaticAssetUrl("icons/favicon.ico")} />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/leaflet.css' integrity='sha256-bOWY8F32FGGbNDMPAnwWl/Lv9CKen4IQsNZ4RU9rcs0=' crossOrigin='anonymous' />
        <link href='//fonts.googleapis.com/css?family=Oxygen:400,700|Source+Sans+Pro:400,700,300' rel='stylesheet' type='text/css' />
        {/* TODO: clean up below, shouldn't be in main html block */}
        {searchResults && searchResults.currentPage >= 1 && searchResults.currentPage < searchResults.pages && <link rel='next' href={`/country_places_list/${searchResults.currentCountry}/${searchResults.currentPage + 1}`} />}
        {searchResults && searchResults.currentPage <= searchResults.pages && searchResults.currentPage > 1 && <link rel='prev' href={`/country_places_list/${searchResults.currentCountry}/${searchResults.currentPage - 1}`} />}
        {searchResults && <link rel='canonical' href={`/country_places_list/${searchResults.currentCountry}/1`} />}
        {!!this.props.cssUrl && <link rel='stylesheet' href={this.props.cssUrl} />}
        <script dangerouslySetInnerHTML={{__html: "window.__CONFIG__ = "+JSON.stringify(this.props.clientConfig)}} />
      </head>
      <body>
        <div id='app' dangerouslySetInnerHTML={{__html: this.props.html}} />
        <script nonce={this.props.nonce} dangerouslySetInnerHTML={{__html: this.props.applicationState}} />
        <script src={this.props.jsUrl}></script>
        <script src='https://open.mapquestapi.com/sdk/leaflet/v2.2/mq-map.js?key=uNa6nVBj1KegshVWQjnbqiAjGzQje01C'></script>
      </body>
    </html>
  }
}

Html.propTypes = {
  applicationState: PropTypes.string,
  html: PropTypes.string,
  title: PropTypes.string,
  jsUrl: PropTypes.string.isRequired,
  cssUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  store: PropTypes.object,
  nonce: PropTypes.string
}

export default Html
