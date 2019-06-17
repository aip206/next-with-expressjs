const Sequelize = require('sequelize');
const db = require('../db/config');

const DocOrder = db.define('document_orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }, orderId: {
        type: Sequelize.INTEGER,
        references: {         
            model: 'orders',
            key: 'id'
          }
      },documentId: {
        type: Sequelize.INTEGER,
        references: {         
            model: 'documents',
            key: 'id'
          }
      },
      pathFile:{
        type: Sequelize.STRING
      },
      link:{
        type: Sequelize.STRING
      },
      status:{
        type: Sequelize.STRING,
        defaultValue: "DELIVER"
      }, isDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });

module.exports = DocOrder;