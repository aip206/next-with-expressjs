import { Component } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import fetch from 'isomorphic-unfetch';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage,withFormik } from 'formik';
import http from '../../utils/http-service.js';

import * as Yup from 'yup';
import Router from 'next/router';
import swal from 'sweetalert';
import { withRouter } from 'next/router'
import axioss from 'axios';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const getYupValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Format Email salah!')
      .required('Email tidak boleh kosong!'),
    name: Yup.string()
      .required('Nama Departemen tidak boleh kosong!'),
    nama:  Yup.string()
        .required('Nama Penanggung Jawab tidak boleh kosong!'),
    phone:  Yup
    .string()
        .required('Nomor Telepon Penanggung Jawab tidak boleh kosong!')
        .matches(phoneRegExp, 'Nomor Telepon Penanggung Jawab tidak valid')
  })


class ProfileDepartement extends React.Component {
    constructor(props){
        super(props)
       
        this.state = {
            initialValues: {
                        id:'',
                        name:'',
                        email:'',
                        nama:'',
                        phone:'',
                        idpic:''
                        }
        }
    }
    componentDidMount () {
        if(process.browser){
            let data = JSON.parse(window.localStorage.getItem("myData"))
            http.get('/api/v1/get-profile',{
                headers: {
                  'Authorization': cookie.get('token')
                } 
              })
              .then(response => {
                  return response.data
              })
              .then(data =>{ 
                  this.setState({initialValues :{ ... this.state.initialValues,
                      name : data[0].name,
                      login: data[0].login,
                      email : data[0].email,
                      nama : data[1].nama,
                      phone : data[1].phone,
                      id: data[0].id,
                      idpic:data[1].id
                  } })
              })
        }
    }
        
    render () {
        const MyEnhancedForm = withFormik({
            mapPropsToValues: () => (this.state.initialValues),
            validationSchema:() =>(getYupValidationSchema) ,
            handleSubmit: (values, { setSubmitting }) => {onSubmit(values)},
          
            displayName: 'BasicForm',
          })(EditForm);
                    
        return (
        <MyEnhancedForm/>
        
        )
    }
  }
function EditForm(props) {
    const { values,errors, touched, handleChange, handleSubmit,
        isSubmitting } = props
    return(
        <Layout title="Ubah Profil">
             <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active >Profil</Breadcrumb.Item>
            </Breadcrumb>
            <h3 className="title"><i className="fas fa-key fa-fw mr-2"></i>Profil</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                        <div className="form-group">
							<label for="addDeptName">Nama Departemen</label>
							<input type="text" disabled className="form-control" value={values.name} onChange={handleChange} name="name" id="addDeptName" />
                            {errors.name && touched.name ? <div className="error-message">{errors.name}</div> : null}

						</div>
                        <div className="form-group">
							<label for="addEmail">Email</label>
							<input type="email" disabled className="form-control" value={values.email} onChange={handleChange} name="email" id="addEmail" />
                            {errors.email && touched.email ? <div className="error-message">{errors.email}</div> : null}
						</div>
                        <div className="form-group">
							<label for="addNoPIC">Nama Penanggung Jawab</label>
							<input type="text" className="form-control" value={values.nama} onChange={handleChange} name="nama" id="addNoPic" />
                            {errors.nama && touched.nama ? <div className="error-message">{errors.nama}</div> : null}
                            
						</div>
                        <div className="form-group">
							<label for="addPicPhone">Nomor Telepon Penanggung Jawab</label>
							<div className="input-group">
								<div className="input-group-prepend">
									<span className="input-group-text">+62</span>
								</div>
								<input type="text" className="form-control" value={values.phone} onChange={handleChange} name="phone"  id="addPicPhone" />
							</div>
                            {errors.phone && touched.phone ? <div className="error-message">{errors.phone}</div> : null}
						</div>
                    </div>
                    <div className="card-footer">
                        <button type="submit"  className="btn btn-block btn-primary">Ubah Profil</button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}

function onSubmit (values,actions) {
    fetch('/api/v1/profile-user',{
        method: 'POST', 
        body: JSON.stringify(values), 
        headers:{
            'Content-Type': 'application/json',
            'Authorization': cookie.get('token')
        }
    })
    .then(response => {
        swal({
            title: "Edit",
            text: "Data Departemen Berhasil Diubah",
            icon: "success",
            button: "Ok",
          })
    })
    .catch(err => {
        swal({
            title: "Error",
            text: "Error => " + err.msg,
            icon: "error",
            button: "Ok",
          });
    })
}
  
export default withAuthSync(withRouter(ProfileDepartement));