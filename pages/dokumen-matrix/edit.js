import { Component  ,useState } from 'react';
import { withAuthSync } from '../../utils/auth';
import CreatableSelect from 'react-select/lib/Creatable';
import Select from 'react-select';
import cookie from 'js-cookie';
import http from '../../utils/http-service';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { Formik, Field,ErrorMessage,withFormik } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import {withRouter} from 'next/router';
import swal from '@sweetalert/with-react'

import {storage} from '../../utils/firebase';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb'


const getYupValidationSchema = Yup.object({
    initialValues:Yup.object({
        dokumen_name: Yup.string()
        .required('Nama Dokumen tidak boleh kosong!'),
        dokumen_type: Yup.string()
        .required('Tipe Dokumen tidak boleh kosong!'),
        departements: Yup.string()
          .required('Nama Departemen tidak boleh kosong!')
        
    })
    
  })

class DokumenMatrixEdit extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            departements:[],
            url:"",
             typeDokumen : [{label:"Tipe Gambar",value:"Tipe Gambar"},{label:"Tipe Dokumen",value:"Tipe Dokumen"}],
            image: null,
            initialValues : {
                dokumen_name:undefined,
                dokumen_type:undefined,
                description:undefined,
                documentFileId:undefined,
                departements:[],
                select:"",
                file:""
                
            },
            upload: this.handleChange.bind(this)
        }
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange = e => {
        if (e.target.files[0]) {
          const image = e.target.files[0];
          const namaFile = moment().valueOf()+"_"+image.name
          const uploadTask = storage.ref(`images/${namaFile}`).put(image);
            uploadTask.on('state_changed', 
            (snapshot) => {
            // progrss function ....
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            this.setState({progress});
            }, 
            (error) => {
                // error function ....
            }, 
        () => {
            // complete function ....
            storage.ref('images').child(namaFile).getDownloadURL().then(url => {
                this.setState({url});
            })
        });
        }
      }

    componentDidMount() {
        this.getDepartement();
        this.getDokumenMatrix();
    }
    getDokumenMatrix() {
        http.get('/api/v1/document/'+this.props.router.query.id,{
            headers: {
              'Authorization': cookie.get('token')
            } 
          })
          .then(response => {
              return response.data.data
          })
          .then(data =>{ 
            const newKeys = ["value","label"];
           
              this.setState({initialValues :{ ... this.state.initialValues,
                id:data.id,
                dokumen_name:data.dokumen_name,
                dokumen_type:{value:data.dokumen_type,label:data.dokumen_type},
                description:data.description,
                select:data.dokumen_type,
                departements:renameKeys(data.departements,newKeys),
                path:data.path,
                link:data.link,
                nameOfFile:data.path
              } })
          })
          .catch(err => {
            swal({
              title: "Error",
              text: "Error => " + err,
              icon: "error",
              button: "Ok",
            })
          })
    }
    getDepartement(){
        http.get('/api/v1/departements/by-search',{   
            headers: {
            'Authorization': cookie.get('token')
            }
            }).then(response =>  response.data)
            .then(data => {
                const newKeys = ["value","label"];
                const renamedObj = renameKeys(data.data, newKeys);
                this.setState({departements: renamedObj})
            })
    }
    render () {
        const MyEnhancedForm = withFormik({
            mapPropsToValues: () => (this.state),
            validationSchema:() =>(getYupValidationSchema) ,
            handleSubmit: (values, { setSubmitting }) => {upload(values)},
            displayName: 'EditForm',
          })(EditForm);
                    
        return (
        <MyEnhancedForm/>
        
        )
    }
  }

