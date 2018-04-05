import React, { PropTypes } from 'react'
import RequestPasswordReset from './RequestPasswordResetForm'
import PasswordResetForm from './ResetPasswordForm'

class PasswordReset extends React.Component {

  render () {
    if (this.props.params && this.props.params.token && this.props.store.getState().reset_user_id) {
      return <PasswordResetForm {...this.props} />
    } else if (this.props.params && this.props.params.token && !this.props.store.getState().reset_user_id) {
      return <main className='content is-flex' style={{ display: 'block' }}>
        <section className='login-container' style={{width: '100%'}}>
          <div className='row'>
          <div className='small-12 medium-centered medium-8 large-6 columns center'>
              <h4 style={{ textAlign: 'center' }}>Uh oh!</h4>
              <p>This reset token seems to be invalid. <a href='/users/reset_password'>Reset your password</a> to get a fresh one.</p>
            </div>
          </div>
        </section>
      </main>
    } else {
      return <RequestPasswordReset {...this.props} />
    }
  }
}

PasswordReset.propTypes = {
  params: PropTypes.object,
  store: PropTypes.object
}

export default PasswordReset
