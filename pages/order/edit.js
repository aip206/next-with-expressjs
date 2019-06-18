import { Component, Fragment   ,useState} from 'react';
import { withAuthSync } from '../../utils/auth';
import CreatableSelect from 'react-select/lib/Creatable';
import Select from 'react-select';
import cookie from 'js-cookie';
import axioss from 'axios';
import Layout from '../../components/Layout';
import { Formik, FieldArray, Field,ErrorMessage, withFormik } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import swal from 'sweetalert';
import {storage} from '../../utils/firebase';
import moment from 'moment';
import {withRouter} from 'next/router';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DatePicker from "react-datepicker";
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const getYupValidationSchema = Yup.object({
    initialValues:Yup.object({
        customer_name: Yup.string()
        .required('Nama Pelanggan tidak boleh kosong!'),
        customer_email: Yup.string()
        .email('Format Email Pelanggan salah!')
        .required('Email Pelanggan tidak boleh kosong!'),
        customer_phone: Yup.string()
        .required('Nomor Telepon Pelanggan tidak boleh kosong!')
         .matches(phoneRegExp, 'Nomor Telepon Pelanggan tidak valid'),
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
  })
const initialValues = { 
     order_invoice:"",
     order_description:"",
     order_deadline:new Date,
     customer_name:"",
     customer_address:"",
     customer_phone:"",
     customer_email:"",
     customer_kecamatan:"",
     customer_kecamatan:"",
     customer_provinsi:"",
     dokuments:[{
         id:"",
         file:"",
         origin:"",
         departements:[]
     }]
}

class OrderEdit extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            initialValues :{ 
                order_invoice:"",
                order_description:"",
                order_deadline:"",
                customer_name:"",
                customer_address:"",
                customer_phone:"",
                customer_email:"",
                customer_kecamatan:"",
                customer_kecamatan:"",
                customer_provinsi:"",
                dokuments:[{
                    id:"",
                    file:"",
                    origin:"",
                    departements:[]
                }]},
            image: null,
            dokuments:[],
            provinsi:[],
            kecamatan:[],
            kelurahan:[],
            kabupaten:[],
            namaFile:"",
            progress:null
        }
        this.handleChange = this.handleChange.bind(this)
        this.lookUpDokumen = this.lookUpDokumen.bind(this)
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
            this.setState({progress,namaFile});
            }, 
            (error) => {
                // error function ....
            console.log(error);
            }, 
        () => {
            // complete function ....
            storage.ref('images').child(namaFile).getDownloadURL().then(url => {
                this.setState({url});
            })
        });
        return namaFile;
        }
        return ""
      }
      getOrder() {
        axioss.get('/api/v1/order/'+this.props.router.query.id,{
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
                    order_invoice:data.order_invoice,
                    order_description:data.order_description,
                    order_deadline:new Date(data.order_deadline),
                    customer_name:data.customer_name,
                    customer_address:data.customer_address,
                    customer_phone:data.customer_phone,
                    customer_email:data.customer_email,
                    customer_kecamatan:{label:data.customer_kecamatan, value:data.id_kecamatan},
                    customer_kabupaten:{label:data.customer_kabupaten, value:data.id_kabupaten},
                    customer_provinsi:{label:data.customer_provinsi, value:data.id_provinsi},
                    dokuments:renameKeys(data.document_orders,newKeys)
              } })
              this.getKabupaten(this.state.initialValues.customer_provinsi.value);
              this.getKecamatan(this.state.initialValues.customer_kabupaten.value);

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

    getProvinsi(){
        axioss.get('/api/v1/utiliti/provinsi').then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({provinsi: renamedObj})
        })
    }
     getKabupaten = id =>{
        axioss.get('/api/v1/utiliti/kabupaten/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kabupaten: renamedObj})
        })
    }
     getKecamatan = id =>{
        axioss.get('/api/v1/utiliti/kecamatan/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            this.setState({kecamatan: renamedObj})
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
            })
    }

    componentDidMount() {
        this.lookUpDokumen();
        this.getProvinsi();
        this.getOrder();
        
    }
    render(){
        const MyEnhancedForm = withFormik({
            mapPropsToValues: () => (this.state),
            validationSchema:() =>(getYupValidationSchema) ,

            // validate: values => {
            //     const {initialValues} = values
            //     const errors = {};
            //   if (!initialValues.dokumen_name) {
            //     errors.name = 'Required';
            //   }
          
            //   return errors;
            // },
          
            handleSubmit: (values, { setSubmitting }) => {onSubmit(values)},
          
            displayName: 'EditForm',
          })(EditForm);
                    
        return (
        <MyEnhancedForm/>
        
        )
    }
  }

