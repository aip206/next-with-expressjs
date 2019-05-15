const Sequelize = require('sequelize');
const db = require('../db/config');

const DocumentFile = db.define('document_files', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The code is required' }
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

module.exports = DocumentFile;