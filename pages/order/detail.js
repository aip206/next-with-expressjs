import { Component, Fragment, useState } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import fetch from 'isomorphic-unfetch';
import Layout from '../../components/Layout';
import { Formik, Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import Link from 'next/link';
import swal from 'sweetalert';
import { withRouter } from 'next/router'
import axioss from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import {storage} from '../../utils/firebase';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select';
import moment from 'moment';
import Breadcrumb from 'react-bootstrap/Breadcrumb';


class OrderDetail extends React.Component {
    constructor(props){
        super(props)
        this.state = {
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
              departements:[]
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
                formatter: (cell, row, rowIndex, extraData) => (
                    <Fragment>
                      <div className="btn-group btn-group-sm">
                            <button type="button" onClick={this.download.bind(this,row)} className="btn btn-sm btn-outline-success"><i className="fas fa-download mr-2"></i>Unduh</button>
                            <Link href={{pathname: '/order/detail-dokumen', query: {orderId:this.state.data.id ,dokOrderId: row.id,invoice:this.state.data.order_invoice}}}><a href="order-document-detail.html" className="btn btn-outline-primary"><i className="fas fa-eye mr-2"></i>Detail</a></Link>
                            <button type="button" onClick={this.batal.bind(this,row.id)} className="btn btn-outline-danger btn-delete"><i className="fas fa-times mr-2"></i>Batal</button>
                        </div>  
                    </Fragment>
                ),
              }
            ] 
        }
        this.selesai = this.selesai.bind(this);
        this.handleSelectDokumen = this.handleSelectDokumen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.upload = this.upload.bind(this);
        
    }

    upload = e => {
      if (e.target.files[0]) {
          const image = e.target.files[0];
          const namaFile = moment().valueOf()+"_"+image.name;
          const uploadTask = storage.ref(`orders/${namaFile}`).put(image);
          console.log(this.state);
    
          this.setState({... this.state,
            addDokumen:{ 
              ... this.state.addDokumen,
              origin :namaFile
            }
          })
          uploadTask.on('state_changed', 
          (snapshot) => {
          // progrss function ....
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          // setProgress(progress)
          }, 
          (error) => {
              // error function ....
          console.log(error);
          });
        }
      }

    filterDokumen(dokumen, data) {
      data.forEach((m) => {
        this.setState({dokSelek:this.state.documentSelect.filter((x)=> x.value != m)})
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
        this.filterDokumen(this.state.documentSelect, this.state.documents.map((x)=>x.id))
      }else{
        this.setState({dokSelek:this.state.documentSelect})
      }
      
      this.setState({ show: true });
      
    }

    handleClose() {
      this.setState({ show: false });
    }

    batal (id) {
      
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
                  icon: "succsess",
                  button: "Ok",
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
        axioss.post('/api/v1/update-sukses-order/'+id,{order_invoice:this.state.data.order_invoice},{
          headers: {
            'Authorization': cookie.get('token')
          } 
        })
        .then(response => {
          console.log(response)
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
        var starsRef = storage.ref('orders').child(data.document_orders.pathFile);
        starsRef.getDownloadURL().then(function(url) {
          
          const link = document.createElement('a');
          link.setAttribute('href', url);          
          link.setAttribute('target', "_blank");
          link.setAttribute('download', data.document_orders.pathFile);
          document.body.appendChild(link);
          
          link.click();
          document.body.removeChild(link);
        }).catch(function(error) {
           swal({
                title: "Error",
                text: "Error => " + error.code,
                icon: "error",
                button: "Ok",
              })
        });
      }
      
    componentDidMount () {
        axioss.get('/api/v1/order/'+this.props.router.query.id,{
          headers: {
            'Authorization': cookie.get('token')
          } 
        })
        .then(response => {
            return response.data.data
        })
        .then(data =>{ 
            this.setState({data})
            this.setState({documents:data.documents})
            this.setState({doc_order:data.documents.document_orders})
            this.hitungProgres()
        })
        .catch(err => {
          swal({
            title: "Error",
            text: "Error => " + err,
            icon: "error",
            button: "Ok",
          })
        })
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
          }).catch((e)=>{
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
      const dokumenlength = this.state.documents.length 
      const persentase = this.state.documents.filter((x)=>x.document_orders.status == "FINISH").length
      console.log(dokumenlength)
      console.log(persentase)
      const progresTotal = (persentase / dokumenlength) * 100
      this.setState({progress:progresTotal})

    }
            
    render () {
        const { SearchBar } = Search;
        return (
        <Layout>
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
								<dd className="col-sm-8">: {this.state.data.createdAt}</dd>
								<dt className="col-sm-4">Batas Akhir</dt>
								<dd className="col-sm-8">: {this.state.data.order_deadline}</dd>
								<dt className="col-sm-4">Perkembangan</dt>
								<dd className="col-sm-8 pb-lg-2">
									<div className="progress">
										<div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100" style={{width:this.state.progress+"%"}}>{this.state.progress}%</div>
									</div>
								</dd>
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
                        <div className="col"><button className="btn btn-block btn-success"  onClick={this.handleShow.bind(this)}>Tambah Dokumen</button></div>
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
						<div className="col">
							<button type="button" onClick={this.selesai.bind(this,this.props.router.query.id)} className="btn btn-block btn-outline-success" disabled={this.state.progress != 100} >Selesai</button>
						</div>
						<div className="col">
                        <Link href={`/order/edit?id=${this.props.router.query.id}`}>
							<a href="order-edit.html" className="btn btn-block btn-primary">Ubah</a>
                            </Link>
						</div>
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
            onSubmit={(e)=>onSubmit(e, this.handleClose)}
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
      const [fileName, setFileName] = useState("");

      const upload = e => {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            console.log(image);
            const namaFile = moment().valueOf()+"_"+image.name;
            const uploadTask = storage.ref(`orders/${namaFile}`).put(image);
            uploadTask.on('state_changed', 
            (snapshot) => {
            // progrss function ....
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            }, 
            (error) => {
                // error function ....
            console.log(error);
            }, 
        () => {
            setFieldValue("fileName",namaFile)
        });
        return namaFile
        }
        return ""
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
                      }}
                  />
                </div>
                
                <div className="form-group">
                  <label for="addDocExample">Contoh Dokumen</label>
                  <div className="custom-file">
                    {selected == "Tipe PNG" ? 
                     <input type="file" accept="image/*" className="custom-file-input" id="addDocExample" value={values.origin} name="origin"  onChange={(e)=>{
                      handleChange(e)
                      values.origin = upload(e)
                      }}/>
                    : ""}
                    {selected == "Tipe Dokumen" ? 
                    <input type="file" accept=".csv" className="custom-file-input"  id="addDocExample" name="origin"  value={values.origin} onClick={(e)=>{
                      handleChange(e)
                      values.origin =upload(e)
                    }}/> : ""}                               
                      {selected == "Tipe PDF" ? 
                     <input type="file" accept="application/pdf" className="custom-file-input" id="addDocExample" value={values.origin} name="origin"  onChange={(e)=>{
                      handleChange(e)
                      values.origin = upload(e)
                      }}/>
                    : ""}
                    <label className="custom-file-label" for="addDocExample">{values.origin}</label>
                        <input type="hidden" name={values.file} name="filename"/>         
                  </div>
                </div>
              </Modal.Body>
            <Modal.Footer>
                {/* <button variant="secondary" onClick={handleClose}>
                  Close
                </button> */}
                <button >
                  Save Changes
                </button>
            </Modal.Footer>
            </form>
        </Fragment>
    )
  }

  
  function ProgresDepOrder (props) {
   const dokumenlength = props.id.length 
      const persentase = props.id.filter((x)=>x.status == "Sudah Diproses").length
      console.log(dokumenlength)
      console.log(persentase)
      const progresTotal = (persentase / dokumenlength) * 100
  return <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" 
            role="progressbar" aria-valuenow="100" 
            aria-valuemin="0" aria-valuemax="100" 
            style={{width:progresTotal+"%"}} >{progresTotal}%</div>
      </div>
  }
  
  function onSubmit (values, closed) {
    console.log(closed);
    let data = {
      departements: values.departements,
      documentId: values.documentId,
      origin: values.fileName
    }
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': cookie.get('token')
  }
  axioss.post('/api/v1/order/add-dokumen/'+values.orderId,data,{'headers':headers})
  .then(response => {
      swal({
          title: "Tersimpan",
          text: "Data Dokumen Berhasil Tersimpan",
          icon: "success",
          button: "Ok",
        }).then(()=>{
          closed();
          Router.push("/order/detail",{id:values.orderId})
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
  
export default withAuthSync(withRouter(OrderDetail));