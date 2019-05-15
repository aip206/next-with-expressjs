const passport = require('passport');

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const document = require('../controllers/documentResource');
    const docFile = require('../controllers/documentFileResource');
    app.route('/api/v1/documents')
    .get(document.getAll)
    .post(document.create)
    app.route('/api/v1/document/:id').get(document.getById);
    // passport.authenticate('jwt', { session: false }),
    app.route('/api/v1/document-files').post(docFile.create);
}