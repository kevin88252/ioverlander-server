import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import { Route, Switch } from 'react-router-dom'
import routes from '../config/routes'

if (process.env.BROWSER) {
  require('../assets/scss/MarkerCluster.Default.css')
  require('../assets/scss/shared/variables.scss')
  require('../assets/scss/foundation/foundation.scss')
  require('../assets/scss/global/layout.scss')
  require('../assets/scss/global/header.scss')
  require('../assets/scss/global/form.scss')
  require('../assets/scss/global/tables.scss')
  require('../assets/scss/global/buttons.scss')
  require('../assets/scss/global/footer.scss')
  require('../assets/scss/global/mediaPlayer.scss')
}

class Container extends React.Component {
  getChildContext () {
    return {
      dispatch: this.props.store.dispatch.bind(this.props.store),
      store: this.props.store
    }
  }

  render () {
    return <div className='app-inner'>
      <Header user={this.props.loggedInUser} />
        <Switch>
          {routes.map(route => {
            return <Route exact {...route} key={route.path} />
          })}
        </Switch>
      <Footer />
    </div>
  }
}

Container.childContextTypes = {
  dispatch: PropTypes.func,
  store: PropTypes.object
}

Container.propTypes = {
  handler: PropTypes.func,
  dispatch: PropTypes.func,
  store: PropTypes.object,
  loggedInUser: PropTypes.object
}

export default Container
