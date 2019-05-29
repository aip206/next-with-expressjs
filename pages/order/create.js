import { Component, Fragment,useState , useEffect } from 'react';
import { withAuthSync } from '../../utils/auth';
import CreatableSelect from 'react-select/lib/Creatable';
import Select from 'react-select';
import cookie from 'js-cookie';
import axioss from 'axios';
import Layout from '../../components/Layout';
import { Formik, FieldArray, Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import swal from 'sweetalert';
import {storage} from '../../utils/firebase';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb'

const getYupValidationSchema = Yup.object().shape({
    customer_name: Yup.string()
      .required('Nama Pelanggan is required!'),
      customer_email: Yup.string()
      .email('E-mail tidak valid!')
      .required('Email Pelanggan is required!'),
      customer_phone: Yup.string()
      .required('Telepon Pelanggan is required!'),
      customer_kecamatan: Yup.string()
      .required('Kecamatan is required!'),
      customer_kabupaten: Yup.string()
      .required('Kabupaten is required!'),
      customer_provinsi: Yup.string()
      .required('Provinsi is required!'),
      order_deadline: Yup.string()
      .required('Tanggal Batas Akhir is required!'),
  })
const initialValues = { 
     order_invoice:"",
     order_description:"",
     order_deadline:new Date,
     customer_name:"",
     customer_address:"",
     customer_phone:"",
     customer_email:"",
     customer_kabupaten:"",
     customer_kecamatan:"",
     customer_provinsi:"",
     dokuments:[{
         id:"",
         file:"",
         origin:"",
         departements:[]
     }]
}

class OrderCreate extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            image: null,
            dokuments:[],
            provinsi:[],
            kecamatan:[],
            kelurahan:[],
            kabupaten:[],
            namaFile:"",
            progress:null
        }
        this.lookUpDokumen = this.lookUpDokumen.bind(this)
        this.getProvinsi = this.getProvinsi.bind(this)
        this.getKabupaten = this.getKabupaten.bind(this)
        this.getKecamatan = this.getKecamatan.bind(this)
    }

    getProvinsi(){
        axioss.get('/api/v1/utiliti/provinsi').then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({provinsi: renamedObj})
        }).catch((e)=>{
            console.log(e)
        })
    }
    getKabupaten(id){
        console.log(id);
        axioss.get('/api/v1/utiliti/kabupaten/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kabupaten: renamedObj})
        }).catch((e)=>{
            console.log(e)
        })
    }
    getKecamatan(id){
        axioss.get('/api/v1/utiliti/kecamatan/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kecamatan: renamedObj})
        }).catch((e)=>{
            console.log(e)
        })
    }
    getKelurahan(id){
        axioss.get('/api/v1/utiliti/keluarahan/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kelurahan: renamedObj})
        }).catch((e)=>{
            console.log(e)
        })
    }

    lookUpDokumen(){
        axioss.get('/api/v1/document-lookup',{   
            headers: {
            'Authorization': cookie.get('token')
            }
            }).then(response =>  response.data)
            .then(data => {
                const newKeys = ["value","label","departements"];
                const renamedObj = renameKeys(data.data, newKeys);
                this.setState({dokuments: renamedObj})
            }).catch((e)=>{
                // Router.push('/login')
                console.log(e)
            })
    }

    componentDidMount() {
        this.lookUpDokumen();
        this.getProvinsi();
    }
    render(){
        return (
       <Formik
            initialValues={initialValues}
            validationSchema={getYupValidationSchema}
            onSubmit={onSubmit}
            render={ props =>{
                return <CreateForm  {...props} 
                optional ={this.state}                 
                 provinsi={this.getProvinsi} kabupaten={this.getKabupaten}
                  kecamatan={this.getKecamatan} />
            }}
        />
        )
    }
  }

