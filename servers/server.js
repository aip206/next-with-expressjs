const express = require('express')
const next = require('next')
const bodyParser = require('body-parser')
const config = require('./config.js').get(process.env.NODE_ENV)
const methodOverride = require('method-override')
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

function errorCallback(err, req, res, next) {
        res.status(400);
        res.send({msg:err.message});
     }

app.prepare().then(() => {
    const server = express();     
    
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json()); 

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