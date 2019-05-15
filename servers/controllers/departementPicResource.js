const DepartementPic = require('../models/departement_pic');

exports.getByDepartemenId = (req,res) => {
    DepartementPic
    .findOne({
        where:{
            departementId:req.params.departemenId,
            isDelete: false
        }
    })
    .then(data => res.json({data:data}))
    .catch(err => {  
                res.status(400);
                res.json({ msg: err })
            })
}