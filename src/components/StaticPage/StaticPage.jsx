import React, { PropTypes } from 'react'

class StaticPage extends React.Component {
  render () {
    return <main className='content is-flex' style={{display: 'block'}}>
      <div className='row'>
        <div className='small-12 columns' dangerouslySetInnerHTML={{__html: this.props.staticContent}} />
      </div>
    </main>
  }

}

StaticPage.propTypes = {
  staticContent: PropTypes.string
}

export default StaticPage
