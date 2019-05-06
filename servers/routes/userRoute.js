module.exports = (app) =>{

    let users = require('../controllers/userResource');

    app.route('/users').get(users.getAll)
}