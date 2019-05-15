const passport = require('passport');

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const departement = require('../controllers/departementResource');
    const departementPic = require('../controllers/departementPicResource');
    app.route('/api/v1/departements',passport.authenticate('jwt', { session: false }))
    .get(departement.getAll)
    .post(departement.create)
    app.route('/api/v1/departement/:id').get(departement.getById)
    app.route('/api/v1/departement-pic/:departemenId').get(departementPic.getByDepartemenId)
    // passport.authenticate('jwt', { session: false }),
}