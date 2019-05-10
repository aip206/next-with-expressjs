import { Component } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import Layout from '../../components/Layout';

class Departement extends Component {
  render () {
    return (
     <Layout>
        <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Departement</h3>
      </Layout>
      )
  }
}
  
export default withAuthSync(Departement);