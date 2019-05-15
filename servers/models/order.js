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
      email: {
        type: Sequelize.STRING,
      },
      phone_number: {
        type: Sequelize.STRING,
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

module.exports = Order;