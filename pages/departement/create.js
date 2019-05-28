import { Component } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import axioss from 'axios';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import swal from 'sweetalert';
import Breadcrumb from 'react-bootstrap/Breadcrumb'
const getYupValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email('E-mail is not valid!')
      .required('E-mail is required!'),
    name: Yup.string()
      .required('Nama Departemen is required!'),
    code_pic:  Yup.string()
        .required('No PIC is required!'),
    phone_pic:  Yup.string()
        .required('No Telpon is required!')
  })
const initialValues = {
    name:undefined,
    password:undefined,
    email:undefined,
    login:undefined,
    code_pic:undefined,
    phone_pic:undefined,
    role:'departement'
}


function DepartementCreate() {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={getYupValidationSchema}
        onSubmit={onSubmit}
        render={CreateForm}
      />
      
    )
  }
function CreateForm(props) {
    const { values,errors, touched, handleChange, handleSubmit,
        isSubmitting } = props
    return(
        <Layout>
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Departemen - Tambah</h3>
            <div className="card shadow" >
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                        <div className="form-group">
							<label for="addDeptName">Nama Departemen</label>
							<input type="text" className="form-control" value={values.name} onChange={handleChange} name="name" id="addDeptName" />
                            <ErrorMessage name="name" className="error-message" component='div'/>
						</div>
                        <div className="form-group">
							<label for="addEmail">Email</label>
							<input type="email" className="form-control" value={values.email} onChange={handleChange} name="email" id="addEmail" />
                            <ErrorMessage name="email" className="error-message" component='div' />
						</div>
                        <div className="form-group">
							<label for="addNoPIC">Nama Penanggung Jawab</label>
							<input type="text" className="form-control" value={values.code_pic} onChange={handleChange} name="code_pic" id="addNoPic" />
                            <ErrorMessage name="code_pic" className="error-message" component='div' />
						</div>
                        <div className="form-group">
							<label for="addPicPhone">Nomor Telepon Penanggung Jawab</label>
							<div className="input-group">
								<div className="input-group-prepend">
									<span className="input-group-text">+62</span>
								</div>
								<input type="text" className="form-control" value={values.phone_pic} onChange={handleChange} name="phone_pic"  id="addPicPhone" />
							</div>
                            <ErrorMessage name="code_pic" className="error-message" component='div' />
						</div>
                    </div>
                    <div className="card-footer">
                        <button type="submit" disabled= {isSubmitting} className="btn btn-block btn-primary">Tambah Departemen Baru</button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}

async function onSubmit (values,actions) {
    try{
        let rest = await axioss.post('/api/v1/departements',
                values,
                {
                    'Content-Type': 'application/json',
                    'Authorization': cookie.get('token')

                }
            )
            if(rest.data.valid) {
                swal({
                    title: "Tersimpan",
                    text: "Data Departemen Berhasil Tersimpan",
                    icon: "success",
                    button: "Ok",
                }).then(()=>{
                    Router.push('/departement/list')
                });
            } else{
                swal({
                    title: "Error",
                    text: "Error => Email Sudah digunakan" ,
                    icon: "error",
                    button: "Ok",
                });

            }
    } catch(e){
        swal({
            title: "Error",
            text: "Error => " + err.msg,
            icon: "error",
            button: "Ok",
          });
    }
}
  
export default withAuthSync(DepartementCreate);