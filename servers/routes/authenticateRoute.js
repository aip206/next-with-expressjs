const passport = require('passport');
module.exports = (app) =>{
    require('../security/passport.js')(passport)

    const auth = require('../controllers/authResource');

    app.route('/api/v1/signIn')
    .post(auth.authenticate)
    app.route('/api/v1/reset-password')
    .post(auth.resetPassword)
    app.route('/api/v1/forgot-password')
    .post(auth.forgotPassword)

    app.route('/api/v1/profile-user').post(passport.authenticate('jwt', { session: false }),auth.profiles)
    app.route('/api/v1/get-profile').get(passport.authenticate('jwt', { session: false }),auth.getProfile)
    
    app.route('/api/vi/change-password').post(passport.authenticate('jwt', { session: false }),auth.changePassword)
}