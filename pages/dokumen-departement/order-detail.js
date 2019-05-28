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
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';


class OrderDokumenDetail extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            data:{},
            documents:[],
            dataUnggah: {file:"",
            idDepartement:""},
            columns:[
                {
                  dataField: 'id',
                  text: 'No',
                  formatter: (cell, row, rowIndex, extraData) => (
                    rowIndex + 1
                )
              },
              {
                dataField: 'dokumen_name',
                text: 'Dokumen',
                sort: true
              },
              {
                dataField: 'progres',
                text: 'Progress',
              },
              {
                dataField: 'no',
                text: 'Action',
                formatter: (cell, row, rowIndex, extraData) => (
                    <Fragment>
                      <div className="btn-group btn-group-sm">
                            <button type="button" onClick={this.download.bind(this,row.path)} className="btn btn-sm btn-outline-success"><i className="fas fa-download mr-2"></i>Unduh</button>
                            <button type="button"  onClick={this.process.bind(this,row.id)} class="btn btn-outline-warning"><i class="fas fa-check mr-2"></i>Proses</button>
                            <button type="button" onClick={this.handleShow.bind(this, row)} class="btn btn-outline-secondary"><i class="fas fa-upload mr-2"></i>Unggah</button>

                        </div>  
                    </Fragment>
                ),
              }
            ] 
        }
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
    }

    upload = e => {
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

    process (id) {
      axioss.delete('/api/v1/update-progress-dokumen-order/'+id,{
        headers: {
          'Authorization': cookie.get('token')
        } 
      })
      .then(resp =>{ 
        
            swal({
                title: "Status Berubah",
                text: "Status Sudah Berubah Menjadi Sedang Proses " ,
                icon: "error",
                button: "Ok",
              })
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

    batal (id) {
        axioss.delete('/api/v1/order-delete-dokumen/'+id,{
            headers: {
              'Authorization': cookie.get('token')
            } 
          })
          .then(resp =>{ 
              console.log(resp)
              if(resp.data){
                  console.log("berhasil", resp.data)
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

    download (data) {
    
        var starsRef = storage.ref('dokumen-matrix').child(data);
    
        // Get the download URL
        starsRef.getDownloadURL().then(function(url) {
          
          const link = document.createElement('a');
          link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(url));
          link.setAttribute('download', data);
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
        this.getOrder()
        this.getDokumen()
    }
    getDokumen(){
        axioss.get('/api/v1/departement-order-detail/'+this.props.router.query.id+'/by-user',{
            headers: {
              'Authorization': cookie.get('token')
            } 
          })
          .then(response => {
              return response.data.data
          })
          .then(documents =>{ 
              this.setState({documents})
          })
          .catch(err => {
            swal({
              title: "Error",
              text: "Error => " + err,
              icon: "error",
              button: "Ok",
            }).then(()=>{
              Router.push('/login')
            })
          })
    }
    getOrder(){
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
          })
          .catch(err => {
            swal({
              title: "Error",
              text: "Error => " + err,
              icon: "error",
              button: "Ok",
            }).then(()=>{
              Router.push('/login')
            })
          })
    }
    handleShow(id) {
      console.log(id)
      this.setState({
        filter:id.dokumen_type})
        this.setState({...this.state,
          dataUnggah:{
            ... this.state.dataUnggah,
            idDepartement: id.id
          }
        })
        
      this.setState({ show: true });
      
    }

    handleClose() {
      this.setState({ show: false });
    }
            
    render () {
        const { SearchBar } = Search;
        return (
        <Layout>
        {/* <Breadcrumb>
                <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="/dokumen-departement/list" >Pemesanan</Breadcrumb.Item>
                <Breadcrumb.Item active >{this.state.data.order_invoice}</Breadcrumb.Item>
        </Breadcrumb> */}
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
										<div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
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
                defaultSorted={ this.state.defaultSorted } 
                keyField='id' 
                data={this.state.documents} 
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
                        </div>
                        <hr />
                        <BootstrapTable
                        { ...props.baseProps }
                        bootstrap4
                        striped
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
							<button type="button" className="btn btn-block btn-outline-success" id="btnDone" disabled>Selesai</button>
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
            initialValues={this.state.dataUnggah}
            onSubmit={onSubmit}
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
      parentState} = props
      const [fileName, setFileName] = useState("");
      console.log(values);
      const upload = e => {
        console.log(e);
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
                  <label for="addDocExample">Contoh Dokumen</label>
                  <div className="custom-file">
                    {parentState.filter == "Tipe PNG" ? 
                     <input type="file" accept="image/*" className="custom-file-input" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                      handleChange(e)
                      values.file = upload(e)
                      }}/>
                    : ""}
                    {parentState.filter == "Tipe Dokumen" ? 
                    <input type="file" accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="custom-file-input"  id="addDocExample" name="file"  value={values.file} onClick={(e)=>{
                      handleChange(e)
                      values.file =upload(e)
                    }}/> : ""}                               
                      {parentState.filter == "Tipe PDF" ? 
                     <input type="file" accept="application/pdf" className="custom-file-input" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                      handleChange(e)
                      values.file = upload(e)
                      }}/>
                    : ""}
                    <label className="custom-file-label" for="addDocExample">{values.file}</label>
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

  function onSubmit (values) {
    let data = {
      file: values.fileName
    }
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': cookie.get('token')
  }
  axioss.put('/api/v1/update-sukses-dokumen-order/'+values.idDepartement,data,{'headers':headers})
  .then(response => {
      swal({
          title: "Tersimpan",
          text: "Data Dokumen Berhasil Tersimpan",
          icon: "success",
          button: "Ok",
        }).then(()=>{
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
  
export default withAuthSync(withRouter(OrderDokumenDetail));