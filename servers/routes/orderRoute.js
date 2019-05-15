const passport = require('passport');

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const document = require('../controllers/orderResource');
    app.route('/api/v1/orders')
    .post(document.create)
    // passport.authenticate('jwt', { session: false }),
}