const passport = require('passport');
module.exports = (app) =>{
    require('../security/passport.js')(passport)

    const auth = require('../controllers/authResource');

    app.route('/api/v1/signIn')
    .post(auth.authenticate)
    app.route('/api/v1/reset-password')
    .post(auth.resetPassword)
    app.route('/api/vi/change-password').post(passport.authenticate('jwt', { session: false }),auth.changePassword)
}