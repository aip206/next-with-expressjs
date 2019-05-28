import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';
import { withRouter } from 'next/router';

import Breadcrumb from './Breadcrumb'
const Layout = (props) => {
    
  return(
    <div >
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
          <link rel="stylesheet" href="/static/fonts/roboto/stylesheet.css" rel="stylesheet"/>
          <link rel="stylesheet" href="/static/style.css"rel="stylesheet"/>
          <title>Sanguan</title>
        </Head> 
        <Header />
        <Sidebar />
        <main className="dashboard">
		    <div className="container">
                {props.children}
            </div>
        </main>
    </div>
)}
export default withRouter(Layout);