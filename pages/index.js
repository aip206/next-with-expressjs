import { Component } from 'react';
import { withAuthSync } from '../utils/auth'
import cookie from 'js-cookie'
import Layout from '../components/Layout';
import { withRouter } from 'next/router';
import http from '../utils/http-service';

class Dashboard extends Component {
  constructor(props) {
    super(props);
		this.state = {
			role:"",
			customer:0,
			orderFinish:{},
			dokumenFinish:{},
			selisih:0,
			ranking:[]
		}
  }
  componentDidMount () {
		if(process.browser){
			let data = JSON.parse(window.localStorage.getItem("myData"))
			this.setState({role : data.role})
		}
		this.pemesananDokumen();
		this.pemesananGrafik();
		this.totalCustomer();
		this.orderFinish();
		this.dateSelisih();
		this.rank();
		this.dokumenFinish();
	}
	// 
	async rank(){
		try{
      let resp = await http.get('/api/v1/dashboard/ranking',{
        headers: {
          'Authorization': cookie.get('token')
        } 
			})
			this.setState({ranking:resp.data.data})
		}catch(e){
			console.log(e)
		}
	} 
	async dateSelisih(){
		let red  = 0
		try{
      let resp =await http.get('/api/v1/dashboard/date-selisih',{
        headers: {
          'Authorization': cookie.get('token')
        } 
			})
			const sumBy = (items, prop) => items.reduce((a, b) => +a + +b[prop], 0);
			if(resp.data.data.length != 0){
				let selisih = sumBy(resp.data.data,'selisih')/resp.data.data.length
				this.setState({selisih:parseFloat(selisih).toFixed(2)
					})
			}
		}catch(e){
			console.log(e)
		}
	} 
	
	async totalCustomer(){
		
		try{
      let resp = await http.get('/api/v1/dashboard/customer-by-admin',{
        headers: {
          'Authorization': cookie.get('token')
        } 
			})
			this.setState({customer:resp.data.data})
		}catch(e){
			console.log(e)
		}
	}

	async orderFinish(){
		let awalan = {
			finish : 0,
			total:0
		}
		try{
      let resp =await http.get('/api/v1/dashboard/order-finis',{
        headers: {
          'Authorization': cookie.get('token')
        } 
			})
			if(resp.data.data[0]){
				this.setState({orderFinish:resp.data.data[0]})
			}else{
				this.setState({orderFinish:awalan})
			}
			
		}catch(e){
			console.log(e)
		}
	}

