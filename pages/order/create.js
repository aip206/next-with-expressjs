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
import {withRouter} from 'next/router';
import swal from 'sweetalert';
import {storage} from '../../utils/firebase';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DatePicker from "react-datepicker";
import http from '../../utils/http-service';
import JSON from 'circular-json';


const getYupValidationSchema = Yup.object().shape({
    customer_name: Yup.string()
      .required('Nama Pelanggan tidak boleh kosong!'),
      customer_email: Yup.string()
      .email('Format Email Pelanggan salah!')
      .required('Email Pelanggan tidak boleh kosong!'),
      customer_phone: Yup.number('Format Nomor Telepon salah')
      .positive('Format Nomor Telepon salah')
      .required('Nomor Telepon Pelanggan tidak boleh kosong!'),
      customer_address: Yup.string()
      .required('Alamat Pelanggan tidak boleh kosong!'),
      customer_kecamatan: Yup.string()
      .required('Kecamatan tidak boleh kosong!'),
      customer_kabupaten: Yup.string()
      .required('Kabupaten tidak boleh kosong!'),
      customer_provinsi: Yup.string()
      .required('Provinsi tidak boleh kosong!'),
      order_deadline: Yup.date()
      .required('Tanggal Batas Akhir tidak boleh kosong!')
  })
