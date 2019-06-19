import { Component, Fragment, useState } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import fetch from 'isomorphic-unfetch';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import Link from 'next/link';
import swal from '@sweetalert/with-react';
import { withRouter } from 'next/router'
import axioss from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import {storage} from '../../utils/firebase';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import dateFormat from 'dateformat';

import http from '../../utils/http-service';
const getYupValidationSchema = Yup.object({
  // addDokumen:Yup.object({
    documentId: Yup.string()
      .required('Dokumen tidak boleh kosong!'),
    nameOfFile: Yup.string()
    .required('Contoh Dokumen tidak boleh kosong!'),
     
      
      
  // })
  
})
class OrderDetail extends React.Component {
    static getInitialProps(something) {
      return {
        pageLog: "sanguan",
      }
    }

    constructor(props){
        super(props)
        this.state = {
          id:this.props.router.query.id,
            show: false,
            data:{},
            doc_order:[],
            dokumenOrder:[],
            progress:0,
            acceptUpload:"",
            addDokumen:{
              orderId:this.props.router.query.id, 
              documentId:"", 
              origin:"",
              departements:[],
              fileName:""
            },
            documentSelect:[],
            documents:[],
            dokSelek:[],
            columns:[
                {
                  dataField: 'id',
                  text: 'No',
                  formatter: (cell, row, rowIndex, extraData) => (
                    rowIndex + 1
                )
              },
              {
                dataField: 'document.dokumen_name',
                text: 'Dokumen',
                sort: true
              },
              {
                dataField: 'progres',
                text: 'Progress',
                formatter: (cell, row, rowIndex, extraData) => (
                  <ProgresDepOrder id={row.departement_orders}/>
              )
              },
              {
                dataField: 'no',
                text: 'Action',
                formatter: (cell, row, rowIndex, extraData) => {
                   return <Fragment>
                      <div className="btn-group btn-group-sm">
                            {/* <button type="button" onClick={this.download.bind(this,row)} className="btn btn-sm btn-outline-success"><i className="fas fa-download mr-2"></i>Unduh</button> */}
                            <a href={row.link} target="blank"className="btn  btn-success"><i className="fas fa-download mr-2"></i>Unduh</a>
                            <Link href={{pathname: '/order/detail-dokumen', query: {orderId:this.state.data.id ,dokOrderId: row.id,invoice:this.state.data.order_invoice}}}><a href="order-document-detail.html" className="btn btn-outline-primary"><i className="fas fa-eye mr-2"></i>Detail</a></Link>
                            { this.progresData(row.departement_orders)  ? 
                              <button type="button" onClick={this.batal.bind(this,row.id,this.state.id)}
                               className="btn btn-outline-danger btn-delete">
                               <i className="fas fa-times mr-2"></i>Batal</button>
                               :null}
                        </div>  
                    </Fragment>
                }
          
              }
            ] 
        }
        this.selesai = this.selesai.bind(this);
        this.handleSelectDokumen = this.handleSelectDokumen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        // this.upload = this.upload.bind(this);
        
    }

    async filterDokumen(dokumen, data) {
        let dox = await dokumen.reduce((prev,value) => {
          var isDuplicate = false
          for (var i = 0; i < data.length; i++) {
            
              if (value.value == data[i]) {
                  isDuplicate = true;
                  break;
              }
          }
          if (!isDuplicate) {
              prev.push(value);
          }
            
          return prev;
          
      },[])
      data.forEach((m) => {
        this.setState({dokSelek:dox})
       })
    }

    handleSelectDokumen(e){
     
      this.setState({... this.state,
        acceptUpload:e.document_type,
        addDokumen:{ 
          ... this.state.addDokumen,
          documentId : e.value,
          departements:e.departements
        }
      })
    }

    handleShow() {
      if(this.state.documents.length > 0){
        this.filterDokumen(this.state.documentSelect, this.state.documents.map((x)=>x.documentId))
      }else{
        this.setState({dokSelek:this.state.documentSelect})
      }
      
      this.setState({ show: true });
      
    }

    handleClose(params) {
      // console.log(params)
      this.setState({ show: false });
      this.refresh();
      
    }