	async dokumenFinish(){
		let awalan = {
			finish : 0,
			total:0
		}
		try{
      let resp =await http.get('/api/v1/dashboard/dokumen-finis',{
        headers: {
          'Authorization': cookie.get('token')
        } 
			})
			if(resp.data.data[0]){
				this.setState({dokumenFinish:resp.data.data[0]})
			}else{
				this.setState({dokumenFinish:awalan})
			}
			
		}catch(e){
			console.log(e)
		}
	}

	
  async pemesananDokumen(){
    try{
      let resp =await http.get('/api/v1/dashboard/dokumen-bar-chart',{
        headers: {
          'Authorization': cookie.get('token')
        } 
      })
			let raw = resp.data.data.sort(this.compare)
      var ctd = document.getElementById('documentChart').getContext('2d');
			var documentChart = new Chart(ctd, {
				type: 'bar',
				data: {
					labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
					datasets: [{
						label: '# Jumlah Dokumen',
						data: [
							this.checkHari(raw,0),
							this.checkHari(raw,1),
							this.checkHari(raw,2),
							this.checkHari(raw,3),
							this.checkHari(raw,4),
							this.checkHari(raw,5),
							this.checkHari(raw,6)
						],
						backgroundColor: [
						'rgba(244, 67, 54, 1)',
						'rgba(233, 30, 99, 1)',
						'rgba(156, 39, 176, 1)',
						'rgba(103, 58, 183, 1)',
						'rgba(63, 81, 181, 1)',
						'rgba(3, 169, 244, 1)',
						'rgba(0, 188, 212, 1)'
						],
						borderColor: [
						'rgba(211, 47, 47, 1)',
						'rgba(194, 24, 91, 1)',
						'rgba(123, 31, 162, 1)',
						'rgba(81, 45, 168, 1)',
						'rgba(48, 63, 159, 1)',
						'rgba(2, 136, 209, 1)',
						'rgba(0, 151, 167, 1)'
						],
						borderWidth: 1
					}]
				},
				options: {
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					},
					legend: {
						display: false
					},
					tooltips: {
						callbacks: {
							label: function(tooltipItem) {
								return tooltipItem.yLabel;
							}
						}
					}
				}
			});
    } catch(e ) {
			console.log(e)
    }
    
  }

	checkHari(resp,hari){
		let total = 0
		var x = resp.find(function(element) {
			if(element.hari == hari){
				 total = element.total
			}
			
		});
		return total
	}
  async pemesananGrafik() {
    try{
			let resp =await http.get('/api/v1/dashboard/order-bar-chart',{
        headers: {
          'Authorization': cookie.get('token')
        } 
      })
			let raw = await resp.data.data.sort(this.compare)
			
			var cto = document.getElementById('orderChart').getContext('2d');
			var orderChart = new Chart(cto, {
				type: 'bar',
				data: {
					labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
					datasets: [{
						label: '# Jumlah Pesanan',
						data: [this.checkHari(raw,0),
							this.checkHari(raw,1),
							this.checkHari(raw,2),
							this.checkHari(raw,3),
							this.checkHari(raw,4),
							this.checkHari(raw,5),
							this.checkHari(raw,6)],
						backgroundColor: [
						'rgba(244, 67, 54, 1)',
						'rgba(233, 30, 99, 1)',
						'rgba(156, 39, 176, 1)',
						'rgba(103, 58, 183, 1)',
						'rgba(63, 81, 181, 1)',
						'rgba(3, 169, 244, 1)',
						'rgba(0, 188, 212, 1)'
						],
						borderColor: [
						'rgba(211, 47, 47, 1)',
						'rgba(194, 24, 91, 1)',
						'rgba(123, 31, 162, 1)',
						'rgba(81, 45, 168, 1)',
						'rgba(48, 63, 159, 1)',
						'rgba(2, 136, 209, 1)',
						'rgba(0, 151, 167, 1)'
						],
						borderWidth: 1
					}]
				},
				options: {
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					},
					legend: {
						display: false
					},
					tooltips: {
						callbacks: {
							label: function(tooltipItem) {
								return tooltipItem.yLabel;
							}
						}
					}
				}
			});
		}catch(e ) {
			console.log(e)
    }
    
    
  }

  render () {
    return (
      <Layout title="Dashboard">
        <div class="container-fluid">
          <h3 className="title"><i className="fas fa-home fa-fw mr-2"></i>Dashboard</h3>
          <div class="card-deck mb-3">
					{this.state.role == 'admin'?
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Pelanggan</small>
                <h1 class="text-primary mt-3">{this.state.customer}</h1>
                <small class="text-muted">Jumlah pelanggan terdaftar</small>
              </div>
						</div> : null
						}
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Pemesanan</small>
                <h1 class="text-primary mt-3 mb-0">{this.state.orderFinish.finish}<span class="text-muted">/ {this.state.orderFinish.total}</span></h1>
                <small class="text-muted">Jumlah pesanan selesai per total pesanan </small>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Dokumen</small>
                <h1 class="text-primary mt-3 mb-0">{this.state.dokumenFinish.finish} <span class="text-muted">/ {this.state.dokumenFinish.total}</span></h1>
                <small class="text-muted">Jumlah dokumen selesai per total dokumen </small>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <small class="d-block text-uppercase font-weight-bold border-bottom">Waktu Pemesanan</small>
                <h1 class="text-primary mt-3 mb-0">{this.state.selisih}</h1>
                <small class="text-muted">Rata-rata waktu pesanan diproses.</small>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-8">
              <div class="card mb-3">
                <div class="card-body">
                  <small class="d-block text-uppercase font-weight-bold border-bottom mb-3">Grafik Pemesanan</small>
                  <canvas id="orderChart"></canvas>
                </div>
              </div>
              <div class="card">
                <div class="card-body">
                  <small class="d-block text-uppercase font-weight-bold border-bottom mb-3">Grafik Dokumen</small>
                  <canvas id="documentChart"></canvas>
                </div>
              </div>
            </div>
						{this.state.role == 'admin'?
						<div class="col-lg-4">
							<div class="card">
							<div class="card-body">
								<small class="d-block text-uppercase font-weight-bold border-bottom">Departemen</small>
								<RangkingDepartemen prop={this.state.ranking}/>
								
								<small class="text-muted">Departemen dengan pemesanan terbanyak.</small>
							</div>
						</div>
					</div>:null}
        </div>
        </div>
				
      </Layout>
      )
  }
}

function RangkingDepartemen(data) {
	if(data.length != 0){
		return <ol class="pl-3 mt-3"> {data.prop.map((e)=><li class="mb-3">
				<h5 class="mb-0">{e.name}</h5>
				<small class="text-muted">{e.total} Pesanan</small>
			</li>)}
			</ol>
	}
}
  
export default withAuthSync(withRouter(Dashboard));