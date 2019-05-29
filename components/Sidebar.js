import { Component, Fragment } from 'react'
import Link from 'next/link';
const Sidebar = () => 
{
	let data = {}
	if(process.browser){
	 data = JSON.parse(window.localStorage.getItem("myData"))
	}
   return <nav className="sidebar border-right">

		<ul className="nav flex-column">
			<li className="nav-item">
				<Link href="/">
					<a className="nav-link" href="/">Dashboard</a>
				</Link>	
			</li>
			{data.role == "admin" ? (
				<Fragment>
					<li className="nav-item">
						<Link href="/departement/list">
						<a className="nav-link" >Departemen</a>
						</Link>	
					</li>
					<li className="nav-item">
						<Link href="/dokumen-matrix/list">
							<a className="nav-link" >Matriks Dokumen</a>
						</Link>	
					</li>
					<li className="nav-item">
						<Link href="/order/list">
							<a className="nav-link" >Pemesanan</a>
						</Link>	
					</li>
				</Fragment>
			):(
			<li className="nav-item">
				<Link href="/dokumen-departement/list">
					<a className="nav-link" >Pemesanan</a>
				</Link>	
			</li>
			)}
			
		</ul>
	</nav>
}


export default Sidebar;