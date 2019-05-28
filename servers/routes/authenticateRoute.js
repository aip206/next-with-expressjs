
module.exports = (app) =>{

    const auth = require('../controllers/authResource');

    app.route('/api/v1/signIn')
    .post(auth.authenticate)
    app.route('/api/v1/reset-password')
    .post(auth.resetPassword)
}