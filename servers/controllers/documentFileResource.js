const DocFile = require('../models/document_file')

exports.create = (req,res) => {
    let {path} = req.body
    DocFile
    .create({path})
    .then(data =>{
        res.json({data:data})
    }).catch(err => {
        res.status(400);
        res.json({ msg: err })
    })
}