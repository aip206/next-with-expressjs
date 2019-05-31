import { Component,Fragment  } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';
import axioss from 'axios';
import swal from 'sweetalert';
import Router from 'next/router';
import Link from 'next/link';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {storage} from '../../utils/firebase';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import dateFormat from 'dateformat';
import http from '../../utils/http-service.js';

const divRight = {
  position : "absolute",
  right:"5%"
}
const parameter = {
  "sortBy":"createdAt","sort":"ASC","limit":"10","page":0
}
class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
								<Link href={`/order/detail?id=${row.id}`}>
                <a  className="btn btn-sm btn-outline-primary"><i className="fas fa-eye fa-fw mr-1"></i>Detail</a>
                </Link>
              </div>
            </Fragment>
        ),
      }
    ] 
    };
    
  }
 

  refreshData(){
    http.get('/api/v1/orders',{
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
    <Layout title="Pemesanan">
      <Breadcrumb>
          <Breadcrumb.Item href="/">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item active >Pemesanan</Breadcrumb.Item>
      </Breadcrumb>  
      <h3 className="title"><i className="fas fa-shopping-cart fa-fw mr-2"></i>Pemesanan</h3>
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
                  <Link  href="/order/create">
                    <button className="btn btn-primary" style={divRight}>Tambah Pesanan</button>
                    </Link>
                  </div>
                </div>
                <hr />
                <BootstrapTable
                defaultSorted={ this.state.defaultSorted } 
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

export default withAuthSync(Order);