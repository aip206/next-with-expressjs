const DepOrder = require('../models/departement_order');
const Order = require('../models/order');
const Departement = require('../models/departement');
const Sequelize = require('sequelize');
const db = require('../db/config')

exports.getAll = (req,res) => {
   db.query("SELECT dorders.id,dorders.status, docor.orderId, o.createdAt, o.order_invoice, o.customer_name, dp.`name`, docor.pathFile, dorders.file, documen.dokumen_type FROM `departement_orders` as dorders \
    INNER JOIN departements dp on dp.id = dorders.departementId \
    INNER JOIN document_orders docor on docor.id = dorders.docOrderID \
    INNER JOIN orders o on o.id = docor.orderId \
    INNER JOIN documents documen on documen.id = docor.documentId \
    WHERE dorders.departementId = :id ",
    { replacements: { id: req.user.id },raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
        if(data){
            res.json({ data: data }) 
        }else{
            res.json({ data: [] })
        }
    }).catch((err)=>{
        console.log(err)
        res.status(400);
        res.json({ msg: err })
    })
}

exports.getDetailOrder = (req,res) => {
    db.query("SELECT dorders.id, dorders.status, o.order_invoice, doc.dokumen_name, doc.dokumen_type, dorders.departementId, docor.pathFile, dorders.file  FROM `departement_orders` as dorders \
    INNER JOIN departements dp on dp.id = dorders.departementId \
    INNER JOIN document_orders docor on docor.id = dorders.docOrderID \
    INNER JOIN documents doc on doc.id = docor.documentId \
    INNER JOIN orders o on o.id = docor.orderId \
    WHERE dorders.departementId = :id and o.id = :orderId ",
    { replacements: { id: req.user.id , orderId: req.params.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
        if(data){
            res.json({ data: data }) 
        }else{
            res.json({ data: [] })
        }
    }).catch((err)=>{
        console.log(err)
        res.status(400);
        res.json({ msg: err })
    })
}

exports.getAllByDocumenOrder = (req,res) =>{
    DepOrder.findAll({
        where:{
            docOrderID: req.query.orderId
        },include:[{
            model: Departement,
            attributes: ['name']
        }]
    }).then(data => res.json({data:data})).catch(err => {
        console.log(err);
        res.json({ msg: err })
})
}

exports.updateStatusSudahProses = (req,res) =>{
    DepOrder
    .update({status:"Sudah Diproses",file:req.body.file},{where:{id:req.params.id}})
    .then(data => res.json({data:data})).catch(err =>{
         console.log(err) 
        res.json({ msg: err })})
}
exports.updateStatusDalamProses = (req,res) =>{
    DepOrder
    .update({status:"Dalam Proses"},{where:{id:req.params.id}})
    .then(data => res.json({data:data})).catch(err => res.json({ msg: err }))
}