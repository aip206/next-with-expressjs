const Sequelize = require('sequelize');
const db = require('../db/config');

const DepartementOrder = db.define('departement_orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }, docOrderID: {
        type: Sequelize.INTEGER,
        references: {         
            model: 'document_orders',
            key: 'id'
          }
      },departementId: {
        type: Sequelize.INTEGER,
        references: {         
            model: 'departements',
            key: 'id'
          }
      },
      file:{
        type: Sequelize.STRING
      },
      status:{
        type: Sequelize.STRING,
        defaultValue: "Ditempatkan"
      }
    });
module.exports = DepartementOrder;