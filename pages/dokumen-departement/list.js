import { Component,Fragment ,  useState } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';
import swal from '@sweetalert/with-react';
import Router from 'next/router';
import { Formik, Field,ErrorMessage } from 'formik';
import Link from 'next/link';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {storage} from '../../utils/firebase';
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import dateFormat from 'dateformat';
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import http from '../../utils/http-service';

const divRight = {
  position : "absolute",
  right:"5%"
}
const parameter = {
  "sortBy":"createdAt","sort":"ASC","limit":"10","page":0
}
const dataUpload = {
  file:"",
  origin:"",
  link:"",
  idDepOrder:0
}
class DepartementOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialValues:{
        idDepOrder:0,
        tipeDokumen:""
      },
      data: [],
      defaultSorted : [{
        dataField: 'createdAt',
        order: 'desc'
      }],
      columns:[
        {
          dataField: 'id',
          headerAlign: 'center',
          text: 'No',
          formatter: (cell, row, rowIndex, extraData) => (
            rowIndex + 1
        )
      },
      {
        dataField: 'createdAt',
        headerAlign: 'center',
        text: 'Tanggal',
        sort: true,
        formatter: (cell, row, rowIndex, extraData) => (
          dateFormat(row.createdAt,"dd/mm/yyyy")
      )
      },
      {
        dataField: 'order_invoice',
        headerAlign: 'center',
        text: 'Invoice',
        sort: true
      },
      {
        dataField: 'customer_name',
        headerAlign: 'center',
        text: 'Nama Pelanggan',
      },
      {
        dataField: 'status',
        headerAlign: 'center',
        sort: true,
        text: 'Status',
        formatter: (cell, row, rowIndex, extraData) => {
          if(row.status == "Ditempatkan"){
            return <span className="badge badge-pill badge-secondary">Ditempatkan</span>
          }else if(row.status == "Dalam Proses"){
            return <span className="badge badge-pill badge-warning">Dalam Proses</span>
          }else if (row.status == "Sudah Diproses"){
            return <span className="badge badge-pill badge-success">Sudah Diproses</span>
          }
          
       },
      },
         
      {
        dataField: 'no',
        text: 'Action',
        formatter: (cell, row, rowIndex, extraData) => (
            <Fragment>
              <div className="btn-group btn-group-sm">
              <button type="button" onClick={this.downloadOrder.bind(this,row.pathFile)} className="btn btn-sm btn-outline-success"><i className="fas fa-download mr-2"></i>Unduh</button>
                  {row.status == "Ditempatkan" ?(                  
                  <button type="button"  onClick={this.process.bind(this,row.id)} class="btn btn-outline-warning"><i class="fas fa-check mr-2"></i>Proses</button>
                   ):""}
                  {row.status == "Dalam Proses" ?(
                  <button type="button" onClick={this.handleShow.bind(this, row)} class="btn btn-outline-secondary"><i class="fas fa-upload mr-2"></i>Unggah</button>
                  ):""}
                  {row.status == "Sudah Diproses" ?(
                  <button type="button" onClick={this.downloadHasil.bind(this,row.file)} className="btn btn-sm btn-outline-success"><i className="fas fa-download mr-2"></i>Unduh Hasil</button>
                  ):""}

              </div>
            </Fragment>
        ),
      }
    ] 
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }

  handleShow(id) {
    this.setState({... this.state,
      
      initialValues:{
        ... this.state.initialValues,
        idDepOrder:id.id,
        tipeDokumen:id.dokumen_type
      }
    })
    this.setState({ show: true });
    
  }

  handleClose() {
    this.setState({ show: false });
    this.refreshData();
  }

  process (id) {
    http.get('/api/v1/update-progress-dokumen-order/'+id,{
      headers: {
        'Authorization': cookie.get('token')
      } 
    })
    .then(resp =>{ 
      
          swal({
              title: "Status Berubah",
              text: "Status Sudah Berubah Menjadi Sedang Proses " ,
              icon: "success",
              button: "Ok",
            }).then(()=>   this.refreshData() )
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
  downloadHasil (data) {
    try{
      var starsRef = storage.ref('orders-departement').child(data);
      starsRef.getDownloadURL().then(function(url) {
        const link = document.createElement('a');
        link.setAttribute('href', url);          
        link.setAttribute('target', "_blank");
        link.setAttribute('download', data);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
      })
    }catch(error){
      swal({
        title: "Error",
        text: "Error => " + error.code,
        icon: "error",
        button: "Ok",
      })
    }
    
  }
  downloadOrder (data) {
    try{
      var starsRef = storage.ref('orders').child(data);
      starsRef.getDownloadURL().then(function(url) {
        const link = document.createElement('a');
        link.setAttribute('href', url);          
        link.setAttribute('target', "_blank");
        link.setAttribute('download', data);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
      })
    }catch(error){
      swal({
        title: "Error",
        text: "Error => " + error.code,
        icon: "error",
        button: "Ok",
      })
    }
    
  }

  refreshData(){
    http.get('/api/v1/departement-order/by-user',{
      params:parameter,   
      headers: {
        'Authorization': cookie.get('token')
      } 
    })
    .then(response => response.data.data)
    .then(data =>{ 
      this.setState({ data : data})
    })
  }

 componentDidMount () {
   this.refreshData()
 }
render () {
  const { SearchBar } = Search;
  return (
    <Layout title="Pemesanan Departemen">

       <Breadcrumb>
                <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active >Pemesanan</Breadcrumb.Item>
        </Breadcrumb>
      <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Pemesanan</h3>
      <ToolkitProvider
           
          keyField='id' 
          data={this.state.data} 
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
                  defaultSorted={ this.state.defaultSorted } 
                  bootstrap4
                  striped
                  hover
                  condensed
                  pagination={ paginationFactory() } 
                />
              </div>
            )
          }
        </ToolkitProvider>
        <style jsx>{`
            .div-right: {
              position: absolute;
              right: 0;
            }
            
          `}</style>
        <Modal
        show={this.state.show}
        onHide={this.handleClose}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
          <Formik
          initialValues={dataUpload}
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
    parentState} = props
    const [progress, setProgress] = useState(0);

    const upload = (e) => {
      values.fileName = e
      values.nameOfFile= e.target.files[0].name
      values.idDepOrder = parentState.initialValues.idDepOrder
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
                <label for="addDocExample">Upload Dokumen</label>
                <div className="custom-file">
                {parentState.initialValues.tipeDokumen == "Tipe Dokumen" ? 
                
                  <input type="file" accept=".pdf,.csv, .doc,.docx,.xlsx, .xls,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="custom-file-input" 
                      id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                        handleChange(e)
                        upload(e)
                        }}/>:""
                }
                {parentState.initialValues.tipeDokumen == "Tipe Gambar" ? 
                
                <input type="file" accept="image/*" className="custom-file-input" 
                    id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                      handleChange(e)
                      upload(e)
                      }}/>:""
              }
                    
                    <label className="custom-file-label" for="addDocExample">{values.nameOfFile}</label>
                  </div>

              </div>
            </Modal.Body>
          <Modal.Footer>
                <button type="submit"  className="btn btn-block btn-primary" >
                Simpan Dokumen
              </button>
          </Modal.Footer>
          </form>
      </Fragment>
  )
}

function upload (values,action) {
  let progress = 0
  if (values.fileName.target.files[0]) {
      const image = values.fileName.target.files[0];
      const namaFile = moment().valueOf()+"_"+image.name;
      const uploadTask = storage.ref(`orders-departement/${namaFile}`).put(image);
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
          storage.ref('orders-departement').child(namaFile).getDownloadURL().then(url => {
              values.link = url
              values.origin = namaFile
              values.fileName =""
              setTimeout(()=>{
                  onSubmit(values,action)
              },3000)
              
          })
      });
  }
}


function onSubmit (values, closed) {
  let data = {
    file: values.origin,
    link: values.link
  }

  var headers = {
    'Content-Type': 'application/json',
    'Authorization': cookie.get('token')
}
http.put('/api/v1/update-sukses-dokumen-order/'+values.idDepOrder,data,{'headers':headers})
.then(response => {
    swal({
        title: "Tersimpan",
        text: "Data Dokumen Berhasil Tersimpan",
        icon: "success",
        button: "Ok",
      }).then(()=>{
        closed();
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

export default withAuthSync(DepartementOrder);