const passport = require('passport');
const permission = require('../security/permission')

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const departement = require('../controllers/departementResource');
    const departementPic = require('../controllers/departementPicResource');
    app.route('/api/v1/departements')
    .get([passport.authenticate('jwt', { session: false }),permission],departement.getAll)
    .post([passport.authenticate('jwt', { session: false }),permission],departement.create)
    
    app.route('/api/v1/departement/:id').get([passport.authenticate('jwt', { session: false }),permission],departement.getByIdWithPic)
    .delete(passport.authenticate('jwt', { session: false }),departement.delete)
    .put([passport.authenticate('jwt', { session: false }),permission],departement.udpateByIdWithPic)

    app.route('/api/v1/departements/by-search').get(passport.authenticate('jwt', { session: false }),passport.authenticate('jwt', { session: false }),departement.getBySearch)
    
    app.route('/api/v1/departement-pic/:departemenId')
    .get(passport.authenticate('jwt', { session: false }),departementPic.getByDepartemenId)
}