import { Component } from 'react';
import { withAuthSync } from '../utils/auth'
import cookie from 'js-cookie'
import Layout from '../components/Layout';
import { withRouter } from 'next/router';
import http from '../utils/http-service';

class Dashboard extends Component {
  constructor(props) {
    super(props);

  }
  componentDidMount () {
    
  }

  render () {
    return (
      <Layout title="Dashboard">
        <div class="container-fluid">
          <h3 className="title"><i className="fas fa-home fa-fw mr-2"></i>Dashboard</h3>
          <div class="card-deck mb-3">
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Pelanggan</small>
                <h1 class="text-primary mt-3">200</h1>
                <small class="text-muted">Jumlah pelanggan terdaftar.</small>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Pemesanan</small>
                <h1 class="text-primary mt-3 mb-0">10 <span class="text-muted">/ 20</span></h1>
                <small class="text-muted">Jumlah pesanan selesai per total pesanan berjalan.</small>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Dokumen</small>
                <h1 class="text-primary mt-3 mb-0">12 <span class="text-muted">/ 24</span></h1>
                <small class="text-muted">Jumlah dokumen selesai per total dokumen berjalan.</small>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Waktu Pemesanan</small>
                <h1 class="text-primary mt-3 mb-0">22.50</h1>
                <small class="text-muted">Rata-rata waktu pesanan diproses.</small>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      )
  }
}
  
export default withAuthSync(withRouter(Dashboard));