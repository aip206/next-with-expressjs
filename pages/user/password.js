import { Component } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import fetch from 'isomorphic-unfetch';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage,withFormik } from 'formik';

import * as Yup from 'yup';
import Router from 'next/router';
import swal from 'sweetalert';
import { withRouter } from 'next/router'
import axioss from 'axios';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const getYupValidationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, `Password has to be longer than 6 characters!`)  
      .required('Password is required!'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  })

  const initialValues = {
    password:'',
    confirmPassword:''
    }
class UpdatePassword extends React.Component {
    constructor(props){
        super(props)
    
    }
        
    render () {
        return(
        <Formik
            validationSchema={getYupValidationSchema}
            initialValues={initialValues}
            onSubmit={onSubmit}
            render={ props =>{
               return <CreateForm  {...props} />
            }}
        />
        )
    }
}

function CreateForm(props) {
    const { values,errors, touched, handleChange, handleSubmit,
        isSubmitting } = props
    return(
        <Layout>
             <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active >Sandi</Breadcrumb.Item>
            </Breadcrumb>
            <h3 className="title"><i className="fas fa-key fa-fw mr-2"></i>Profil</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                    <div class="form-group">
                        <label for="editPassword">Sandi</label>
                        <input type="password" class="form-control" value={values.password} onChange={handleChange} name="password" id="editPassword" required/>
                        {errors.password && touched.password ? <div className="error-message">{errors.password}</div> : null}

                    </div>
                    <div class="form-group">
                        <label for="editPasswordConfirm">Konfirmasi Sandi</label>
                        <input type="password" class="form-control" value={values.confirmPassword} onChange={handleChange} name="confirmPassword" id="editPasswordConfirm" required/>
                        {errors.confirmPassword && touched.confirmPassword ? <div className="error-message">{errors.confirmPassword}</div> : null}

                    </div>
                </div>
                    <div className="card-footer">
                        <button type="submit"  className="btn btn-block btn-primary">Ubah Sandi</button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}

function onSubmit (values,actions) {
    console.log(values)
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': cookie.get('token')
    }
    axioss.post('/api/vi/change-password',values,{'headers':headers})
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Ubah Password Berhasil",
            icon: "success",
            button: "Ok",
          }).then(()=>{
            Router.push('/')
          });
    })
    .catch(err => {
        swal({
            title: "Error",
            text: "Error => " + err.errors,
            icon: "error",
            button: "Ok",
          });
    })
}
  
export default withAuthSync(withRouter(UpdatePassword));