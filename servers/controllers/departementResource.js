
const Departement = require('../models/departement');

exports.getAll = (req,res) => {
    Departement
    .findAll({where:{
        isDelete:true
    }})
    .then(data => res.json({data:data})).catch(err => res.json({ error: err }))
}

exports.getById = (req,res) => {
    Departement
    .findOne({
        where:{
            id:req.params.id
        }
    })
    .then(data => res.json({data:data}))
    .catch(err => { console.log(err) 
                res.status(400);
                res.json({ error: err })
            })
}

exports.create = (req,res) => {
    
    let { name, login, password, email, role } = req.body;
    let errors = []
    if(!name) {
        errors.push({msg:"Missing Parameter Name"})
    }
    if(!login) {
        errors.push({msg:"Missing Parameter login"})
    }
    if(!password) {
        errors.push({msg:"Missing Parameter password"})
    }
    if(!email) {
        errors.push({msg:"Missing Parameter email"})
    }
    if(!role) {
        errors.push({msg:"Missing Parameter role"})
    }
    if(errors.length > 0) {
        res.status(400);
        res.json({error:errors});
    }else{
        Departement
        .create( { name, login, password, email, role })
        .then(data => res.json({data:req.body}))
        .catch(err => { console.log(err) 
                    res.status(400);
                    res.json({ error: err })
                })
    }



}