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
import http from '../../utils/http-service';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const getYupValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Format Email salah!')
      .required('Email tidak boleh kosong!'),
    nama: Yup.string()
      .required('Nama Penanggung Jawab tidak boleh kosong!'),
    name: Yup.string()
        .required('Nama Departemen tidak boleh kosong!'),
    phone: Yup.string()
    .required('Nomor Telepon Penanggung Jawab tidak boleh kosong!')
    .matches(phoneRegExp, 'Nomor Telepon Penanggung Jawab tidak valid')
  })


class DepartementEdit extends React.Component {
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
        http.get('/api/v1/departement/'+this.props.router.query.id,{
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
        .catch(err => {
          swal({
            title: "Error",
            text: "Error => " + err,
            icon: "error",
            button: "Ok",
          })
        }
        )}
        
    render () {
        const MyEnhancedForm = withFormik({
            mapPropsToValues: () => (this.state.initialValues),
            validationSchema:() =>(getYupValidationSchema) ,
            // Custom sync validation
            // validate: values => {
            //   const errors = {};
          
            //   if (!values.name) {
            //     errors.name = 'Required';
            //   }
          
            //   return errors;
            // },
          
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
        <Layout title="Ubah Departemen">
             <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/departement/list">Departemen</Breadcrumb.Item>
                <Breadcrumb.Item active>Ubah</Breadcrumb.Item>
            </Breadcrumb>
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Departemen - Tambah</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                        <div className="form-group">
							<label for="addDeptName">Nama Departemen</label>
							<input type="text" className="form-control" value={values.name} onChange={handleChange} name="name" id="addDeptName" />
                            <ErrorMessage name="name" className="error-message" component='div'/>
						</div>
                        <div className="form-group">
							<label for="addEmail">Email</label>
							<input type="email" className="form-control" value={values.email} onChange={handleChange} disabled name="email" id="addEmail" />
                            <ErrorMessage name="email" className="error-message" component='div'/>
						</div>
                        <div className="form-group">
							<label for="addNoPIC">Nama Penanggung Jawab</label>
							<input type="text" className="form-control" value={values.nama} onChange={handleChange} name="nama" id="addNoPic" />
                            <ErrorMessage name="nama" className="error-message" component='div'/>
						</div>
                        <div className="form-group">
							<label for="addPicPhone">Nomor Telepon Penanggung Jawab</label>
							<div className="input-group">
								<div className="input-group-prepend">
									<span className="input-group-text">+62</span>
								</div>
								<input type="text" className="form-control" value={values.phone} onChange={handleChange} name="phone"  id="addPicPhone" />
							</div>
                            <ErrorMessage name="phone" className="error-message" component='div'/>
						</div>
                    </div>
                    <div className="card-footer">
                        <button type="submit" disabled= {isSubmitting} className="btn btn-block btn-primary">Perbarui Departemen</button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}

function onSubmit (values,actions) {
    http
    .put('/api/v1/departement/'+values.id,values,{
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
          }).then(()=>{
            Router.push('/departement/list')
          });
    })
}
  
export default withAuthSync(withRouter(DepartementEdit));