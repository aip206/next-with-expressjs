import { Component,Fragment ,  useState } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';
import swal from 'sweetalert';
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
class DepartementOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialValues:{
        idDepOrder:0,
        tipeDokumen:"",
        file:undefined,
        origin:""
      },
      data: [],
      defaultSorted : [{
        dataField: 'createdAt',
        order: 'desc'
      }],
      columns:[
        {
          dataField: 'id',
          text: 'No',
          formatter: (cell, row, rowIndex, extraData) => (
            rowIndex + 1
        )
      },
      {
        dataField: 'createdAt',
        text: 'Tanggal',
        sort: true,
        formatter: (cell, row, rowIndex, extraData) => (
          dateFormat(row.createdAt,"dd/mm/yyyy")
      )
      },
      {
        dataField: 'order_invoice',
        text: 'Invoice',
        sort: true
      },
      {
        dataField: 'customer_name',
        text: 'Nama Pelanggan',
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
  }

  process (id) {
    http.delete('/api/v1/update-progress-dokumen-order/'+id,{
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
      console.log(error)
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
      console.log(error)
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
    <Layout>
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
          initialValues={this.state.initialValues}
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
    parentState} = props
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState("");

    const upload = e => {
      console.log(e.target.files);
      if (e.target.files[0]) {
        const image = e.target.files[0];
        const namaFile = moment().valueOf()+"_"+image.name;
        const uploadTask = storage.ref(`orders-departement/${namaFile}`).put(image);
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
       setFieldValue("origin",namaFile)
      })
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
                <label for="addDocExample">Upload Dokumen</label>
                <div className="custom-file">
                  {values.tipeDokumen == "Tipe PNG" ? 
                   <input type="file" accept=".png" className="custom-file-input" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                    handleChange(e)
                    upload(e)
                    }}/>
                  : ""}
                  {values.tipeDokumen == "Tipe Dokumen" ? 
                  <input type="file" accept=".csv" className="custom-file-input"  id="addDocExample" name="file"  value={values.file} onClick={(e)=>{
                    handleChange(e)
                    upload(e)
                  }}/> : ""}                               
                    {values.tipeDokumen == "Tipe PDF" ? 
                   <input type="file" accept="application/pdf" className="custom-file-input" id="addDocExample" value={values.file} name="file"  onChange={(e)=>{
                    handleChange(e)
                    upload(e)
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


function onSubmit (values, closed) {
  let data = {
    file: values.origin
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