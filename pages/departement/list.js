import { Component } from 'react';
import { withAuthSync } from '../../utils/auth'
import cookie from 'js-cookie'
import fetch from 'isomorphic-unfetch';
import Layout from '../../components/Layout';
import ReactTable from "react-table";
import "react-table/react-table.css";
import Modal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    transform             : 'translate(-50%, -50%)'
  }
};
Modal.setAppElement('#root');
class Departement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalIsOpen: false,
      departement: {}
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }


 
  openModal() {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal(id) {
    // references are now sync'd and can be accessed.
    fetch('http://localhost:3001/api/v1/departement/'+id)
    .then(response => response.json())
    .then(data =>{ 
      this.setState({ departement : data.data })
    })
    .catch(err => console.log(err))
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }


 componentDidMount () {
  fetch('http://localhost:3001/api/v1/departements')
  .then(response => response.json())
  .then(data =>{ 
    this.setState({ data : data.data })
  })
  .catch(err => console.log(err))
 }
  render () {
    
const columns = [
  {
    Header: "No",
    accessor: "row",
    maxWidth: 100,
    filterable: false,
    Cell: (row) => {
        return <div>{row.index + 1}</div>;
    }
  },
  {
    Header: "Nama",
    accessor: "name",
    minWidth: 100
  },
  {
    Header: "Login",
    accessor: "login",
    minWidth: 100
  },
  {
    Header: "Role",
    accessor: "role",
    minWidth: 100
  },
  {
    Header: "Action",
    minWidth: 100,
    Cell: (row) => {
      console.log(row)
      return <button className="btn btn-sm btn-outline-primary" onClick={this.openModal} ><i className="fas fa-eye fa-fw mr-1"></i>Detail</button>
    }
  }
];
    return (
     <Layout>
        <h3 className="title"><i className="far fa-building fa-fw mr-2"></i>Departement</h3>
        <ReactTable
          data = {this.state.data}
          columns={columns}
          className="-striped -highlight"
          />
            <Modal
              isOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              onRequestClose={this.closeModal}
              ariaHideApp={false}
              contentLabel="Example Modal"
              style={customStyles}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Detail Departemen</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <dl className="row">
                    <small className="col-sm-12">Departemen</small>
                    <dt className="col-sm-4">Nama</dt>
                    <dd className="col-sm-8">: Departemen Lorem</dd>
                    <dt className="col-sm-4">Email</dt>
                    <dd className="col-sm-8">: departmentemail@gmail.com</dd>
                  </dl>
                  <dl className="row">
                    <small className="col-sm-12">Penanggung Jawab</small>
                    <dt className="col-sm-4">Nama</dt>
                    <dd className="col-sm-8">: John Doe</dd>
                    <dt className="col-sm-4">Nomor Telepon</dt>
                    <dd className="col-sm-8">: +62 81321123321</dd>
                  </dl>
                </div>
                <div className="modal-footer justify-content-between">
                  <button type="button" className="btn btn-link" data-dismiss="modal">Tutup</button>
                  <div>
                    <button type="button" className="btn btn-outline-danger" id="btnDelete">Hapus</button>
                    <button type="button" className="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#modalEdit">Ubah</button>
                  </div>
                </div>
              </div>
    
            </Modal>
      </Layout>
      )
  }
}
  
export default withAuthSync(Departement);