import { Component } from 'react';
import Head from 'next/head';
import { logins } from '../utils/auth';
import axioss from 'axios';
import Router from 'next/router';
import { withRouter } from 'next/router';
import swal from 'sweetalert';
import cookie from 'js-cookie'

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

    this.state = { email: '', password: '', error: '' }
    this.handleChange = this.handleChange.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.goBack = this.goBack.bind(this); // i think you are missing this

  }

  componentDidMount(){
    if(cookie.get("token")){
      this.goBack();
    }
  }

  goBack(){
    this.props.router.back();
    console.log(this.props)
  }

  handleChange (event) {
    this.setState({ email: event.target.value })
  }

  handleChangePassword (event) {
    this.setState({ password: event.target.value })
  }

  async handleSubmit (event) {
    event.preventDefault()
    this.setState({ error: '' })
    const email  = this.state.email
    const password = this.state.password
    const url = this.props.apiUrl

    try {
     const response = axioss.post('/api/v1/signIn',{ email:email, password: password },{
        headers: { 'Content-Type': 'application/json' }
      })
      response
      .then((response)=>{
         const { token, data } = response.data
         
        logins({ token, data: data })
      })
      .catch((err)=>{
        swal({
          title: "Error",
          text:  err.response.data.msg,
          icon: "error",
          button: "Ok",
        })
      })
    } catch (error) {
      console.error(
        'You have an error in your code or there are Network issues.',
        error
      )
      this.setState({ error: error.msg })
      swal({
        title: "Error",
        text: "Error => " + error,
        icon: "error",
        button: "Ok",
      })
    }
  }

  render () {
    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
          <link rel="stylesheet" href="/static/fonts/roboto/stylesheet.css" rel="stylesheet"/>
          <link rel="stylesheet" href="/static/style.css"rel="stylesheet"/>
          <title>Login</title>
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
                      <label for="loginEmail">Email</label>
                      <input
                        type='text'
                        id='email'
                        className="form-control"
                        name='email'
                        value={this.state.email}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label for="loginPassword">Password</label>
                      <input
                        type='password'
                        className="form-control"
                        id='password'
                        name='password'
                        value={this.state.password}
                        onChange={this.handleChangePassword}
                      />
                    </div>
                  </div>
                  <div className="card-footer bg-white d-flex justify-content-between">
                    <a href="/forgot-password" className="btn btn-link">Lupa sandi?</a>
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

export default withRouter(Login);
