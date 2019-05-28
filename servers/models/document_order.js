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
      status:{
        type: Sequelize.STRING,
        defaultValue: "DELIVER"
      }
    });

const RawDocOrder = db.query("SELECT ord.order_invoice, dor.status FROM document_orders dor LEFT JOIN orders ord on ord.id = dor.orderId LEFT JOIN documents dc on dc.id = dor.documentId LEFT JOIN document_departements dd on dd.documentId = dc.id where dd.departementId = 1 "
,{raw: true,type: Sequelize.QueryTypes.SELECT})
module.exports = DocOrder;