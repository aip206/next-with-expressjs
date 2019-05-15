
const Departement = require('../models/departement');
const DepartementPic = require('../models/departement_pic');
exports.getAll = (req,res) => {
    console.log(req.user)
    Departement
    .findAndCountAll({where:{
        isDelete:false
    },
    order: [
        [req.query.sortBy, req.query.sort],
    ],
    subQuery: false,
    attributes: ['id', 'name', 'login', 'email', 'role','isActive','createdAt'],
    limit: parseInt(req.query.limit),
    offset: parseInt(req.query.page)})
    .then(data => res.json({data:data})).catch(err => res.json({ msg: err }))
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
                res.json({ msg: err })
            })
}

exports.getByIdWithPic = (req,res) => {
    Departement
    .findOne({
        where:{
            id:req.params.id
        }
    })
    .then(data =>{ 
        const pic = DepartementPic.findOne({where:{departementId:data.id}})
        res.json({data:{
            user: data,
            pic : pic
        }}
    )})
    .catch(err => { console.log(err) 
                res.status(400);
                res.json({ msg: err })
            })
}


exports.delete = (req, res) => {
    Departement.update({isDelete: true},{
        where:{
            id:req.params.id
        }}).then(result =>
             res.json({data:result})
          )
          .catch(err =>
            {
                res.status(400);
                res.json({ msg: err })
            }
          )
}

exports.changePassword = (req, res) => {
    let { login, password } = req.body;

    Departement.update({isDelete: true},{
        where:{
            id:req.params.id
        }}).then(result =>
             res.json({data:result})
          )
          .catch(err =>
            {
                res.status(400);
                res.json({ msg: err })
            }
          )
}

exports.create = (req,res) => {
    
    let { name, login, password, email, role, code_pic,phone_pic } = req.body;
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
        .then(data => {
            const departementId = data.id
            DepartementPic
            .create({code:code_pic,phone:phone_pic,departementId:departementId}).catch(err => { console.log(err) 
                res.status(400);
                res.json({ msg: err })
            })
            res.json({data:req.body})

        })
        .catch(err => { console.log(err) 
                    res.status(400);
                    res.json({ msg: err })
                })
    }
}

