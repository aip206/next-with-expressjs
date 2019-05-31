import { Component, Fragment } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';
import http from '../../utils/http-service.js';
import swal from 'sweetalert';
import Router from 'next/router';
import Link from 'next/link';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {storage} from '../../utils/firebase';
import Breadcrumb from 'react-bootstrap/Breadcrumb'
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
  },
  headerTable : {
    marginBottom : '10px'
  }
};
const parameter = {
  "sortBy":"createdAt","sort":"ASC","limit":"10","page":0
}
class DokumenMatrix extends Component {
  constructor(props) {
    super(props);
    this.deleteRow = this.deleteRow.bind(this);
    this.download = this.download.bind(this);
    this.state = {
      data: [],
      defaultSorted : [{
        dataField: 'createdAt',
        order: 'desc'
      }],
      columns:[
        {
          dataField: 'createdAt',
          headerAlign: 'center',
          text: 'No',
          formatter: (cell, row, rowIndex, extraData) => (
            rowIndex + 1
        )
      },
      {
        dataField: 'dokumen_name',
        headerAlign: 'center',
        text: 'Nama',
        sort: true
      },
      {
        dataField: 'dokumen_type',
        headerAlign: 'center',
        text: 'Tipe',
        sort: true
      },
      {
        dataField: 'departements',
        headerAlign: 'center',
        text: 'Departemen',
        formatter: (cell, row, rowIndex, extraData) => {
        //  var a = row.departements.map((x)=>x.name)
        //  return a.join("\n");
         return <ul>
                  {row.departements.map((x)=>{
                    return <li>{x.name}</li>
                    })}
                </ul>
        }
        
      ,
      },      
      {
        dataField: 'no',
        text: 'Action',
        formatter: (cell, row, rowIndex, extraData) => {
         return   <Fragment>
              <div className="btn-group btn-group-sm">
								<Link href={`/dokumen-matrix/edit?id=${row.id}`}><a href="department-edit.html" className="btn btn-outline-primary" >Ubah</a></Link>
                <button class="btn btn-sm btn-success" onClick={this.download.bind(this,row)}> <i class="fas fa-download mr-2"></i>Dokumen </button>
              </div>
            </Fragment>
        },
      }
    ] 
    };
    
  }

  download (data) {
    
    var starsRef = storage.ref('dokumen-matrix').child(data.path);
    // Get the download URL
    starsRef.getDownloadURL().then(function(url) {
      
      const link = document.createElement('a');
      // if(dokumen_type == "Tipe Dokumen"){
        link.setAttribute('href', url);
      // }else{
        // link.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(url));
      // }
      
      link.setAttribute('download', data.path);
      link.setAttribute('target', "_blank");
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

  async deleteRow(e) {
    swal({
      title: "Apakah Anda yakin akan menghapus data ini?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async (willDelete) => {
      if (willDelete) {
        try{
          let getDelete = await http.delete('/api/v1/document/'+e.data.id,{   
            headers: {
              'Authorization': cookie.get('token')
            } 
          })
          swal("Menghapus Data Berhasil", {
            icon: "success",
          })
        }catch(err){
          swal({
            title: "Error",
            text: "Error => " + err,
            icon: "error",
            button: "Ok",
          })
        }
      } 
    });  }

  refreshData(){
    http.get('/api/v1/documents',{
      params:parameter,   
      headers: {
        'Authorization': cookie.get('token')
      } 
    })
    .then(response => response.data.data)
    .then(data =>{ 
      this.setState({ data : data.rows})
    })
  }

 componentDidMount () {
   this.refreshData()
 }
render () {
  const { SearchBar } = Search;
  return (
    <Layout title="Matrix Dokumen">
      <Breadcrumb>
          <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item active >Matriks Dokumen</Breadcrumb.Item>
      </Breadcrumb>   
      <h3 className="title"><i className="far fa-file fa-fw mr-2"></i>DokumenMatrix</h3>
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
                  <div className="col" >
                    <Link href="/dokumen-matrix/create" >
                    <button className="btn btn-primary" style={divRight}>Tambah Dokumen</button>
                    </Link>
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
    </Layout>
    )
}
}

export default withAuthSync(DokumenMatrix);