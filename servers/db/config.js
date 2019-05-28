const Sequelize = require('sequelize');
const config = require('../config.js').get(process.env.NODE_ENV)

module.exports =  new Sequelize(config.database.database, config.database.user, config.database.password, {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});


const Departement = require('../models/departement');
const Document = require('../models/documents');
const Order = require('../models/order');
const DepartementPic = require('../models/departement_pic');
const DepOrder = require('../models/departement_order');
const DocOrder = require('../models/document_order');

Document.belongsToMany(Departement, { through: 'document_departements'})
Departement.belongsToMany(Document, { through: 'document_departements'})
Departement.hasMany(DepartementPic)
DepOrder.belongsTo( Departement);
Departement.hasMany( DepOrder);
// Departement.hasMany(DepOrder, { constraints: false, allowNull:true, defaultValue:null});

Order.belongsToMany(Document, { through: 'document_orders'})
Order.hasMany(DocOrder)