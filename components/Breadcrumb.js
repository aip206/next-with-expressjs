import { Component, Fragment } from 'react'
import Link from 'next/link'
import Breadcrumb from 'react-bootstrap/Breadcrumb'

const Bc = (props) => {
    let rout = props.router.route
    const arrRoute = rout.split("/") 
    return (
    <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        {
            arrRoute.forEach((x)=>{
                <Breadcrumb.Item active>Data</Breadcrumb.Item>            
            })
        }
    </Breadcrumb>
    )
}

export default Bc;