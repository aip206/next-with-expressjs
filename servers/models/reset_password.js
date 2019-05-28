const Sequelize = require('sequelize');
const db = require('../db/config');

const ResetPassword = db.define('reset_passwords', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.STRING,
      },
})

module.exports = ResetPassword;