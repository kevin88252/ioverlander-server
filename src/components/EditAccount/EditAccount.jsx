import React, { PropTypes } from 'react'
import createValidatedForm from '../Validation/ValidatedForm'
import request from 'superagent'
import { connect } from 'react-redux'

if (process.env.BROWSER) {
  require('./editAccount.scss')
}

const FIELDS = ['user_name', 'user_email', 'user_password', 'user_password_confirm', 'blog_name', 'blog_url', 'user_current_pasword', 'user_email_hidden']

export const validateForm = (fields) => {
  const errors = {}

  ;['user_name', 'user_email', 'blog_name'].forEach((val) => {
    if (!fields[val]) { errors[val] = 'This field is required' }
  })

  if (fields.user_password && fields.user_password.length < 8) {
    errors['user_password'] = 'Your password must be at least 8 characters'
  }

  if (fields.user_password && (fields.user_password_confirm !== fields.user_password)) {
    errors['user_password_confirm'] = 'Your passwords do not match'
  }

  if (!fields.user_current_pasword) {
    errors['user_current_pasword'] = 'We need your current password to save these changes'
  }

  if (fields['user_email']) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields['user_email'])) {
      errors['user_email'] = 'This doesn\'t look like a real email address.'
      return errors
    }

    if (fields['user_email'] !== fields['user_email_hidden']) {
      return new Promise((resolve, rej) => {
        request.post('/api/checkEmail').send({ email: fields['user_email'] }).end((err, res) => {
          if (err) rej()

          if (res && res.body && res.body.exists) {
            errors['user_email'] = 'An account with this email address already exists.'
          }

          resolve(errors)
        })
      })
    }
  }

  return errors
}

class EditAccount extends React.Component {

  constructor () {
    super()

    this.state = {
      registrationComplete: false
    }

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit () {
    const values = {}
    const elements = [...this.refs.form.elements]

    elements.forEach((el) => {
      if (el.type !== 'radio' && el.value) {
        values[el.name] = el.value
      }
    })

    return new Promise((res, rej) => {
      this.setState({
        isSubmitting: true
      })

      request.post('/api/user/update').send(values).end((err, resp) => {
        if (resp.body.errors) {
          this.setState({ isSubmitting: false })
          this.props.displayErrorsFromServer(resp.body.errors)
          return res()
        }

        res()
        this.setState({
          registrationComplete: true
        })
      })
    })
  }

  render () {
    return <main className='content is-flex' style={{ display: 'block' }}>
      <section className='login-container' style={{width: '100%'}}>
        <div className='row'>
          <div className='small-12 medium-centered medium-8 large-6 columns center'>
            <h4 style={{ textAlign: 'center' }}>Time to make some changes</h4>
            {!this.state.registrationComplete && <p>We heard you wanted to update some account details. Please, go ahead.</p>}

            {!this.state.registrationComplete && <form ref='form' noValidate method='POST' action='/api/user/create' className='input-form registration-form' onSubmit={this.props.onSubmit(this.onSubmit)}>
              <label htmlFor='user_name'>Name {this.props.fields['user_name'].error && <span className='error'>{this.props.fields['user_name'].error}</span>}</label>
              <p>If your name has changed, this is where you put it.</p>
              <input type='text' name='user_name' id='user_name' {...this.props.fields['user_name']} />

              <label htmlFor='user_email'>E-Mail address {this.props.fields['user_email'].error && <span className='error'>{this.props.fields['user_email'].error}</span>}</label>
              <p>Your email address.</p>
              <input type='email' name='user_email' id='user_email' {...this.props.fields['user_email']} />
              <input type='hidden' name='user_email_hidden' id='user_email_hidden' {...this.props.fields['user_email_hidden']} />

              <label htmlFor='user_password'>Password {this.props.fields['user_password'].error && <span className='error'>{this.props.fields['user_password'].error}</span>}</label>
              <p>Leave this and the confirmation blank if you don't want to change it</p>
              <input type='password' name='user_password' id='user_password' {...this.props.fields['user_password']} />

              <label htmlFor='user_password_confirm'>Confirm Password {this.props.fields['user_password_confirm'].error && <span className='error'>{this.props.fields['user_password_confirm'].error}</span>}</label>
              <input type='password' name='user_password_confirm' id='user_password_confirm' {...this.props.fields['user_password_confirm']} />

              <label htmlFor='blog_name'>Blog Name {this.props.fields['blog_name'].error && <span className='error'>{this.props.fields['blog_name'].error}</span>}</label>
              <input type='text' name='blog_name' id='blog_name' {...this.props.fields['blog_name']} />

              <label htmlFor='blog_url'>Blog URL {this.props.fields['blog_url'].error && <span className='error'>{this.props.fields['blog_url'].error}</span>}</label>
              <input type='text' name='blog_url' id='blog_url' {...this.props.fields['blog_url']} />

              <label htmlFor='user_current_pasword'>Your current password {this.props.fields['user_current_pasword'].error && <span className='error'>{this.props.fields['user_current_pasword'].error}</span>}</label>
              <p>We need your current password to save these changes.</p>
              <input type='password' name='user_current_pasword' id='user_current_pasword' {...this.props.fields['user_current_pasword']} />

              <button type='submit' disabled={this.props.isValidating || this.state.isSubmitting} className='btn'>{this.props.isValidating ? 'Validating...' : this.state.isSubmitting ? 'Saving your changes...' : 'Update Account Details'}</button>
            </form>}

            {this.state.registrationComplete && <p style={{ textAlign: 'center' }}>Okay, we're all done. Your account details have been updated.</p>}

          </div>
        </div>
      </section>
    </main>
  }

}

EditAccount.propTypes = {
  fields: PropTypes.object,
  onSubmit: PropTypes.func,
  isValidating: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  displayErrorsFromServer: PropTypes.func
}

EditAccount.contextTypes = {
  dispatch: PropTypes.func
}

EditAccount.displayName = 'EditAccountForm'

export default connect((state) => {
  return {
    loggedInUser: state.sessionUser,
    selectedBlog: state.selectedBlog
  }
})(createValidatedForm(EditAccount, FIELDS, validateForm, {
  user_email: (props) => props.loggedInUser.email,
  user_email_hidden: (props) => props.loggedInUser.email,
  user_name: (props) => props.loggedInUser.name,
  blog_name: (props) => props.selectedBlog.name,
  blog_url: (props) => props.selectedBlog.url
}))
