import { Component   ,useState } from 'react';
import { withAuthSync } from '../../utils/auth';
import CreatableSelect from 'react-select/lib/Creatable';
import Select from 'react-select';
import cookie from 'js-cookie';
import http from '../../utils/http-service';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
// import swal from 'sweetalert';
import swal from '@sweetalert/with-react';
import {storage} from '../../utils/firebase';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb'

const getYupValidationSchema = Yup.object().shape({
    dokumen_name: Yup.string()
      .required('Nama Dokumen tidak boleh kosong!'),
    dokumen_type: Yup.string()
      .required('Tipe Dokumen tidak boleh kosong!'),
    departements: Yup.string()
      .required('Nama Departemen tidak boleh kosong!')
  })
const typeDokumen = [{label:"Tipe Gambar",value:"Tipe Gambar"},{label:"Tipe Dokumen",value:"Tipe Dokumen"}]
const initialValues = {
    dokumen_name:undefined,
    dokumen_type:undefined,
    description:undefined,
    documentFileId:undefined,
    departements:[],
    fileTmp:undefined,
    file:undefined
}

class DokumenMatrixCreate extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            image: null
        }
    }


    componentDidMount() {
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
    render(){
        return (
        <Formik
            initialValues={initialValues}
            validationSchema={getYupValidationSchema}
            onSubmit={upload}
            render={ props =>{
               return <CreateForm  {...props} optional ={this.state.departements} typeDok={typeDokumen}  />
            }}
        />
        
        )
    }
  }

function CreateForm(props) {
    const { values,errors, touched, handleChange, handleSubmit,
        isSubmitting,optional, typeDok, setFieldValue} = props
        const [fileName, setFileName] = useState("");
        const [progress, setProgress] = useState(0);
        const [selected, setSelected] = useState("");

        const upload = e => {
            
            setFieldValue("fileName",e)
            setFieldValue("nameOfFile",e.target.files[0].name)
            
            }
    return(
        <Layout title="Tambah Matrix Dokumen">
            <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/dokumen-matrix/list" >Matriks Dokumen</Breadcrumb.Item>
                <Breadcrumb.Item active >Tambah</Breadcrumb.Item>
            </Breadcrumb>   
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Matriks Dokumen - Tambah</h3>
            <div className="card shadow">
            <form onSubmit={(e)=>{
                handleSubmit(e)
            }}>
				<div className="card-body">
                        <div className="form-group">
							<label for="addDeptName">Nama Dokumen</label>
							<input type="text" className="form-control" value={values.dokumen_name}  onChange={handleChange} name="dokumen_name" id="addDeptName" />
                            <ErrorMessage name="dokumen_name" className="error-message" component='div' />
						</div>
                
                        <div className="form-group">
							<label for="addDeptType">Tipe Dokumen</label>
                            <CreatableSelect
                                id="addDeptType"
                                name="dokumen_type"
                                options={typeDok}
                                onChange={(e) =>{
                                    values.dokumen_type = e.label
                                    setSelected(e.label)
                                }}
                            />
                            <ErrorMessage name="dokumen_type" className="error-message" component='div' />
						</div>
                        <div className="form-group">
							<label for="addDocExample">Contoh Dokumen</label>
							<div className="custom-file">
                                {selected == "Tipe Gambar" ?  <input type="file" className="custom-file-input" accept="image/*" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
                                {selected == "Tipe Dokumen" ?  <input type="file" className="custom-file-input" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{ 
                                    handleChange(e)
                                    upload(e)
                                }}/> : ""}
								<label className="custom-file-label" for="addDocExample">{values.nameOfFile}</label>
                                
                                <input type="hidden" name={values.file} name="filename"/>
                                <ErrorMessage name="file" className="error-message" component='div'/>
							</div>
						</div>
                        
                        
                        <div className="form-group">
							<label for="addDeptName">Nama Departemen</label>
                            <CreatableSelect
                                isMulti
                                name="departements"
                                onChange={(e)=>{
                                    values.departements = e.map((x) => x.value)
                                }}
                                options={optional}
                            />
                            <ErrorMessage name="departements" className="error-message" component='div'/>
						</div>
                        
                        <div className="form-group">
                            <label for="addDeptdescription">Deskripsi</label>
							<textarea type="text" className="form-control" value={values.description} onChange={handleChange} name="description" id="addDeptdescription" />
                            <ErrorMessage name="description" className="error-message" component='div'/>
						</div>
                    </div>
                    <div className="card-footer">
                        <button type="submit" disabled= {isSubmitting} className="btn btn-block btn-primary">Tambah Matrix Dokumen</button>
                    </div>
                </form>
            </div>
        </Layout>

        
    )
}

function upload (values) {
    let progress = 0
    if (values.fileName.target.files[0]) {
        const image = values.fileName.target.files[0];
        const namaFile = moment().valueOf()+"_"+image.name;
        const uploadTask = storage.ref(`dokumen-matrix/${namaFile}`).put(image);
        const task =  uploadTask.on('state_changed', 
        (snapshot) => {
        // progrss function ....
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
                values.link = url
                values.file = namaFile
                values.fileName =""
                setTimeout(()=>{
                    swal.close()   
                    onSubmit(values)
                },3000)
                
            })
        });
    }
}

function onSubmit (values) {
    try{
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': cookie.get('token')
        }
    http.post('/api/v1/documents',values,{'headers':headers})
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
    }catch(e) {
        swal({
            title: "Error",
            text: "Error => " + e,
            icon: "error",
            button: "Ok",
          });
    }
   
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

export default withAuthSync(DokumenMatrixCreate);