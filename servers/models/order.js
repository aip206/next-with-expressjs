const Sequelize = require('sequelize');
const db = require('../db/config');

const Order = db.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }, 
      order_invoice: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The order_invoice is required' }
        }
      },
      order_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Created"
      },
      order_description: {
        type: Sequelize.STRING
      },
      order_deadline: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          notNull: { msg: 'The order_deadline is required' }
        }
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The customer_name is required' }
        }
      },
      customer_address: {
        type: Sequelize.STRING,
      },
      customer_email: {
        type: Sequelize.STRING,
      },
      customer_provinsi: {
        type: Sequelize.STRING,
      },
      customer_kecamatan: {
        type: Sequelize.STRING,
      },
      customer_kabupaten: {
        type: Sequelize.STRING,
      },
      customer_phone: {
        type: Sequelize.STRING,
      },
      id_provinsi: {
        type: Sequelize.INTEGER,
      },
      id_kecamatan: {
        type: Sequelize.INTEGER,
      },
      id_kabupaten: {
        type: Sequelize.INTEGER,
      },
      isDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt:{
        type: Sequelize.DATE,
      },
      deletedAt:{
        type: Sequelize.DATE,
      }
})
const getLastNumber = db.query("SELECT ROW_NUMBER() OVER(ORDER BY createdAt DESC) AS number FROM orders \
              where  createdAt >= '2019-05-23' AND createdAt <= '2019-05-25'\
              ORDER BY number DESC ",{raw: true,type: Sequelize.QueryTypes.SELECT})
module.exports = Order;