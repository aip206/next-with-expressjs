const passport = require('passport');
const permission = require('../security/permission');

module.exports = (app) =>{
    require('../security/passport.js')(passport)
    const order = require('../controllers/orderResource');
    const customer = require('../controllers/customerResource');
    const depOrder = require('../controllers/departementOrderResource');

    app.route('/api/v1/dashboard/customer-by-admin')
    .get(passport.authenticate('jwt', { session: false }),customer.getAllBySearch)
    app.route('/api/v1/dashboard/order-bar-chart')
    .get(passport.authenticate('jwt', { session: false }),order.dashboardDayOfOrder)
    app.route('/api/v1/dashboard/dokumen-bar-chart')
    .get(passport.authenticate('jwt', { session: false }),order.dashboardDayOfDokumen)
    app.route('/api/v1/dashboard/order-finis')
    .get(passport.authenticate('jwt', { session: false }),order.dashboardOrderFinis)
    app.route('/api/v1/dashboard/dokumen-finis')
    .get(passport.authenticate('jwt', { session: false }),order.dashboardDokumenFinis)
    app.route('/api/v1/dashboard/date-selisih')
    .get(passport.authenticate('jwt', { session: false }),order.dashboardDateSelisih)
    app.route('/api/v1/dashboard/ranking')
    .get(passport.authenticate('jwt', { session: false }),depOrder.dashboardRanking)
    

}