const passport = require('passport');

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const document = require('../controllers/orderResource');
    const depOrder = require('../controllers/departementOrderResource');
    const utiliti = require('../controllers/utilitiResource');
    app.route('/api/v1/orders')
    .get(passport.authenticate('jwt', { session: false }), document.getAll)
    .post(passport.authenticate('jwt', { session: false }),document.create)
    app.route('/api/v1/order/:id').get(passport.authenticate('jwt', { session: false }),document.getById).put(document.update)
    app.route('/api/v1/document-orders')
    .get(passport.authenticate('jwt', { session: false }),document.getDocOrder)
    app.route('/api/v1/order-delete-dokumen/:id').delete(passport.authenticate('jwt', { session: false }),document.batalDokumen)
    app.route('/api/v1/departement-order/by-dokumen-order-id').get(passport.authenticate('jwt', { session: false }),depOrder.getAllByDocumenOrder)
    app.route('/api/v1/departement-order/by-user').get(passport.authenticate('jwt', { session: false }),depOrder.getAll)
    app.route('/api/v1/departement-order-detail/:id/by-user').get(passport.authenticate('jwt', { session: false }),depOrder.getDetailOrder)
    app.route('/api/v1/utiliti/provinsi').get(utiliti.getProvinsi)
    app.route('/api/v1/utiliti/kabupaten/:id').get(utiliti.getKabupaten)
    app.route('/api/v1/utiliti/kecamatan/:id').get(utiliti.getKecamatan)
    app.route('/api/v1/utiliti/kelurahan/:id').get(utiliti.getKelurahan)

    app.route('/api/v1/update-sukses-dokumen-order/:id').put(passport.authenticate('jwt', { session: false }),depOrder.updateStatusSudahProses)
    app.route('/api/v1/update-progress-dokumen-order/:id').get(passport.authenticate('jwt', { session: false }),depOrder.updateStatusDalamProses)
    app.route('/api/v1/update-sukses-order/:id').post(passport.authenticate('jwt', { session: false }),document.suksesOrder)
    app.route('/api/v1/order/add-dokumen/:id').post(passport.authenticate('jwt', { session: false }),document.addOrderDokumen)
    app.route('/api/vi/progres-dokumen-order/:id').get(passport.authenticate('jwt', { session: false }),depOrder.getProgresDepartementOrder)
    app.route('/api/v1/document-orders/:id')
    .get(passport.authenticate('jwt', { session: false }),document.getDocOrder)
    app.route('/api/v1/order/check-progress/:id')
    .get(passport.authenticate('jwt', { session: false }),document.checkProgress)
    // app.route('/api/test/email').get(document.testEmail);
    // passport.authenticate('jwt', { session: false }),
}