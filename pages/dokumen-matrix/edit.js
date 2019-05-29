import { Component  ,useState } from 'react';
import { withAuthSync } from '../../utils/auth';
import CreatableSelect from 'react-select/lib/Creatable';
import Select from 'react-select';
import cookie from 'js-cookie';
import axioss from 'axios';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage,withFormik } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import {withRouter} from 'next/router';
import swal from 'sweetalert';
import {storage} from '../../utils/firebase';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb'


const getYupValidationSchema = Yup.object().shape({initialValues:{
    dokumen_name: Yup.string()
      .required('E-mail is required!'),
    dokumen_type: Yup.string()
      .required('Password is required!')
    }
  })

class DokumenMatrixEdit extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            departements:[],
            url:"",
            typeDokumen:[{label:"Tipe PNG",value:".png"},{label:"Tipe Dokumen",value:".doc"}, {label:"Tipe PDF",value:".pdf"}],
            image: null,
            initialValues : {
                dokumen_name:undefined,
                dokumen_type:undefined,
                description:undefined,
                documentFileId:undefined,
                departements:[],
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
            console.log(error);
            }, 
        () => {
            // complete function ....
            storage.ref('images').child(namaFile).getDownloadURL().then(url => {
                console.log(url);
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
        axioss.get('/api/v1/document/'+this.props.router.query.id,{
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
                departements:renameKeys(data.departements,newKeys),
                path:data.path
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
        axioss.get('/api/v1/departements/by-search',{   
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
            handleSubmit: (values, { setSubmitting }) => {onSubmit(values)},
            displayName: 'EditForm',
          })(EditForm);
                    
        return (
        <MyEnhancedForm/>
        
        )
    }
  }

function EditForm(props) {
    const { values,errors, form, handleChange, handleSubmit,
        isSubmitting,optional, typeDok, setFieldValue} = props
    const [fileName, setFileName] = useState("");
    const [progress, setProgress] = useState(0);
    const [selected, setSelected] = useState("");
    const upload = e => {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            const namaFile = moment().valueOf()+"_"+image.name;
            const uploadTask = storage.ref(`dokumen-matrix/${namaFile}`).put(image);
            uploadTask.on('state_changed', 
            (snapshot) => {
            // progrss function ....
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(progress)
            }, 
            (error) => {
                // error function ....
            console.log(error);
            }, 
        () => {
            storage.ref('dokumen-matrix').child(namaFile).getDownloadURL().then(url => {
                setFieldValue("initialValues.fileName",namaFile)
            })
        });
        }
        }
    return(
        <Layout>
            <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/dokumen-matrix/list" >Matriks Dokumen</Breadcrumb.Item>
                <Breadcrumb.Item active >Ubah</Breadcrumb.Item>
            </Breadcrumb>   
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Matriks Dokumen - Tambah</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                        <div className="form-group">
							<label for="addDeptName">Nama Dokumen</label>
							<input type="text" className="form-control" value={values.initialValues.dokumen_name}  onChange={handleChange} name="initialValues.dokumen_name" id="addDeptName"/>
                            <ErrorMessage name="initialValues.dokumen_name" />
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
                                }}
                                required
                            />
                            <ErrorMessage name="initialValues.dokumen_type" />
						</div>
                        <div className="form-group">
							<label for="addDocExample">Contoh Dokumen </label>
                            
							<div className="custom-file">
                                <input type="file" accept={values.initialValues.dokumen_type} id="addDocExample" value={values.initialValues.file} name="initialValues.file"  onChange={(e)=>{                                     
                                    handleChange(e)
                                    upload(e)
                                }}/>
                                {selected == "Tipe PNG" ?  <input type="file" accept=".png" id="addDocExample" value={values.initialValues.file} name="initialValues.file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
                                {selected == "Tipe Dokumen" ?  <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" id="addDocExample" value={values.initialValues.file} name="initialValues.file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
                                
                                {selected == "Tipe PDF" ?  <input type="file" accept=".pdf" id="addDocExample" value={values.initialValues.file} name="initialValues.file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
								<label className="custom-file-label" for="addDocExample">{values.initialValues.path}</label>
                                <input type="hidden" name={values.initialValues.file} name="initialValues.filename"/>
                                <ErrorMessage name="file" />
							</div>
						</div>
                        <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{width:progress+"%"}}>{progress}</div>
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
                            <ErrorMessage name="initialValues.departements" />
						</div>
                        
                        <div className="form-group">
                            <label for="addDeptdescription">Deskripsi</label>
							<textarea type="text" className="form-control" value={values.initialValues.description} onChange={handleChange} name="initialValues.description" id="addDeptdescription" />
                            
                            <ErrorMessage name="initialValues.description" />
						</div>
                    </div>
                    <div className="card-footer">
                        <button type="submit"  className="btn btn-block btn-primary">Tambah Departemen Baru</button>
                    </div>
                </form>
            </div>
        </Layout>

        
    )
}

function onSubmit (values,actions) {
    const data = {
            description: values.initialValues.description,
            dokumen_name: values.initialValues.dokumen_name,
            dokumen_type: values.initialValues.dokumen_type.label,
            departements: values.initialValues.departements.map((x)=>x.value),
            file:values.initialValues.fileName
    }
    console.log(data)
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': cookie.get('token')
    }
    axioss.put('/api/v1/document/'+values.initialValues.id,data,{'headers':headers})
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Data Dokumen Berhasil Tersimpan",
            icon: "success",
            button: "Ok",
          }).then(()=>{
              console.log("a");
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