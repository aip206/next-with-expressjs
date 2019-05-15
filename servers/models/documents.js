const Sequelize = require('sequelize');
const db = require('../db/config');

const Document = db.define('documents', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      dokumen_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The code is required' }
        }
      },
      dokumen_type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'The code is required' }
        }
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Created",
        validate: {
          notNull: { msg: 'The code is required' }
        }
      },
      description: {
        type: Sequelize.STRING
      },
      documentFileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {         
          model: 'document_files',
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

});

module.exports = Document;