function CreateForm(props) {
    const { values,errors, handleChange, handleSubmit, setFieldValue,
        isSubmitting, optional, provinsi, kabupaten, kecamatan} = props
    const [docOption, setDocOption] = useState("")
    const [selected, setSelected] = useState([])
    const [progress, setProgress] = useState(0);
    const upload = e => {
            if (e.target.files[0]) {
            const image = e.target.files[0];
            const namaFile = moment().valueOf()+"_"+image.name
            const uploadTask = storage.ref(`orders/${namaFile}`).put(image);
                uploadTask.on('state_changed', 
                (snapshot) => {
                // progrss function ....
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
                }, 
                (error) => {
                    // error function ....
                console.log(error);
                }, 
            () => {
                // complete function ....
                storage.ref('orders').child(namaFile).getDownloadURL().then(url => {
                    console.log(url);
                })
            });
            return namaFile;
            }
            return ""
        }
    useEffect(() => {
        setSelected(docOption);
      }, []);
    return(
        <Layout>
            <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/order/list" >Pemesanan</Breadcrumb.Item>
                <Breadcrumb.Item active >Tambah</Breadcrumb.Item>
            </Breadcrumb>   
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Pemesanan - Tambah</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                <p className="small font-weight-bold text-uppercase mb-0">Pelanggan</p>
                    <div className="form-group">
                        <label for="addCustName">Nama</label>
                        <input type="text" className="form-control" value={values.customer_name} id="addCustName" name="customer_name"
                        onChange={handleChange}
                        />
                        <ErrorMessage name="customer_name" name="error-message" component='div' />
                    </div>
                    <div className="form-group">
                        <label for="addCustEmail">Email</label>
                        <input onChange={handleChange} type="email" className="form-control" name="customer_email" value={values.customer_email} id="addCustEmail" />
                        <ErrorMessage name="customer_email" name="error-message" component='div'/>
                    </div>
                    <div className="form-group">
                        <label for="addCustPhone">Nomor Telepon</label>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">+62</span>
                            </div>
                            <input onChange={handleChange} type="text" className="form-control" name="customer_phone" value={values.customer_phone} id="addCustPhone" />
                            <ErrorMessage name="customer_phone" name="error-message" component='div'/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label for="addCustProvince">Provinsi</label>
                                <Select
                                    name= "customer_provinsi"
                                    id="addCustProvince"
                                    options={optional.provinsi}
                                    onChange={(e) =>{
                                        values.customer_provinsi = e.label
                                        values.id_provinsi = e.value
                                        kabupaten(e.value,this)
                                    }}
                                    />
                                <ErrorMessage name="customer_provinsi" name="error-message" component='div' />
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label for="addCustCity">Kota/Kabupaten</label>
                                 <Select
                                    name= "customer_kabupaten"
                                    id="addCustCity"
                                    options={optional.kabupaten}
                                    onChange={(e) =>{
                                        values.customer_kabupaten = e.label
                                        values.id_kabupaten = e.value
                                        kecamatan(e.value,this)
                                    }}
                                    />
                                <ErrorMessage name="customer_kabupaten" name="error-message" component='div' />
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label for="addCustDistrict">Kecamatan</label>
                                <Select
                                    name= "customer_kecamatan"
                                    id="addCustDistrict"
                                    options={optional.kecamatan}
                                    onChange={(e) =>{
                                        values.customer_kecamatan = e.label
                                        values.id_kecamatan = e.value
                                        
                                    }}
                                />
                                <ErrorMessage name="customer_kecamatan" name="error-message" component='div' />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label for="addCustAddress">Alamat</label>
                        <textarea onChange={handleChange} className="form-control" id="addCustAddress" name="customer_address" rows="2" value={values.customer_address} ></textarea>
                        <ErrorMessage name="customer_address" name="error-message" component='div' />
                    </div>
                    <p className="small font-weight-bold text-uppercase mb-0">Pesanan</p>
                    
                    <div className="form-group">
                        <label for="addOrderDesc">Deskripsi</label>
                        <textarea onChange={handleChange} className="form-control" id="addOrderDesc" name="order_description" value={values.order_description} rows="2" ></textarea>
                    </div>
                    <div className="form-group">
							<label for="addOrderEndDate">Tanggal Batas Akhir</label>
							<input type="date" onChange={handleChange} className="form-control" id="addOrderEndDate" value={values.order_deadline} name="order_deadline"/>
                            <ErrorMessage name="order_deadline" name="error-message" component='div' />
						</div>
                    <p className="small font-weight-bold text-uppercase mb-0">Dokumen</p>
                    <div id="addOrderDocField">
                    <FieldArray
                        name="dokuments" 
                        render={
                            arrayHelpers => (
                            <Fragment >
                                
                           {values.dokuments && values.dokuments.length > 0 ? (
                                values.dokuments.map((friend, index) => (
                                    <Fragment key={index} >
                                    <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Tambah Dokumen</label>
                                        <div className="col-sm-4">
                                            <Select
                                            name={`dokuments[${index}].id`} 
                                            id="addOrderDocName"
                                            options={optional.dokuments}
                                            onChange={(e) =>{
                                                values.dokuments[index].id = e.value
                                                values.dokuments[index].departements = e.departements
                                                
                                                setDocOption(e)
                                            }}
                                        />
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="custom-file">
                                                <input type="file" className="custom-file-input" id="addDocExample" value={values.dokuments[index].file} name={`dokuments[${index}].file`}  onChange={(e)=>{
                                                    handleChange(e)
                                                    values.dokuments[index].origin = upload(e)
                                                }}/>
                                                <label className="custom-file-label" for="addDocExample">{values.dokuments[index].origin}</label>
                                                
                                            </div>
                                        </div>
                                        {index == 0 ? (
                                            <div className="col-sm-2">
                                                <button type="button" className="btn btn-block btn-success" id="addNewDocField"
                                                onClick={() => {
                                                    var data = {
                                                        id:"",
                                                        file:""}      
                                                        
                                                        if(values.dokuments[index].id != ""){
                                                            arrayHelpers.push(data)
                                                        }  
                                                    optional.dokuments = optional.dokuments.filter((x)=> x.label != docOption.label)
                                                }}
                                                >Tambah</button>
                                            </div>
                                        ):(
                                            <div className="col-sm-2">
                                            <button
                                                type="button"
                                                className="btn btn-block btn-danger remove_field"
                                                onClick={() =>{ 
                                                    console.log()
                                                    if(values.dokuments.length > 1)
                                                        arrayHelpers.remove(index)}
                                                    } 
                                            >
                                                Hapus
                                            </button></div>
                                        )}
                                        
                                        </div>
                                </Fragment>
                                ))
                                ) : (
                                <button type="button" onClick={() => arrayHelpers.push('')}>
                                    {/* show this when user has removed all friends from the list */}
                                    Add a Dokumen
                                </button>
                                )}
                                
                            </Fragment>)}
                        />
                                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{width:progress+"%"}}>{progress}</div>
                        
                        
                    </div>
                </div>
                <div className="card-footer">
                    <button type="submit" disabled= {isSubmitting} className="btn btn-block btn-primary">Tambah Pesanan Baru</button>
                </div>
                </form>
            </div>
        </Layout>

        
    )
}


function onSubmit (values,actions) {
    console.log(values);
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': cookie.get('token')
    }
    axioss.post('/api/v1/orders',values,{'headers':headers})
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Data Dokumen Berhasil Tersimpan",
            icon: "success",
            button: "Ok",
          }).then(()=>{
            Router.push('/order/list')
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

export default withAuthSync(OrderCreate);