function EditForm(props) {
    const { values,errors, handleChange, handleSubmit, setFieldValue,
        isSubmitting} = props
        const [progress, setProgress] = useState(0);
    const [kabupaten, setKabupaten] = useState(values.kabupaten)
    const [kecamatan, setKecamatan] = useState(values.kecamatan)
    const getKabupaten = id =>{
        axioss.get('/api/v1/utiliti/kabupaten/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            setKabupaten(renamedObj)
        })
    }
    const getKecamatan = id =>{
        axioss.get('/api/v1/utiliti/kecamatan/'+id).then(data => {
            const newKeys = ["value","label"];
            const renamedObj = renameKeys(data.data, newKeys);
            setKecamatan(renamedObj)
        })
    }
    const upload = (e,index) => {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            const namaFile = moment().valueOf()+"_"+image.name;            
            const uploadTask = storage.ref(`orders/${namaFile}`).put(image);
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
            storage.ref('orders').child(namaFile).getDownloadURL().then(url => {
                setFieldValue("initialValues.dokuments["+index+"].path",namaFile)
            })
        });
        }
        }

    return(
        <Layout title="Ubah Pemesanan">
             <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/order/list" >Pemesanan</Breadcrumb.Item>
                <Breadcrumb.Item active >Edit</Breadcrumb.Item>
            </Breadcrumb> 
            <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Pemesanan - Tambah</h3>
            <div className="card shadow">
            <form onSubmit={handleSubmit}>
				<div className="card-body">
                <p className="small font-weight-bold text-uppercase mb-0">Pelanggan</p>
                    <div className="form-group">
                        <label for="addCustName">Nama</label>
                        <input type="text" className="form-control" value={values.initialValues.customer_name} id="addCustName" name="initialValues.customer_name"
                        onChange={handleChange}
                        />
                        <ErrorMessage className="error-message" name="initialValues.customer_name">
                            {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                    </div>
                    <div className="form-group">
                        <label for="addCustEmail">Email</label>
                        <input onChange={handleChange} type="email" className="form-control" name="initialValues.customer_email" value={values.initialValues.customer_email} id="addCustEmail" />
                        <ErrorMessage className="error-message" name="initialValues.customer_email">
                            {msg => <div className="error-message">{msg}</div>}

                        </ErrorMessage>
                    </div>
                    <div className="form-group">
                        <label for="addCustPhone">Nomor Telepon</label>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">+62</span>
                            </div>
                            <input onChange={handleChange} type="text" className="form-control" name="initialValues.customer_phone" value={values.initialValues.customer_phone} id="addCustPhone" />
                        </div>
                        <ErrorMessage className="error-message" name="initialValues.customer_phone">
                                                        {msg => <div className="error-message">{msg}</div>}

                            </ErrorMessage>
                    </div>
                    <div className="row">
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label for="addCustProvince">Provinsi</label>
                                <Select
                                        
                                        name= "provinsi"
                                        id="addCustProvince"
                                        options={values.provinsi}
                                        defaultValue={values.initialValues.customer_provinsi}
                                        onChange={(e) =>{
                                            values.customer_provinsi = e.label
                                            getKabupaten(e.value)
                                        }}
                                    />
                            <ErrorMessage className="error-message" name="initialValues.customer_provinsi">
                                                    {msg => <div className="error-message">{msg}</div>}

                                </ErrorMessage>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label for="addCustCity">Kota/Kabupaten</label>
                                 <Select
                                        
                                        name= "kabupaten"
                                        id="addCustCity"
                                        options={kabupaten}
                                        defaultValue={values.initialValues.customer_kabupaten}
                                        onChange={(e) =>{
                                            values.customer_kabupaten = e.label
                                            getKecamatan(e.value)
                                        }}
                                    />
                                    
                            <ErrorMessage className="error-message" name="initialValues.customer_kabupaten">
                                                    {msg => <div className="error-message">{msg}</div>}

                                </ErrorMessage>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group">
                                <label for="addCustDistrict">Kecamatan</label>
                                <Select
                                        
                                        name= "kecamatan"
                                        id="addCustDistrict"
                                        options={kecamatan}
                                        defaultValue={values.initialValues.customer_kecamatan}
                                        onChange={(e) =>{
                                            values.customer_kecamatan = e.label
                                            
                                        }}
                                    />
                                <ErrorMessage className="error-message" name="initialValues.customer_kecamatan">
                                            {msg => <div className="error-message">{msg}</div>}

                                </ErrorMessage>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label for="addCustAddress">Alamat</label>
                        <textarea onChange={handleChange} className="form-control" id="addCustAddress" name="initialValues.customer_address" rows="2" value={values.initialValues.customer_address} ></textarea>
                        <ErrorMessage className="error-message" name="initialValues.customer_address">
                                                    {msg => <div className="error-message">{msg}</div>}

                        </ErrorMessage>
                    </div>
                    <p className="small font-weight-bold text-uppercase mb-0">Pesanan</p>
                    
                    <div className="form-group">
                        <label for="addOrderDesc">Deskripsi</label>
                        <textarea onChange={handleChange} className="form-control" id="addOrderDesc" name="initialValues.order_description" value={values.initialValues.order_description} rows="2" ></textarea>
                    </div>
                    <div className="form-group">
							<label for="addOrderEndDate">Tanggal Batas Akhir</label><br></br>
                            <DatePicker
                            className="form-control"
                                    selected={values.initialValues.order_deadline}
                                    name="initialValues.order_deadline"
                                    onChange={(e)=> {
                                        values.initialValues.order_deadline = e
                                        setFieldValue("initialValues.order_deadline",e)
                                        handleChange(e)
                                        
                                    }}
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    
                                />
                                <ErrorMessage className="error-message" name="initialValues.order_deadline">
                                            {msg => <div className="error-message">{msg}</div>}

                                </ErrorMessage>
						</div>
                    
                </div>
                <div className="card-footer">
                    <button type="submit"  className="btn btn-block btn-primary">Ubah Pesanan</button>
                </div>
                </form>
            </div>
        </Layout>

        
    )
}


