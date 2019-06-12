const passport = require('passport');
const permission = require('../security/permission')

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const document = require('../controllers/documentResource');
    const docFile = require('../controllers/documentFileResource');
    app.route('/api/v1/documents')
    .get([passport.authenticate('jwt', { session: false }),permission],document.getAll)
    .post([passport.authenticate('jwt', { session: false }),permission],document.create)
    
    app.route('/api/v1/document/:id').get([passport.authenticate('jwt', { session: false }),permission],document.getById)
    .delete([passport.authenticate('jwt', { session: false }),permission],document.delete)
    .put([passport.authenticate('jwt', { session: false }),permission],document.update);
    app.route('/api/v1/document-lookup').get([passport.authenticate('jwt', { session: false }),permission],document.getDokumenMatrix)
    // passport.authenticate('jwt', { session: false }),
    app.route('/api/v1/document-files').post(passport.authenticate('jwt', { session: false }),docFile.create);
}