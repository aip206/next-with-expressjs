const Document = require('../models/documents');
const Departement = require('../models/departement');

exports.getAll = (req,res) => {
    Document.findAndCountAll({where:{
        isDelete:false
        },
        order: [
            [req.params.sortBy, req.params.sort],
        ],
        limit: parseInt(req.query.limit),
        offset: parseInt(req.query.page)
    }).then(data => res.json({data:data})).catch(err => res.json({ msg: err }))

}

exports.getById = (req, res) => {
    Document.findOne({ 
        include: [{
            model: Departement,
            as: 'departement',
            required: false,
            attributes: ['name'],
            through: { attributes: [] }
          }],
        where:{
        id:req.params.id
        }
    }).then(data => res.json({data:data}))
    .catch(err => { console.log(err) 
                res.status(400);
                res.json({ msg: err })
    })
}

exports.create = (req,res) => {
    let { dokumen_name, dokumen_type, description, documentFileId, departement } = req.body;
    let errors = []
    Document.create({
        dokumen_name: dokumen_name,
        dokumen_type: dokumen_type,
        description : description,
        documentFileId: documentFileId
    }).then(data=>{
        data
        .setDepartements(departement)
        .then(data=> 
            res.json({data:req.body}) )
        .catch(err => {
            console.log(err)
            res.status(400);
            res.json({ msg: err })
            })
        res.json({data:req.body}) 
    }).catch(err => {
        res.status(400);
        res.json({ msg: err })
        })
}
