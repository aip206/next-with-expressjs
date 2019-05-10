const express = require('express')
const next = require('next')
const bodyParser = require('body-parser')
const config = require('./config.js').get(process.env.NODE_ENV)
const methodOverride = require('method-override')
const port = parseInt(process.env.PORT, 10) || 3001
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const db = require('./db/config')
const passport = require('passport')
const departement = require('./routes/departementRoute')
const auth = require('./routes/authenticateRoute')


function errorCallback(err, req, res, next) {
        res.status(500);
        res.send({msg:err.message});
     }

app.prepare().then(() => {
    const server = express();  
    db.authenticate()
        .then(() => console.log('Database connected...'))
        .catch(err => console.log('Error: ' + err))   
    
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json()); 
    server.use(passport.initialize());
    departement(server);
    auth(server);
    server.get('*', (req, res) => {
        return handle(req, res)
      })
    server.use(methodOverride());
    server.use(errorCallback);
    server.listen(port, err => {
    if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })

})