const Sequelize = require('sequelize');
const db = require('../db/config');

const Customer = db.define('customers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }, 
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: { msg: 'Invalid email.' },
            notNull: { msg: 'The email is required' }
          } 
      },first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The code is required' }
        }
      },
      last_name: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      postal_code: {
        type: Sequelize.INTEGER,
      },
      phone_number: {
        type: Sequelize.STRING,
      },
      place_of_birth: {
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

module.exports = Customer;