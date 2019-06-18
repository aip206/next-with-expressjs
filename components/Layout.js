import {useState } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';
import { withRouter } from 'next/router';
import Breadcrumb from './Breadcrumb';
import DocumentTitle from 'react-document-title';
const Layout = (props) => {
    const [yes, setYes] = useState(true)
    const [show, setShow] = useState("show")
    const [full, setFull] = useState("")
    const changeShow = () => {
        setYes(!yes)
        if(yes){
            setShow("show")
            setFull("")
        }else{
            setShow("")
            setFull("full")
        }
      }
  return(
    <div >
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
          <link rel="stylesheet" href="/static/fonts/roboto/stylesheet.css" rel="stylesheet"/>
          <link rel="stylesheet" href="/static/react-datepicker.css" rel="stylesheet"/>
          <link rel="stylesheet" href="/static/style.css"rel="stylesheet"/>
          
          <title>{props.title}</title>
        </Head> 
        <Header onClick={changeShow}  />
        <Sidebar state={show} />
        
        <main className={`dashboard ${full}`}>
        
		    <div className="container">
                {props.children}
            </div>
        </main>
        <script src="/static/vendors/jquery/jquery.min.js"></script>
        <script src="/static/vendors/fontawesome/js/all.min.js"/>
        <script src="/static/vendors/chartjs/chart.js"/>
    </div>
)}
export default withRouter(Layout);