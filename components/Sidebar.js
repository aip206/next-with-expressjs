import { Component, Fragment } from 'react'

import Link from './ActiveLink';

const Sidebar = (props) => 
{
	let data = {}
	let path = ""
	if(process.browser){
	 data = JSON.parse(window.localStorage.getItem("myData"))
	 path = window.location.pathname
	}
	const checkActive = e =>{
		if(path == e){
			return true
		}else{
			return false
		}
	}
   return <nav className={`sidebar border-right ${props.state}`}>

		<ul className="nav flex-column">
			<li className="nav-item">
				<Link activeClassName='active' href="/">
					<a className="nav-link" href="/" active>Dashboard</a>
				</Link>	
			</li>
			{data.role == "admin" ? (
				<Fragment>
					<li className="nav-item">
						<Link activeClassName='active' href="/departement/list">
						<a className="nav-link" >Departemen</a>
						</Link>	
					</li>
					<li className="nav-item">
						<Link activeClassName='active' href="/dokumen-matrix/list">
							<a className="nav-link" >Matriks Dokumen</a>
						</Link>	
					</li>
					<li className="nav-item">
						<Link activeClassName='active' href="/order/list">
							<a className="nav-link" >Pemesanan</a>
						</Link>	
					</li>
				</Fragment>
			):(
			<li className="nav-item">
				<Link activeClassName='active' href="/dokumen-departement/list">
					<a className="nav-link" >Pemesanan</a>
				</Link>	
			</li>
			)}
			
		</ul>
	</nav>
}


export default Sidebar;