const db = require('./config');
const Departement = require('../models/departement');
const Document = require('../models/documents');
const Order = require('../models/order');
const Customer = require('../models/customer');
const DepartementPic = require('../models/departement_pic');
const DocFile = require('../models/document_file');
const DocOrder = require('../models/document_order');
const DepOrder = require('../models/departement_order');
const ResetPassword = require('../models/reset_password');

let allDocument,
    allDepartement,
    allOrder,
    allCustomer,
    allDepartementPic,
    allDocFile,
    allDocOrder,
    allDepOrder,
    resetPassword;

// array of promises to find all the db data
// and store it in outer-scoped variables, so
// we can refer to all of them when seeding associations
let findAllPromises = [
    Departement.findAll().then(resp => allDocument = resp),
    Document.findAll().then(resp => allDepartement = resp),
    Order.findAll().then(resp => allOrder = resp),
    Customer.findAll().then(resp => allCustomer = resp),
    DepartementPic.findAll().then(resp => allDepartementPic = resp),
    DocFile.findAll().then(resp => allDocFile = resp),
    DocOrder.findAll().then(resp => allDocOrder = resp),
    DepOrder.findAll().then(resp => allDepOrder = resp),
    ResetPassword.findAll().then(resp => resetPassword = resp),
]


db.sync({force: false})
.then(() => {
    // make sure we don't move on until all the db associations have happened
    return Promise.all(findAllPromises)
  })
.catch(console.error.bind(console))
.finally(() => {
    db.close();
    console.log('Exiting...');
    return null;
  })
