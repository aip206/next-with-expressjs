import { Component, Fragment } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';
import http from '../../utils/http-service';
import swal from 'sweetalert';
import Router from 'next/router';
import Link from 'next/link';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
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
  }
};
const parameter = {
  "sortBy":"createdAt","sort":"ASC","limit":"10","page":0
}
class Departement extends Component {
  constructor(props) {
    super(props);
    this.deleteRow = this.deleteRow.bind(this);
    this.state = {
      data: [],
      defaultSorted : [{
        dataField: 'createdAt',
        order: 'desc'
      }],
      columns:[
        {
          dataField: 'createdAt',
          text: 'No',
          formatter: (cell, row, rowIndex, extraData) => (
            rowIndex + 1
        )
      },
      {
        dataField: 'name',
        text: 'Nama Departemen',
        sort: true
      },
      {
        dataField: 'email',
        text: 'Email Departemen',
        sort: true
      },
      {
        dataField: 'department_pics[0].nama',
        text: 'Nama Penanggung Jawab',
        sort: true
      },
      {
        dataField: 'department_pics[0].phone',
        text: 'Nomor Telepon',
        sort: true,
        formatter: (cell, row, rowIndex, extraData) => (
          <Fragment>
            +62 <span>{row.department_pics[0].phone}</span>
          </Fragment>
      )

      },
      
      {
        dataField: 'no',
        text: 'Action',
        formatter: (cell, row, rowIndex, extraData) => (
            <Fragment><div className="btn-group btn-group-sm">
								<Link href={`/departement/edit?id=${row.id}`}><a href="department-edit.html" className="btn btn-outline-primary" >Ubah</a></Link>
            </div>
            </Fragment>
        ),
      }
    ]
    };
    
  }
  

  deleteRow(e) {
    swal({
      title: "Apakah Anda yakin akan menghapus data ini?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        http.delete('/api/v1/departement/'+e.data.id,{   
          headers: {
            'Authorization': cookie.get('token')
          } 
        })
        .then(response =>{
          swal("Menghapus Data Berhasil", {
            icon: "success",
          });
        })
      } 
    });  }

 componentDidMount () {
  http.get('/api/v1/departements',{
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
     <Layout title="Departemen">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item active >Departemen</Breadcrumb.Item>
      </Breadcrumb>
        <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Departemen</h3>
      
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
                    <Link href="/departement/create" className="div-right">
                    <button className="btn btn-primary" style={divRight}>Tambah Departemen</button>
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
  
export default withAuthSync(Departement);