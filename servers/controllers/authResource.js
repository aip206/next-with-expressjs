const Departement = require('../models/departement');
const jwt = require('jsonwebtoken');
const config = require('../config').get(process.env.NODE_ENV)

exports.authenticate = (req,res) =>{
    const { login, password } = req.body;
    if (login && password) {
      let user = Departement.findOne({
        where: {login: login}
      }).then(async (data) => {
          let valid = await data.comparePassword(password);
          if(valid){
            let payload = { id: data.id };
            let token = jwt.sign(payload, config.key.salt, { expiresIn: '1h' });
            res.json({ msg: 'ok', token: "Bearer " + token, data:data });
            }else{
                res.status(401).json({ msg: 'Password is incorrect' });
            }
      }).catch((err) => {
        res.status(401).json({ msg: 'User Not Found' });  
      })
    }else{
      res.status(400).json({ msg: 'Username/Password Harus Di isi' });
    }
}