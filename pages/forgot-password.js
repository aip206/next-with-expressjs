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
    email: Yup.string().required('Email tidak boleh kosong!')
  });

class ForgotPassword extends Component {
  constructor (props) {
    super(props)
    this.state = { initialValues:{
        email: '' }
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
            <title>Lupa Password</title>
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
                                      <label for="password">Email</label>
                                      <input 
                                       type='email'
                                       id='email'
                                       className="form-control"
                                       name='email'
                                       value={values.email}
                                       onChange={handleChange}
                                      />
                                       <ErrorMessage name="email" />
                                  </div>
                              </div>
                              <div className="card-footer bg-white d-flex justify-content-between">
                                  <a href="/login" className="btn btn-link">Kembali</a>
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
    axioss.post('/api/v1/forgot-password',values)
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Silahkan Cek Email Anda, Sistem telah mengirimkan Activate Link",
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

export default withRouter(ForgotPassword)
