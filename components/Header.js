import Link from 'next/link';
const Navbar = (props) => (
    <nav className="navbar fixed-top navbar-light bg-light shadow">
		<div className="d-flex align-items-center">
			<button type="button" className="btn btn-link text-dark" id="sidebarToggle"><i className="fas fa-bars"></i></button>
			<a className="navbar-brand" href="dashboard.html">Administrator</a>
		</div>
		<div className="ml-auto">
			<button className="btn btn-outline-danger">Keluar</button>
		</div>
	</nav>
)


export default Navbar;