const Document = require('../models/documents');
const Departement = require('../models/departement');

exports.getAll = (req,res) => {
    Document.findAndCountAll({where:{
        isDelete:false
        },
        order: [
            [req.query.sortBy, req.query.sort],
        ],
        include: [{
            model: Departement,
            as: 'departements', through: 'document_departements',
            attributes: ['id','name']
        }]
    }).then(data => res.json({data:data})).catch(err => {
        console.log(err)
        res.json({ msg: err })
        })

}

exports.getDokumenMatrix  = (req,res) => {
    Document.findAll({
        where:{
            isDelete: false
        },
        attributes: ['id','dokumen_name','dokumen_type'],
        include: [{
            model: Departement,
            as: 'departements', through: 'document_departements'
        }],
    }).then(data => res.json({data:data})).catch(err => {
        console.log(err)
        res.json({ msg: err })
        })
}

exports.delete = (req, res) => {
    Document.update({isDelete: true},{
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

exports.getById = (req, res) => {
    Document.findOne({ 
        include: [{
            model: Departement,
            as: 'departements',
            required: false,
            attributes: ['id','name'],
            through: 'document_departements'
          }],
        where:{
        id:req.params.id,
        isDelete:false
        }
    }).then(data => res.json({data:data}))
    .catch(err => { console.log(err) 
                res.status(400);
                res.json({ msg: err })
    })
}

exports.create = (req,res) => {
    let { dokumen_name, dokumen_type, description, departements, file, link } = req.body;
    console.log(dokumen_name);
    Document.create({
        dokumen_name: dokumen_name,
        dokumen_type: dokumen_type,
        description : description,
        path: file,
        link:link
    }).then(data=>{
        console.log(data);
        if(departements.length > 0){
            data.setDepartements(departements);
        }        
        res.json({data:req.body}) 
    }).catch(err => {
        console.log(err)
        res.status(400);
        res.json({ msg: err })
        })
}
exports.update = (req,res) => {
    let { dokumen_name, dokumen_type, description, departements, file,link } = req.body;  
    let data = {
        dokumen_name: dokumen_name,
        dokumen_type: dokumen_type,
        description : description,
        path: file,id: req.params.id,
        link:link
    } 
    updateOrCreate(Document, {id:req.params.id},data)
    .then(data=>{
        if(departements.length > 0){
            data.item.setDepartements(departements);
        }        
        res.json({data:req.body}) 
    }).catch(err => {
        console.log(err)
        res.status(400);
        res.json({ msg: err })
        }) 
}

function updateOrCreate (model, where, newItem) {
    // First try to find the record
    return model
    .findOne({where: where})
    .then(function (foundItem) {
        if (!foundItem) {
            // Item not found, create a new one
            return model
                .create(newItem)
                .then(function (item) { return  {item: item, created: true}; })
        }
         // Found an item, update it
        return model
            .update(newItem, {where: where})
            .then(function (item) { return {item: foundItem, created: false} }) ;
    })
}