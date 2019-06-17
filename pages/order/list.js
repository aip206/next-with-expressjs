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
    this.deleteRow = this.deleteRow.bind(this);

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
          headerAlign: 'center',
          formatter: (cell, row, rowIndex, extraData) => (
            rowIndex + 1
        )
      },
      {
        dataField: 'createdAt',
        text: 'Pembuatan',
        sort: true,
        headerAlign: 'center',
        headerStyle: () => {
          return { width: "20px" };
        },
        formatter: (cell, row, rowIndex, extraData) => (
          dateFormat(row.createdAt,"dd/mm/yyyy")
      )
      },
      {
        dataField: 'order_deadline',
        text: 'Deadline',
        sort: true,
        headerAlign: 'center',
        headerStyle: () => {
          return { width: "20px" };
        },
        formatter: (cell, row, rowIndex, extraData) => (
          dateFormat(row.order_deadline,"dd/mm/yyyy")
      )
      },
      {
        dataField: 'order_invoice',
        text: 'Invoice',
        headerAlign: 'center',
        sort: true,
        headerStyle: () => {
          return { width: "15%" };
        }
      },
      {
        dataField: 'customer_name',
        headerAlign: 'center',
        text: 'Nama Pelanggan',
      },
      {
        dataField: 'status',
        headerAlign: 'center',
        text: 'Progress',
        formatter:(cell, row, rowIndex, extraData) => {
          if(row.progress == 100){
            return  <span className="badge badge-pill badge-success">Selesai</span>
          }else{
            return <div className="progress"> <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={row.progress} aria-valuemin="0" aria-valuemax="100" style={{width:row.progress+"%"}}>{row.progress}%</div>       </div>
          }
        }
      },
         
      {
        dataField: 'no',
        text: 'Action',
        headerAlign: 'center',
        formatter: (cell, row, rowIndex, extraData) => (
            <Fragment>
              <div className="btn-group btn-group-sm">
								<Link href={`/order/detail?id=${row.id}`}>
                <a  className="btn btn-sm btn-outline-primary"><i className="fas fa-eye fa-fw mr-1"></i>Detail</a>
                </Link>
                <button type="button" onClick={this.deleteRow.bind(this,row)} className="btn btn-outline-danger btn-delete">Hapus</button>
              </div>
            </Fragment>
        ),
      }
    ] 
    };

    
    
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
          let getDelete = await http.delete('/api/v1/order/'+e.id,{   
            headers: {
              'Authorization': cookie.get('token')
            } 
          })
          swal("Menghapus Data Berhasil", {
            icon: "success",
          }).then(()=>{
            this.refreshData();
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

 

  async refreshData(){
    await http.get('/api/v1/orders',{
      params:parameter,   
      headers: {
        'Authorization': cookie.get('token')
      } 
    })
    .then(response => response.data.data)
    .then(async data =>{ 
      var d = await Promise.all(data.rows.map(async x => {x.progress = await this.HitungProgres(x.id); return x}))
      
      this.setState({ data : d})
      // console.log(d)
    })
  }

  async HitungProgres(e) {
    let progresTotal = 0
    try{
      let list = await axioss.get('/api/v1/order/check-progress/'+e,{   
        headers: {
        'Authorization': cookie.get('token')
        }
        })
      if(list.data.data[0].total != 0){
          progresTotal = (list.data.data[0].totalDepartement / list.data.data[0].total) * 100
       }
       
    }catch (e) {
      console.log(e)
    }
    return progresTotal
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