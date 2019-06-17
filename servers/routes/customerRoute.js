const passport = require('passport');
module.exports = (app) =>{
    require('../security/passport.js')(passport)

    const customer = require('../controllers/customerResource');

    app.route('/api/v1/customer/:email')
    .get(customer.getAllBySearch)
   
}