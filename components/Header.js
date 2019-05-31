import Link from 'next/link';
import {Component} from 'react'
import { logout } from '../utils/auth';
import swal from 'sweetalert';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton'
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
		swal({
			title: "Apakah Anda yakin akan keluar dari Applikasi?",
			icon: "warning",
			buttons:{cancel: {
				text: "Tidak",
				value: null,
				visible: true,
				className: "",
				closeModal: true,
			  },
			  confirm: {
				text: "Ya",
				value: true,
				visible: true,
				className: "",
				closeModal: true
			  }},
			dangerMode: true,
		  }).then((e)=>{
			if (e) {
				logout();
			}
		  })
		
	}
	render () {
		return (
		<nav className="navbar fixed-top navbar-light bg-light shadow">
			<div className="d-flex align-items-center">
				<button type="button" className="btn btn-link text-dark" onClick={this.props.onClick} id="sidebarToggle"><i className="fas fa-bars"></i></button>
				<a className="navbar-brand" href="/">Order Management System — Departemen
				</a>
			</div>
			<div className="d-flex ml-auto">
				<div className="dropdown">
				<DropdownButton id="dropdown-basic-button" title={this.state.nama} className="super-colors" >
					<Dropdown.Item className="dropdown-item" href="/user/profile">Profil</Dropdown.Item>
					<Dropdown.Item className="dropdown-item" href="/user/password">Sandi</Dropdown.Item>
					<Dropdown.Item className="dropdown-item" onClick={this.logout}>Keluar</Dropdown.Item>
				</DropdownButton>
				</div>
		</div>
		</nav>
	)}
	
}