const initialValues = { 
     order_invoice:"",
     order_description:"",
     order_deadline:"",
     customer_name:"",
     customer_address:"",
     customer_phone:"",
     customer_email:"",
     customer_kabupaten:"",
     customer_kecamatan:"",
     customer_provinsi:"",
     arrFile: [],
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
            dokumentTmp:[],
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
        http.get('/api/v1/utiliti/provinsi').then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({provinsi: renamedObj})
        })
    }
    getKabupaten(id){
        http.get('/api/v1/utiliti/kabupaten/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kabupaten: renamedObj})
        })
    }
    getKecamatan(id){
        http.get('/api/v1/utiliti/kecamatan/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kecamatan: renamedObj})
        })
    }
    getKelurahan(id){
        http.get('/api/v1/utiliti/keluarahan/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kelurahan: renamedObj})
        })
    }

    lookUpDokumen(){
        http.get('/api/v1/document-lookup',{   
            headers: {
            'Authorization': cookie.get('token')
            }
            }).then(response =>  response.data)
            .then(data => {
                const newKeys = ["value","label","dokumen_type","departements"];
                const renamedObj = renameKeys(data.data, newKeys);
                this.setState({dokuments: renamedObj})
                this.setState({dokumentTmp: renamedObj})
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
    const { values,errors, touched,handleChange, handleSubmit, setFieldValue,
        isSubmitting, optional, provinsi, kabupaten, kecamatan} = props
    const [docOption, setDocOption] = useState([])
    const [arrFile, setArrFiles] = useState([])
    const [selected, setSelected] = useState("")
    const [progress, setProgress] = useState(0);

    const upload = (e, index) => {
            values.arrFile.push({
                id:index,
                file: e
            })
            optional.dokuments = optional.dokuments.reduce((prev,value) => {
                var isDuplicate = false
                for (var i = 0; i < values.dokuments.length; i++) {
                  
                    if (value.value == values.dokuments[i].id) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    prev.push(value);
                }
                   
                return prev;
                
            },[])
            values.dokuments[index].nameOfFile = e.target.files[0].name

        }
    const remove = (index) => {
        var opts = optional.dokumentTmp.filter(e => e.value == index.id)
        optional.dokuments.push(opts)
    }
    return(
        <Layout title="Tambah Pemesanan">
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
                        {errors.customer_name && touched.customer_name ? <div className="error-message">{errors.customer_name}</div> : null}
                    </div>
                    <div className="form-group">
                        <label for="addCustEmail">Email</label>
                        <input onChange={handleChange} type="email" className="form-control" name="customer_email" value={values.customer_email} id="addCustEmail"/>
                        {errors.customer_email && touched.customer_email ? <div className="error-message">{errors.customer_email}</div> : null}
                    </div>
                    <div className="form-group">
                        <label for="addCustPhone">Nomor Telepon</label>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">+62</span>
                            </div>
                            <input onChange={handleChange} type="text" className="form-control" name="customer_phone" value={values.customer_phone} id="addCustPhone" />
                        </div>
                        {errors.customer_phone && touched.customer_phone ? <div className="error-message">{errors.customer_phone}</div> : null}
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
                                {errors.customer_provinsi && touched.customer_provinsi ? <div className="error-message">{errors.customer_provinsi}</div> : null}

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
                                {errors.customer_kabupaten && touched.customer_kabupaten ? <div className="error-message">{errors.customer_kabupaten}</div> : null}

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
                                {errors.customer_kecamatan && touched.customer_kecamatan ? <div className="error-message">{errors.customer_kecamatan}</div> : null}

                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label for="addCustAddress">Alamat</label>
                        <textarea onChange={handleChange} className="form-control" id="addCustAddress" name="customer_address" rows="2" value={values.customer_address} ></textarea>
                        {errors.customer_address && touched.customer_address ? <div className="error-message">{errors.customer_address}</div> : null}
                    </div>
                    <p className="small font-weight-bold text-uppercase mb-0">Pesanan</p>
                  
                    <div className="form-group">
                        <label for="addOrderDesc">Deskripsi</label>
                        <textarea onChange={handleChange} className="form-control" id="addOrderDesc" name="order_description" value={values.order_description} rows="2" ></textarea>
                    </div>
                    <div className="form-group">
							<label for="addOrderEndDate">Tanggal Batas Akhir</label><br></br>
                            <DatePicker
                            className="form-control"
                                    selected={values.order_deadline}
                                    name="order_deadline"
                                    onChange={(e)=> {
                                        values.order_deadline = e
                                        setFieldValue("order_deadline",e)
                                        handleChange(e)
                                    }}
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    
                                />
                            {errors.order_deadline && touched.order_deadline ? <div className="error-message">{errors.order_deadline}</div> : null}
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
                                               
                                                if(e.dokumen_type == "Tipe Dokumen"){
                                                    setSelected(".pdf,.csv, .doc,.docx,.xlsx, .xls,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                                                }else{
                                                    setSelected("image/*")
                                                }
                                                
                                                
                                            }}
                                        />
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="custom-file">
                                           
                                                 <input type="file" className="custom-file-input" accept={selected} id={`addDocExample${index}`} value={values.dokuments[index].file} name={`dokuments[${index}].file`}  onChange={(e)=>{ 
                                                    handleChange(e)
                                                    values.dokuments[index].origin = e
                                                    setDocOption([... docOption,
                                                        values.dokuments[index]
                                                    ])
                                                    upload(values.dokuments[index].origin,index)
                                                    
                                                }}/>
                                                
                                                <label className="custom-file-label" for={`addDocExample${index}`}>{values.dokuments[index].nameOfFile}</label>
                                            </div>
                                        </div>

                                        
                                        {index == 0? (
                                            <div className="col-sm-2">
                                                <button type="button" className="btn btn-block btn-success" id="addNewDocField"
                                                onClick={() => {
                                                    var data = {
                                                        id:"",
                                                        file:null} 
                                                        arrayHelpers.push(data)
                                                }}
                                                >Tambah</button>
                                            </div>
                                        ):(
                                            <div className="col-sm-2">
                                            <button
                                                type="button"
                                                className="btn btn-block btn-danger remove_field"
                                                onClick={() =>{ 
                                                    if(values.dokuments.length > 1)
                                                        remove(values.dokuments[index])
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
                    <button type="submit"  className="btn btn-block btn-primary">Tambah Pesanan Baru</button>
                </div>
                </form>
            </div>
        </Layout>

        
    )
}

async function onSubmit (values,actions) {
        
        swal({
            title: "Menunggu",
            text: "Pesanan anda Sedang di Proses",
            closeOnClickOutside: false
          })
        Promise.all(
            values.arrFile.map( async (item,index) => {
                await upload(values,item)
            })
        )
        .then(async (url) => {
            setTimeout(()=>{
                save(values)
            },3000)
        })
          .catch((error) => {
            console.log(`Some failed: `, error.message)
        });
      
    
  
}

 async function save(values ) {
    delete values.arrFile;
    let data = await { ... values,
        order_deadline : moment(values.order_deadline).format('YYYY-MM-DD'),
        dokuments: values.dokuments.filter((x)=>x.file != null)
    }
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': cookie.get('token')
        }
        http.post('/api/v1/orders',JSON.stringify(data),{'headers':headers})
        .then(response => {
            swal({
                title: "Tersimpan",
                text: "Data Dokumen Berhasil Tersimpan",
                icon: "success",
                button: "Ok",
              }).then(()=>{
                Router.push('/order/list')
              });
        }).catch(e => console.log(e))
}

function upload(v,data){
    let progress = [];
    const image = data.file.target.files[0];
    const namaFile = moment().valueOf()+"_"+image.name
    return storage.ref(`orders/${namaFile}`).put(image).then(
                (snapshot) => {
                    storage.ref(`orders`).child(namaFile).getDownloadURL().then(url => {
                         v.dokuments[data.id].origin = image.name,
                         v.dokuments[data.id].link = url
     
                     })
                }).
                catch(error => {
                    // error function ....
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

export default withAuthSync(withRouter(OrderCreate));