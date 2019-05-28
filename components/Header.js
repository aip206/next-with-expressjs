import Link from 'next/link';
import {Component} from 'react'
import { logout } from '../utils/auth';
export default class Navbar extends Component {
	constructor(props) {
		super(props);
		this.logout = this.logout.bind(this)
		this.state = {
			nama:""
		}

		
	}
	componentDidMount () {
		if(process.browser){
			let data = JSON.parse(window.localStorage.getItem("myData"))
			this.setState({nama : data.name})
		}
	}
	logout () {
		logout();
	}
	render () {
		return (
		<nav className="navbar fixed-top navbar-light bg-light shadow">
			<div className="d-flex align-items-center">
				<button type="button" className="btn btn-link text-dark" id="sidebarToggle"><i className="fas fa-bars"></i></button>
				<a className="navbar-brand" href="/">{this.state.nama}</a>
			</div>
			<div className="ml-auto">
				<button className="btn btn-outline-danger" onClick={this.logout}>Keluar</button>
			</div>
		</nav>
	)}
	
}