function onSubmit (values,actions) {
  
    const data = {
        order_invoice: values.initialValues.order_invoice,
        order_description: values.initialValues.order_description,
        order_deadline :   moment(values.initialValues.order_deadline).format('YYYY-MM-DD'),
        customer_name : values.initialValues.customer_name,
        customer_address: values.initialValues.customer_address,
        customer_email: values.initialValues.customer_email,
        customer_kabupaten: values.initialValues.customer_kabupaten.label,
        customer_kecamatan:values.initialValues.customer_kecamatan.label,
        customer_phone: values.initialValues.customer_phone,
        customer_provinsi: values.initialValues.customer_provinsi.label, 
        customer_name: values.initialValues.customer_name,
        id_kabupaten: values.initialValues.customer_kabupaten.value,
        id_kecamatan: values.initialValues.customer_kecamatan.value,
        id_provinsi: values.initialValues.customer_provinsi.value,
    }
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': cookie.get('token')
    }
    axioss.put('/api/v1/order/'+values.initialValues.id,data,{'headers':headers})
    .then(response => {
        swal({
            title: "Tersimpan",
            text: "Data Dokumen Berhasil Terubah",
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

async function find(provinsi , data ) {
   const id = await provinsi.find((x) => {
       if(x.label == data.label){
           return x.value
       }
    })
    return id
}

export default withAuthSync(withRouter(OrderEdit));