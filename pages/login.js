import { Component } from 'react';
import fetch from 'isomorphic-unfetch';
import Head from 'next/head';
import { logins } from '../utils/auth';

class Login extends Component {
  static getInitialProps ({ req }) {
    const protocol = process.env.NODE_ENV === 'production' ? 'http' : 'http'
    const apiUrl = process.browser
      ? `${protocol}://${window.location.hostname}:3001/api/v1/signIn`
      : `${protocol}://${req.headers.host}/api/v1/signIn`

    return { apiUrl }
  }

  constructor (props) {
    super(props)

    this.state = { login: '', password: '', error: '' }
    this.handleChange = this.handleChange.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (event) {
    this.setState({ login: event.target.value })
  }

  handleChangePassword (event) {
    this.setState({ password: event.target.value })
  }

  async handleSubmit (event) {
    event.preventDefault()
    this.setState({ error: '' })
    const login = this.state.login
    const password = this.state.password
    const url = this.props.apiUrl

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login:login, password: password })
      })
      if (response.ok) {
        const { token, data } = await response.json()
        console.log(data);
        logins({ token, data })
      } else {
        console.log('Login failed. ,' + response)
        let error = new Error(response.msg)
        error.response = response
        throw error
      }
    } catch (error) {
      console.error(
        'You have an error in your code or there are Network issues.',
        error
      )
      this.setState({ error: error.msg })
    }
  }

  render () {
    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
          <link rel="stylesheet" href="/static/fonts/roboto/stylesheet.css" rel="stylesheet"/>
          <link rel="stylesheet" href="/static/style.css"rel="stylesheet"/>
          <title></title>
        </Head> 
        <main className="container">
          <div className="row align-items-center justify-content-center auth-container">
            <div className="col-lg-4">
              <div className="card shadow">
                <div className="card-header bg-white text-center">
                  <h4 className="text-uppercase py-3 mb-0">Login</h4>
                </div>
                <form onSubmit={this.handleSubmit}>
                  <div className="card-body">
                    <div className="form-group">
                      <label for="loginEmail">Username</label>
                      <input
                        type='text'
                        id='login'
                        className="form-control"
                        name='login'
                        value={this.state.login}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label for="loginPassword">Password</label>
                      <input
                        type='text'
                        className="form-control"
                        id='password'
                        name='password'
                        value={this.state.password}
                        onChange={this.handleChangePassword}
                      />
                    </div>
                  </div>
                  <div className="card-footer bg-white d-flex justify-content-between">
                    <a href="forgot-password.html" className="btn btn-link">Lupa sandi?</a>
                    <button type="submit" className="btn btn-primary">Masuk</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default Login
