import React, { PropTypes } from 'react'
import createValidatedForm from '../Validation/ValidatedForm'
import request from 'superagent'

if (process.env.BROWSER) {
  require('./registration.scss')
}

const FIELDS = ['user_name', 'user_email', 'user_password', 'user_password_confirm', 'blog_name', 'blog_url']

export const validateForm = (fields) => {
  const errors = {}

  ;['user_name', 'user_email', 'user_password', 'user_password_confirm', 'blog_name'].forEach((val) => {
    if (!fields[val]) { errors[val] = 'This field is required' }
  })

  if (fields.user_password && fields.user_password.length < 8) {
    errors['user_password'] = 'Your password must be at least 8 characters'
  }

  if (fields.user_password && (fields.user_password_confirm !== fields.user_password)) {
    errors['user_password_confirm'] = 'Your passwords do not match'
  }

  if (fields['user_email']) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields['user_email'])) {
      errors['user_email'] = 'This doesn\'t look like a real email address.'
      return errors
    }

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

  return errors
}

class UserRegistration extends React.Component {

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

      request.post('/api/user/create').send(values).end((err, resp) => {
        res()
        this.setState({
          registrationComplete: true
        })
      })
    })
  }

  render () {
    const fields = Object.keys(this.props.fields).reduce((obj, field) => {
      obj[field] = {...this.props.fields[field]}
      delete obj[field].isValidating
      delete obj[field].touched
      delete obj[field].error
      return obj
    }, {})

    const {
      user_name,
      user_email,
      user_password,
      user_password_confirm,
      blog_name,
      blog_url
    } = this.props.fields

    return <main className='content is-flex' style={{ display: 'block' }}>
      <section className='login-container' style={{width: '100%'}}>
        <div className='row'>
          <div className='small-12 medium-centered medium-8 large-6 columns center'>
            <h4 style={{ textAlign: 'center' }}>Hey, Nice to meet you</h4>
            <p>To create an account fill in the form below - we'll create the account right away so you can get on with your travels.</p>

            {!this.state.registrationComplete && <form ref='form' noValidate method='POST' action='/api/user/create' className='input-form registration-form' onSubmit={this.props.onSubmit(this.onSubmit)}>
              <label htmlFor='user_name'>Name {user_name.error && <span className='error'>{user_name.error}</span>}</label>
              <p>This is your name - So we know what to call you.</p>
              <input type='text' name='user_name' id='user_name' {...fields.user_name} />

              <label htmlFor='user_email'>E-Mail address {user_email.error && <span className='error'>{user_email.error}</span>}</label>
              <p>Your email address - We'll use this to confirm your account.</p>
              <input type='email' name='user_email' id='user_email' {...fields.user_email} />

              <label htmlFor='user_password'>Password {user_password.error && <span className='error'>{user_password.error}</span>}</label>
              <p>Your password - Whatever you like, as long as it's 8 characters or more.</p>
              <input type='password' name='user_password' id='user_password' {...fields.user_password} />

              <label htmlFor='user_password_confirm'>Confirm Password {user_password_confirm.error && <span className='error'>{user_password_confirm.error}</span>}</label>
              <input type='password' name='user_password_confirm' id='user_password_confirm' {...fields.user_password_confirm} />

              <label htmlFor='blog_name'>Blog Name {blog_name.error && <span className='error'>{blog_name.error}</span>}</label>
              <p>This is the name that will show up on all of your check-ins and places. It'll also be used to make a page which tracks your route based on check-ins.</p>
              <input type='text' name='blog_name' id='blog_name' {...fields.blog_name} />

              <label htmlFor='blog_url'>Blog URL {blog_url.error && <span className='error'>{blog_url.error}</span>}</label>
              <p>Keep a blog? Stick the URL in here so other overlanders can take a look.</p>
              <input type='text' name='blog_url' id='blog_url' {...fields.blog_url} />

              <button type='submit' disabled={this.props.isValidating || this.state.isSubmitting} className='btn'>{this.props.isValidating ? 'Validating...' : this.state.isSubmitting ? 'Creating the user...' : 'Register!'}</button>
            </form>}

            {this.state.registrationComplete && <p style={{ textAlign: 'center' }}>Okay, we're all done. Click <a href='/users/sign_in'>here</a> to go ahead and log-in.</p>}

          </div>
        </div>
      </section>
    </main>
  }

}

UserRegistration.propTypes = {
  fields: PropTypes.object,
  onSubmit: PropTypes.func,
  isValidating: PropTypes.bool,
  isSubmitting: PropTypes.bool
}

UserRegistration.contextTypes = {
  dispatch: PropTypes.func
}

UserRegistration.displayName = 'UserRegistration'

export default createValidatedForm(UserRegistration, FIELDS, validateForm)
