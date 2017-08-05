import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

if (process.env.BROWSER) {
  require('./Login.scss')
}

class Login extends React.Component {

  render () {
    return <main className='content blogDetails is-flex'>
      <section className='login-container' style={{width: '100%'}}>
        <div className='row'>
          <div className='small-12 medium-centered medium-4 large-3 columns center'>
            <h4 style={{ textAlign: 'center' }}>Have we met?</h4>
            <p>Fill in your details below and we'll send you on your way.</p>

            {this.props.flashMessage[0] && <span className='flash-message'>{this.props.flashMessage[0]}</span>}
            <form method='POST' action='/login' className='input-form'>
              <label htmlFor='username'>Email:</label>
              <input type='text' name='username' />

              <label htmlFor='password'>Password:</label>
              <input type='password' name='password' />
              <button type='submit' className='btn'>Login!</button>
            </form>

            <a style={{ marginTop: 15, display: 'block', textAlign: 'center' }} href='/users/reset_password'>Forgotten your pasword? Let's reset it!</a>

            <a style={{ marginTop: 15, display: 'block', textAlign: 'center' }} href='/users/sign_up'>No account? Sign up! <small style={{ display: 'block' }}>It only takes 30 seconds (we promise)</small></a>
          </div>
      </div>
      </section>
    </main>
  }

}

Login.contextTypes = {
  dispatch: PropTypes.func
}

Login.propTypes = {
  selectedBlog: PropTypes.object
}

export default connect((state) => {
  return {
    flashMessage: state.flashMessage
  }
})(Login)
