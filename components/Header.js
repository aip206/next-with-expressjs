import Link from 'next/link';
import {Component} from 'react'

export default class Navbar extends Component {
	constructor(props) {
		super(props);
	}
	componentDidMount () {

	}
	render () {
		return (
		<nav className="navbar fixed-top navbar-light bg-light shadow">
			<div className="d-flex align-items-center">
				<button type="button" className="btn btn-link text-dark" id="sidebarToggle"><i className="fas fa-bars"></i></button>
				<a className="navbar-brand" href="/">Administrator</a>
			</div>
			<div className="ml-auto">
				<button className="btn btn-outline-danger">Keluar</button>
			</div>
		</nav>
	)}
	
}

