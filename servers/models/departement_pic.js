const Sequelize = require('sequelize');
const db = require('../db/config');

const DepartementPic = db.define('department_pics', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The code is required' }
        }
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The phone is required' }
        }
    
      },
      departementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {         
          model: 'departements',
          key: 'id'
        }
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

module.exports = DepartementPic;