    batal (id, orderId) {
      
        axioss.delete('/api/v1/order-delete-dokumen/'+id,{
            headers: {
              'Authorization': cookie.get('token')
            } 
          })
          .then(resp =>{ 
              if(resp.data){
                swal({
                  title: "Batal Dokumen",
                  text: "Batal Dokumen Berhasil dilakukan " ,
                  icon: "success",
                  button: "Ok",
                }).then(e => {
                  Router.push('/order/detail?id='+orderId)
                  this.refresh();
                })
              }else{
                swal({
                    title: "Batal Dokumen",
                    text: "Batal Dokumen Gagal Mohon Diperiksa kembali => " ,
                    icon: "error",
                    button: "Ok",
                  })
              }
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
    selesai (id) {
      if(this.state.progress == 100){
        axioss.post('/api/v1/update-sukses-order/'+id,
        {order_invoice:this.state.data.order_invoice,
          customer_email:this.state.data.customer_email},{
          headers: {
            'Authorization': cookie.get('token')
          } 
        })
        .then(response => {
          swal({
            title: "Status Finish",
            text: "Pesanan Telah Selesai",
            icon: "success",
            button: "Ok",
          }).then(()=>{
            Router.push('/order/list')
          });
        })
        .catch(err => {
          swal({
            title: "Error",
            text: "Error => " + err,
            icon: "error",
            button: "Ok",
          })
        })
      }else{
        swal({
          title: "Error",
          text: "Progres Status Harus 100%",
          icon: "error",
          button: "Ok",
        })
      }
      
    }
    

    download (data) {
        var starsRef = storage.ref('orders').child(data.pathFile);
        starsRef.getDownloadURL().then(function(url) {
          
          const link = document.createElement('a');
          link.setAttribute('href', url);          
          link.setAttribute('target', "_blank");
          link.setAttribute('download', data.pathFile);
          document.body.appendChild(link);
          
          link.click();
          document.body.removeChild(link);
        }).catch(function(error) {
           swal({
                title: "Error",
                text: "Error => " + error,
                icon: "error",
                button: "Ok",
              })
        });
      }
      
    componentDidMount () {
      console.log(this.props)
      if(process.browser){
       this.refresh()
      }
    }
    refresh(){
      axioss.get('/api/v1/order/'+this.state.id,{
        headers: {
          'Authorization': cookie.get('token')
        } 
      })
      .then(response => {
          return response.data.data
      })
      .then(data =>{ 
        this.setState({id:data.id})
          this.setState({data})
          this.setState({documents:data.document_orders.filter(x=>!x.isDelete)})
          
      })
      .catch(err => {
        swal({
          title: "Error",
          text: "Error => " + err,
          icon: "error",
          button: "Ok",
        })
      })
      this.hitungProgres();
      this.lookUpDokumen();
      this.lookUpDokumenOrder(this.props.router.query.id)
    }
    lookUpDokumen(){
      axioss.get('/api/v1/document-lookup',{   
          headers: {
          'Authorization': cookie.get('token')
          }
          }).then(response =>  response.data)
          .then(data => {
              const newKeys = ["value","label","document_type","departements"];
              const renamedObj = renameKeys(data.data, newKeys);
              this.setState({documentSelect:renamedObj })
          }).catch((err)=>{
            swal({
              title: "Error",
              text: "Error => " + err,
              icon: "error",
              button: "Ok",
            })
          })
    }
    lookUpDokumenOrder(id){
      axioss.get('/api/v1/document-orders/'+id,{   
          headers: {
          'Authorization': cookie.get('token')
          }
          }).then(response =>  response.data)
          .then(data => {
            this.setState({dokumenOrder:data.data})
          }).catch((err)=>{
            swal({
              title: "Error",
              text: "Error => " + err,
              icon: "error",
              button: "Ok",
            })
          })
    }
      
    hitungProgres() {
      axioss.get('/api/v1/order/check-progress/'+this.props.router.query.id,{   
        headers: {
        'Authorization': cookie.get('token')
        }
        }).then(response =>  response.data.data)
        .then(data => {
          if(data[0]){
            let progresTotal = 0
            if(data[0].total != 0){
              progresTotal = (data[0].totalDepartement / data[0].total) * 100
            }
            this.setState({progress:progresTotal})
          }
        })

    }

    progresData (props) {
      const dokumenlength = props.length 
         const persentase = props.filter((x)=>x.status == "Sudah Diproses").length
         const progresTotal = (dokumenlength != 0) ? (persentase / dokumenlength) * 100 : 0
         if(progresTotal == 100){
           return false
         } else {
           return true
         }
      // return false
     }
            
    render () {
        const { SearchBar } = Search;
        return (
          <Layout title="Detail Pemesanan">
          <Breadcrumb>
            <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item href="/order/list" >Pemesanan</Breadcrumb.Item>
            <Breadcrumb.Item active >{this.state.data.order_invoice}</Breadcrumb.Item>
          </Breadcrumb>  
            <h3 className="title"><i className="fas fa-shopping-cart fa-fw mr-2"></i>Detail Pemesanan</h3>
			<div className="card shadow">
				<div className="card-body">
					<div className="row">
						<div className="col-lg-6">
							<dl className="row mb-lg-0">
								<small className="col-sm-12">Detail</small>
								<dt className="col-sm-4">Invoice</dt>
								<dd className="col-sm-8">: {this.state.data.order_invoice}</dd>
								<dt className="col-sm-4">Tanggal</dt>
								<dd className="col-sm-8">: {dateFormat(this.state.data.createdAt,"dd/mm/yyyy")}</dd>
								<dt className="col-sm-4">Batas Akhir</dt>
								<dd className="col-sm-8">: {dateFormat(this.state.data.order_deadline,"dd/mm/yyyy")}</dd>
								<dt className="col-sm-4">Perkembangan</dt>
								<dd className="col-sm-8 pb-lg-2">
									
                  {this.state.data.order_status == 'Finish' ? <span className="badge badge-pill badge-success d-block">Selesai</span> :
                   <div className="progress"> 
                   <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100" style={{width:this.state.progress+"%"}}>
                   <span>{parseInt(this.state.progress)}%</span></div>
										
                   </div>
                  }
								</dd>
                <dt className="col-sm-4">Tanggal Selesai</dt>
                <dd className="col-sm-8">: {this.state.data.date_succses != null ? dateFormat(this.state.data.date_success,"dd/mm/yyyy"): "-"}</dd>
								<dt className="col-sm-12">Deskripsi</dt>
								<dd className="col-sm-12 mb-lg-0">{this.state.data.order_description}</dd>
							</dl>
						</div>
						<div className="col-lg-6">
							<dl className="row mb-lg-0">
								<small className="col-sm-12">Pelanggan</small>
								<dt className="col-sm-4">Nama</dt>
								<dd className="col-sm-8">: {this.state.data.customer_name}</dd>
								<dt className="col-sm-4">Email</dt>
								<dd className="col-sm-8">:  {this.state.data.customer_email}</dd>
								<dt className="col-sm-4">Nomor Telepon</dt>
								<dd className="col-sm-8">: +62  {this.state.data.customer_phone}</dd>
								<dt className="col-sm-4">Alamat</dt>
								<dd className="col-sm-8">:  {this.state.data.customer_address}</dd>
								<dt className="col-sm-4">Kecamatan</dt>
								<dd className="col-sm-8">: {this.state.data.customer_kecamatan}</dd>
								<dt className="col-sm-4">Kota/Kab.</dt>
								<dd className="col-sm-8">: {this.state.data.customer_kabupaten}</dd>
								<dt className="col-sm-4">Provinsi</dt>
								<dd className="col-sm-8">: {this.state.data.customer_provinsi}</dd>
							</dl>
						</div>
					</div>
            <hr/>
                <dl className="row">
                  <small className="col-sm-12">Dokumen</small>
                  
                </dl>
                
            <ToolkitProvider
                keyField='id' 
                data={this.state.dokumenOrder} 
                columns={ this.state.columns }
                noDataIndication="Table is Empty"
                search
                >
                {
                    props => (
                    <div>
                        <div className="row">
                        <div className="col">
                        <SearchBar { ...props.searchProps } />
                        </div>
                        { this.state.data.order_status != 'Finish' ?  <div className="col">
                          <button className="btn btn-block btn-success"  onClick={this.handleShow.bind(this)}>Tambah Dokumen</button>
                        </div>
                         : null 
                        }
                        
                        </div>
                        <hr />
                        <BootstrapTable
                        { ...props.baseProps }
                        bootstrap4
                        hover
                        condensed 
                        />
                    </div>
                    )
                }
                </ToolkitProvider>
            </div>
            </div>
            <div className="card-footer">
            
					<div className="row">
          { this.state.data.date_succses == null || this.state.data.order_status != 'Finish' ? 
						<div className="col">
							<button type="button" onClick={this.selesai.bind(this,this.props.router.query.id)} className="btn btn-block btn-outline-success" disabled={this.state.progress != 100} >Selesai</button>
						</div>: null
          }
            { this.state.data.order_status != 'Finish' ? 
                <div className="col">
                  <Link href={`/order/edit?id=${this.props.router.query.id}`}>
                    <a href="order-edit.html" className="btn btn-block btn-primary">Ubah</a>
                  </Link>
                </div>
              : null 
            }
					</div>
				
                         
				</div>		
        <Modal
          show={this.state.show}
          onHide={this.handleClose}
          dialogClassName="modal-90w"
          aria-labelledby="example-custom-modal-styling-title"
        >
           <Formik
            initialValues={this.state.addDokumen}
            validationSchema={getYupValidationSchema}
            onSubmit={(e)=>upload(e, this.handleClose)}
            render={ props =>{
                return <ModalForm  {...props} parentState={this.state}
                />
            }}
        />
        </Modal>
        </Layout>
        
        )
    }
  }

  function ModalForm (props) {
    const { values,errors, handleChange, handleSubmit, setFieldValue,
      parentState, closed} = props
      const [selected, setSelected] = useState("");
      const upload = (e) => {
        if(e.target.files[0]){
          setFieldValue("fileName",e)
          setFieldValue("nameOfFile",e.target.files[0].name)
        }
      
      }
    return(
      <Fragment>
        <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
              Tambah Dokumen
            </Modal.Title>
          </Modal.Header>
          
              <Modal.Body>
                <div className="form-group">
                  <label for="addCustDistrict">Dokumen</label>
                  <Select
                      name="documentId" 
                      id="addOrderDocName"
                      options={parentState.dokSelek}
                      onChange={(e)=>{
                        handleChange(e);
                        values.departements = e.departements
                        values.documentId = e.value
                        setSelected(e.document_type)
                        setFieldValue("fileName",null)
                        setFieldValue("file",null)
                        setFieldValue("nameOfFile","")
                      }}
                  />
                  <ErrorMessage name="documentId" >
                            {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                </div>
                
                <div className="form-group">
                  <label for="addDocExample">Contoh Dokumen</label>
                  <div className="custom-file">
                    {selected == "Tipe Gambar" ? 
                     <input type="file" accept="image/*" className="custom-file-input" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                      handleChange(e)
                      upload(e)
                      }}/>
                    : ""}
                    {selected == "Tipe Dokumen" ? 
                     <input type="file" className="custom-file-input"  accept=".pdf,.csv, .doc,.docx,.xlsx, .xls,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="custom-file-input" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                      handleChange(e)
                      upload(e)
                      }}/>
                    : ""}
                    <label className="custom-file-label" for="addDocExample">{values.nameOfFile}</label>
                    <ErrorMessage name="nameOfFile" >
                            {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                  </div>
                </div>
              </Modal.Body>
            <Modal.Footer>
                {/* <button variant="secondary" onClick={handleClose}>
                  Close
                </button> */}
                <button type="submit"  className="btn btn-block btn-primary" >
                  Tambah Dokumen
                </button>
            </Modal.Footer>
            </form>
        </Fragment>
    )
  }

  
  function ProgresDepOrder (props) {
   const dokumenlength = props.id.filter((x)=>!x.departement.isDelete).length 
      const persentase = props.id.filter((x)=>!x.departement.isDelete && x.status == "Sudah Diproses").length
      const progresTotal = (dokumenlength != 0) ? (persentase / dokumenlength) * 100 : 0
      if(progresTotal == 100){
        return <span className="badge badge-pill badge-success d-block">Selesai</span>
      } else {
        return <div class="progress">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" aria-valuenow="100" 
                  aria-valuemin="0" aria-valuemax="100" 
                  style={{width:progresTotal+"%"}} ><span>{progresTotal}%</span></div>
            </div>
      }
  }