function EditForm(props) {
    const { values,errors, form, handleChange, handleSubmit,
        isSubmitting,optional, typeDok,touched, setFieldValue} = props
    const [fileName, setFileName] = useState("");
    const [progress, setProgress] = useState(0);
    const [selected, setSelected] = useState(values.initialValues.select);
    const upload = e => {
                setFieldValue("initialValues.fileName",e)
                setFieldValue("initialValues.nameOfFile",e.target.files[0].name)

        //         setFieldValue("initialValues.link",url)
        //     })
        // });
        // }
        }
    return(
        <Layout title="Ubah Matrix Dokumen">
            <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/dokumen-matrix/list" >Matriks Dokumen</Breadcrumb.Item>
                <Breadcrumb.Item active >Ubah</Breadcrumb.Item>
            </Breadcrumb>   
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Matriks Dokumen - Ubah</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                        <div className="form-group">
							<label for="addDeptName">Nama Dokumen</label>
							<input type="text" className="form-control" value={values.initialValues.dokumen_name}  onChange={handleChange} name="initialValues.dokumen_name" id="addDeptName"/>
                            <ErrorMessage name="initialValues.dokumen_name" >
                            {msg => <div className="error-message">{msg}</div>}
                            </ErrorMessage>

						</div>
                
                        <div className="form-group">
							<label for="addDeptType">Tipe Dokumen</label>
                            <CreatableSelect
                                id="addDeptType"
                                name="initialValues.dokumen_type"
                                options={values.typeDokumen}
                                defaultValue={values.initialValues.dokumen_type}
                                onChange={(e) =>{
                                    values.initialValues.dokumen_type = e
                                    setSelected(e.label)

                                }}
                            />
                            <ErrorMessage name="initialValues.dokumen_type" >
                            {msg => <div className="error-message">{msg}</div>}
                            </ErrorMessage>
						</div>
                        <div className="form-group">
							<label for="addDocExample">Contoh Dokumen </label>
                            <div className="row">
                            <div className="col-sm-10">
							<div className="custom-file">
                                {selected == "Tipe Gambar" ?  <input type="file" className="custom-file-input" accept="image/*" id="addDocExample" value={values.initialValues.file} name="initialValues.file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
                                {selected == "Tipe Dokumen" ?  <input type="file" className="custom-file-input" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" id="addDocExample" value={values.initialValues.file} name="initialValues.file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
                               
								<label className="custom-file-label" for="addDocExample">{values.initialValues.nameOfFile}</label>
                                <input type="hidden" name={values.initialValues.file} name="initialValues.filename"/>
                                <ErrorMessage name="file" >
                                {msg => <div className="error-message">{msg}</div>}
                                </ErrorMessage>
							</div>
                            <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{width:progress+"%"}}>{progress}</div>
                            </div>
                            </div>
                            <div className="col-sm-2">
                            <a href={`${values.initialValues.link}`} target="_blank" className="btn btn-outline-primary" >Download</a>
                            </div>
                            </div>
						</div>
                       
                        <div className="form-group">
							<label for="addDeptName">Nama Departemen</label>
                            <CreatableSelect
                                isMulti
                                name="initialValues.departements"
                                onChange={(e)=>{
                                    values.initialValues.departements = e
                                }}
                                defaultValue={values.initialValues.departements}
                                getOptionLabel={({label}) => label}
                                getOptionValue={({value}) => value}
                                options={values.departements}
                                required
                            />
                            <ErrorMessage name="initialValues.departements" >
                            {msg => <div className="error-message">{msg}</div>}
                            </ErrorMessage>
						</div>
                        
                        <div className="form-group">
                            <label for="addDeptdescription">Deskripsi</label>
							<textarea type="text" className="form-control" value={values.initialValues.description} onChange={handleChange} name="initialValues.description" id="addDeptdescription" />
                            
                            <ErrorMessage name="initialValues.description" >
                            {msg => <div className="error-message">{msg}</div>}
                            </ErrorMessage>
						</div>
                    </div>
                    <div className="card-footer">
                        <button type="submit"  className="btn btn-block btn-primary">Ubah Matrix Dokumen</button>
                    </div>
                </form>
            </div>
        </Layout>

        
    )
}

function upload (values) {
    if(values.initialValues.nameOfFile != values.initialValues.path){
    let progress = 0
        if (values.initialValues.fileName.target.files[0]) {
            const image = values.initialValues.fileName.target.files[0];
            const namaFile = moment().valueOf()+"_"+image.name;
            const uploadTask = storage.ref(`dokumen-matrix/${namaFile}`).put(image);
            const task =  uploadTask.on('state_changed', 
            (snapshot) => {
                progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                swal({
                    text: "Upload Progress",
                    content: (
                        <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                            role="progressbar" aria-valuenow={progress} aria-valuemin="0" 
                            aria-valuemax="100" style={{width:progress+"%"}}>{progress}</div>
                        </div>
                    )
                })
            }, 
            (error) => {
                // error function ....
            },
            ()=>{
                storage.ref('dokumen-matrix').child(namaFile).getDownloadURL().then(url => {
                    values.initialValues.link = url
                    values.initialValues.fileName = namaFile
                    setTimeout(()=>{
                        swal.close()   
                        onSubmit(values)
                    },3000)
                    
                })
            });
        }
    }else{
        onSubmit(values)
    }
}

function onSubmit (values) {
    const data = {
            description: values.initialValues.description,
            dokumen_name: values.initialValues.dokumen_name,
            dokumen_type: values.initialValues.dokumen_type.label,
            departements: values.initialValues.departements.map((x)=>x.value),
            file:values.initialValues.fileName,
            link:values.initialValues.link
    }
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': cookie.get('token')
    }
    http.put('/api/v1/document/'+values.initialValues.id,data,{'headers':headers})
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Data Dokumen Berhasil Tersimpan",
            icon: "success",
            button: "Ok",
          }).then(()=>{
            Router.push('/dokumen-matrix/list')
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

function renameKeys(arrayObject, newKeys, index = false) {
    let newArray = [];
    arrayObject.forEach((obj,item)=>{
        const keyValues = Object.keys(obj).map((key,i) => {
            return {[newKeys[i] || key]:obj[key]}
        });
        let id = (index) ? {'ID':item} : {}; 
        newArray.push(Object.assign(id, ...keyValues));
    });
    return newArray;
}

export default withAuthSync(withRouter(DokumenMatrixEdit));