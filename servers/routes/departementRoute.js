const passport = require('passport');



module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const departement = require('../controllers/departementResource');
    app.route('/api/v1/departements')
    .get(passport.authenticate('jwt', { session: false }),departement.getAll)
    .post(departement.create)
    app.route('/api/v1/departement/:id').get(departement.getById)
}