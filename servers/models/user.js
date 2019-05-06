const { Model } = require('objection');

class User extends Model {
    static get user() {
      return 'Users';
    }
  }
  
module.exports = User;