import { Component } from 'react';
import fetch from 'isomorphic-unfetch';
import Head from 'next/head';
import swal from 'sweetalert';
import { Formik, FieldArray, Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { withRouter } from 'next/router';
import Router from 'next/router';
import axioss from 'axios';
import cookie from 'js-cookie'

const getYupValidationSchema =Yup.object({
    password: Yup.string()
      .min(8, `Sandi minimal 8 karakter!`)  
      .required('Sandi tidak boleh kosong!'),
      confirmpassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Konfirmasi Sandi Harus sama dengan Sandi!')
  });

class ResetPassword extends Component {
  constructor (props) {
    super(props)
    this.state = { initialValues:{
        password: '',confirmpassword:'', email: this.props.router.query.id, token:this.props.router.query.token }
    }
  }

  render () {
    return(
        <Formik
            validationSchema={getYupValidationSchema}
            initialValues={this.state.initialValues}
            onSubmit={onSubmit}
            render={ props =>{
               return <CreateForm  {...props} />
            }}
        />
    )
  }
}

function CreateForm(props) {
    const { values,errors, handleChange, handleSubmit,  isSubmitting} = props
    return (
        <div>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
            <link rel="stylesheet" href="/static/fonts/roboto/stylesheet.css" rel="stylesheet"/>
            <link rel="stylesheet" href="/static/style.css"rel="stylesheet"/>
            <title>Reset Password</title>
          </Head> 
          <main className="container">
              <div className="row align-items-center justify-content-center auth-container">
                  <div className="col-lg-4">
                      <div className="card shadow">
                          <div className="card-header bg-white text-center">
                              <h4 className="text-uppercase py-3 mb-0">Pembaruan Sandi</h4>
                          </div>
                          <form onSubmit={handleSubmit}>
                              <div className="card-body">
                                  <div className="form-group">
                                      <label for="password">Sandi</label>
                                      <input 
                                       type='password'
                                       id='password'
                                       className="form-control"
                                       name='password'
                                       value={values.password}
                                       onChange={handleChange}
                                      />
                                       <ErrorMessage name="password" className="error-message" 
                                       component="div" />
                                  </div>
                                  <div className="form-group">
                                      <label for="passwordConfirm">Konfirmasi Sandi</label>
                                      <input 
                                      type='password'
                                      id='confirmpassword'
                                      className="form-control"
                                      name='confirmpassword'
                                      value={values.confirmpassword}
                                      onChange={handleChange}
                                      />
                                       <ErrorMessage name="confirmpassword" className="error-message" 
                                       component="div" />
                                  </div>
                              </div>
                              <div className="card-footer bg-white d-flex justify-content-between">
                                  <a href="/login" className="btn btn-link">Masuk</a>
                                  <button type="submit" className="btn btn-primary">Perbarui Sandi</button>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </main>
        </div>
      )
}

function onSubmit (values,actions) {
    var headers = {
        'Content-Type': 'application/json',
    }
    axioss.post('/api/v1/reset-password',values)
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Password Berhasil Direset silahkan melakukan Login",
            icon: "success",
            button: "Ok",
          }).then(()=>{
            cookie.remove('token');
            Router.push('/login')
          });
    })
    .catch(err => {
        swal({
            title: "Error",
            text: "Error => " + err,
            icon: "error",
            button: "Ok",
          });
    })
}

export default withRouter(ResetPassword)
