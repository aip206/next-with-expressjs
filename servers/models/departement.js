const Sequelize = require('sequelize');
const db = require('../db/config');
const bcrypt = require('bcrypt');

const Departement = db.define('departements', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'The name is required' }
    }

  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'The password is required' }
    }

  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Invalid email.' },
      notNull: { msg: 'The email is required' }
    } 
  },
  role: {
    type: Sequelize.ENUM,
    values: ['admin', 'departement'],
    allowNull: false,
    validate: {
      notNull: { msg: 'The role is required' }
    }
  },
  isDelete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isActive: {
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
},{
  hooks: {
    beforeCreate: (user) => {
      const salt = bcrypt.genSaltSync();
      user.password = bcrypt.hashSync(user.password, salt);
    }
  },
  classMethods:{
    count: function() {
      return this.findAll()
              .then(function(departement) {
                return departement.length;
              })
    }
  }
});

Departement.prototype.comparePassword = async function(p) {
  return await bcrypt.compareSync(p, this.password);
};


module.exports = Departement;