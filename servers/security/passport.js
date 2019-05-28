const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Departement = require('../models/departement');
const config = require('../config').get(process.env.NODE_ENV)

module.exports = (passport) => {
    const opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.key.salt
    passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
        Departement.findOne({where:{id:jwt_payload.id}}).then((dept) => {
           return done(null,dept)
        }).catch((err) => {
            return done(err,false) 
        })
    }))
}