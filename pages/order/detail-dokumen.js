import { Component, Fragment } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';
import axioss from 'axios';
import swal from 'sweetalert';
import Router from 'next/router';
import { withRouter } from 'next/router';
import Link from 'next/link';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {storage} from '../../utils/firebase';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
const divRight = {
  position : "absolute",
  right:"5%"
}

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    transform             : 'translate(-50%, -50%)'
  }
};

class DetailDokumen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parameter: {
        orderId:this.props.router.query.dokOrderId,
        invoice:this.props.router.query.invoice
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
        dataField: 'departement.name',
        text: 'Nama Departemen',
        sort: true
      },
      {
        dataField: 'status',
        text: 'Status',
        sort: true,
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
        formatter: (cell, row, rowIndex, extraData) => {
          if(row.status == "Sudah Diproses") {
             return <div className="btn-group btn-group-sm">
                <button type="button" onClick={this.download.bind(this,row.path)} className="btn btn-outline-success"><i className="fas fa-download mr-2"></i>Unduh</button>
                <button type="button" onClick={this.batal.bind(this,row.id)} className="btn btn-outline-danger"><i className="fas fa-times mr-2"></i>Progres Ulang</button>
              </div>
            }
          else {
             return <div className="btn-group btn-group-sm">
                <button type="button" className="btn btn-outline-success" disabled><i className="fas fa-download mr-2"></i>Unduh</button>
              </div>
          }
        },
      }
    ]
    };
    
  }

  download (data) {
    
    var starsRef = storage.ref('departemen-order').child(data);

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

  batal = e =>{
    axioss.get('/api/v1/update-progress-dokumen-order/'+e,{
      headers: {
        'Authorization': cookie.get('token')
      } 
    })
    .then(response => response.data.data)
    .then(data =>{ 
      this.setState({ data : data})
      this.refresh();
    })
    .catch(err => 
      swal({
        title: "Error",
        text: "Error => " + err,
        icon: "error",
        button: "Ok",
      })
    )
  }

 componentDidMount () {
   this.refresh();
 }

 refresh () {
  axioss.get('/api/v1/departement-order/by-dokumen-order-id',{
    params:this.state.parameter,   
    headers: {
      'Authorization': cookie.get('token')
    } 
  })
  .then(response => response.data.data)
  .then(data =>{ 
    this.setState({ data : data})
  })
  .catch(err => 
    swal({
      title: "Error",
      text: "Error => " + err,
      icon: "error",
      button: "Ok",
    })
  )
 }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.serverSide = 'infinite';
    var dataSource = {
      rowCount: 3, // for example
      getRows: function (params) { 
              params.successCallback(10, 20);
      }
    }

    this.gridApi.setDatasource(dataSource);
    
  }

  render () {
    const { SearchBar } = Search;

    return (
      <Layout title="Detail Dokumen Pemesanan">
         <Breadcrumb>
            <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item href="/order/list" >Pemesanan</Breadcrumb.Item>
            <Breadcrumb.Item href={`/order/detail?id=${this.props.router.query.orderId}`} >{this.props.router.query.invoice}</Breadcrumb.Item>
            <Breadcrumb.Item active >Detail Dokumen Pemesanan</Breadcrumb.Item>
          </Breadcrumb>  
          
        <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Detail Dokumen Pemesanan</h3>
      
        <ToolkitProvider
          defaultSorted={ this.state.defaultSorted } 
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
      </Layout>
      )
  }
}
  
export default withAuthSync(withRouter(DetailDokumen));