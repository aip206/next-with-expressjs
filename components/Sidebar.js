import Link from 'next/link';
const Sidebar = () => (
    <nav className="sidebar border-right">
		<ul className="nav flex-column">
			<li className="nav-item">
                <Link>
				    <a className="nav-link" href="/">Dashboard</a>
                </Link>
			</li>
			<li className="nav-item">
                <Link>
				    <a className="nav-link" href="/departement/list">Departemen</a>
                </Link>
			</li>
			<li className="nav-item">
				<a className="nav-link" href="matrix.html">Matriks Dokumen</a>
			</li>
			<li className="nav-item">
				<a className="nav-link" href="order.html">Pemesanan</a>
			</li>
		</ul>
	</nav>
)


export default Sidebar;