  function upload (values,action) {
    let progress = 0
    if (values.fileName.target.files[0]) {
        const image = values.fileName.target.files[0];
        const namaFile = moment().valueOf()+"_"+image.name;
        const uploadTask = storage.ref(`orders/${namaFile}`).put(image);
        const task =  uploadTask.on('state_changed', 
        (snapshot) => {
        // progrss function ....
            progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            
            swal({
                text: "Upload Progress",
                closeOnClickOutside: false,
                button: false,
                closeOnClickOutside: false,
                showConfirmButton: false,
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
            storage.ref('orders').child(namaFile).getDownloadURL().then(url => {
                values.link = url
                values.origin = namaFile
                values.fileName =""
                onSubmit(values,action)
                
            })
        });
    }
  }
  
  function onSubmit (values, closed) {
    let data = {
      departements: values.departements,
      documentId: values.documentId,
      origin: values.origin,
      link:values.link
    }
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': cookie.get('token')
  }
  http.post('/api/v1/order/add-dokumen/'+values.orderId,data,{'headers':headers})
  .then(response => {
      swal({
          title: "Tersimpan",
          text: "Data Dokumen Berhasil Tersimpan",
          icon: "success",
          button: "Ok",
        }).then(()=>{
          Router.push("/order/detail?id="+values.orderId)
          closed(values.orderId);
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
  
export default withAuthSync(withRouter(OrderDetail));