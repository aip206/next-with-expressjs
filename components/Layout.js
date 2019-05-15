import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';
import { withRouter } from 'next/router'
const Layout = (props) => {
  return(
    <div >
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
          <link rel="stylesheet" href="/static/fonts/roboto/stylesheet.css" rel="stylesheet"/>
          <link rel="stylesheet" href="/static/style.css"rel="stylesheet"/>
          <title></title>
        </Head> 
        <body id='root'>
        <Header />
        <Sidebar />
        <main className="dashboard">
		    <div className="container">
                {props.children}
            </div>
        </main>
        </body>
    </div>
)}
export default withRouter(Layout);