const Sequelize = require('sequelize');


module.exports =  new Sequelize('temp', 'root', '1234abcd', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});


const Departement = require('../models/departement');
const Document = require('../models/documents');

Document.belongsToMany(Departement, { as: 'departement', through: 'document_departements'})