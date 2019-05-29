const Order = require('../models/order');
const DocOrder = require('../models/document_order');
const DepOrder = require('../models/departement_order');
const Document = require('../models/documents');
const Sequelize = require('sequelize');
const db = require('../db/config');


exports.getAll = (req,res) => {
    Order.findAndCountAll({
        where:{
            isDelete:false
        },
        subQuery: false,
        include: [{
            model: Document,
            as: 'documents', through: 'document_orders',
            attributes: ['id','dokumen_name']
        }]})
        .then(data => res.json({data:data})).catch(err => res.json({ msg: err }))
}

exports.getDocOrder = (req,res) => {
    DocOrder.findAll({
        where:{
            orderId:req.params.id
        },
        include: [{
            model: DepOrder,
            as: 'departement_orders', through: 'departement_orders',
            attributes: ['id','status']
        }]
    }).then(data => res.json({data:data})).catch(err => {
        console.log(err)
        res.json({ msg: err })})   
}

exports.getById =(req,res) =>{
    Order.findOne({
        where:{
            isDelete:false,
            id:req.params.id
            
        },
        include: [{
            model: Document,
            as: 'documents', through: 'document_orders',
            attributes: ['id','dokumen_name','path']
        }]
    }).then(data => res.json({data:data})).catch(err => {
        console.log(err)
        res.json({ msg: err })})
}

exports.create = (req,res) => {
    let { customer_address,customer_email,
        customer_kabupaten,
        customer_kecamatan,
        customer_phone,
        customer_provinsi, 
        customer_name, 
        dokuments,
        order_deadline,
        order_description,
        id_kabupaten,
        id_kecamatan,
        id_provinsi } = req.body;
    const date = new Date();
    const tahun = date.getFullYear().toString().substr(-2);
    const month = ((date.getMonth()+1) < 10 ? '0' : '') + (date.getMonth()+1)
    const day = (date.getDate() < 10 ? '0' : '') + date.getDate()
    db.query("SELECT ROW_NUMBER() OVER(ORDER BY createdAt DESC) AS number FROM orders where  createdAt >= CURDATE() AND createdAt <= CURDATE() + INTERVAL 1 DAY ORDER BY number DESC ",
    { raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
        let order_invoice = "OMS-"+tahun+month+day+counter(data)
        Order.create({
            order_invoice: order_invoice,
            order_description: order_description,
            order_deadline : order_deadline,
            customer_name : customer_name,
            customer_address:customer_address,
            customer_email:customer_email,
            customer_kabupaten,
            customer_kecamatan,
            customer_name,
            customer_phone,
            customer_provinsi, 
            customer_name,
            id_kabupaten,
            id_kecamatan,
            id_provinsi
        }).then(data=>{
           return dokuments.forEach((x,index) => {
                let {id, origin } = x
                DocOrder.create({
                    orderId : data.id,
                    documentId : id,
                    pathFile: origin
                })
                .then(data => {
                    console.log(data);
                    x.departements.forEach((xm)=>{
                        DepOrder.create({
                            documentOrderId: data.id,
                            departementId: xm.document_departements.departementId
                        })           
                    })
                    res.json({data:req.body})
                })
                .catch(err => {
                    console.log(err);
                    res.status(400);
                    res.json({ msg: err })
                    })
            });
        }).catch(err => {
            res.status(400);
            res.json({ msg: err })
            })
    }).catch(err => {
        res.status(400);
        res.json({ msg: err })
        })
    
}

exports.update = (req, res) => {
    let { customer_address,customer_email,
        customer_kabupaten,
        customer_kecamatan,
        customer_phone,
        customer_provinsi, 
        customer_name, 
        order_deadline,
        order_description,
        id_kabupaten,
        id_kecamatan,
        id_provinsi } = req.body;
    Order.update({
            order_description: order_description,
            order_deadline : order_deadline,
            customer_name : customer_name,
            customer_address:customer_address,
            customer_email:customer_email,
            customer_kabupaten,
            customer_kecamatan,
            customer_name,
            customer_phone,
            customer_provinsi, 
            customer_name,
            id_kabupaten,
            id_kecamatan,
            id_provinsi
        },
        {where: {id:req.params.id}}
    ).then(()=>{
        res.json({data:req.body})        
    }).catch((e)=>{
        res.status(400);
        res.json({ msg: err })
    })
}

exports.batalDokumen = (req,res) =>{
    DepOrder.destroy({where: {"documentOrderId":req.params.id}})
    DocOrder
    .destroy({where:{id:req.params.id}}).then(()=>{
        res.json({data:true})
    }).catch((e)=>{
        res.status(400);
        res.json({ msg: err })
    })

}

exports.suksesOrder = (req,res) =>{
    let {order_invoice} = req.body
    const newInvoice = order_invoice.replace("OMS", "DO")
    Order.update({order_status: "Finish",
    order_invoice: newInvoice
        },{
        where:{
            id:req.params.id
        }}).then(result =>{
             res.json({data:result})
            })
          .catch(err =>
            {
                res.status(400);
                res.json({ msg: err })
            }
          )
   
}

exports.addOrderDokumen =(req, res) => {
    let {documentId, origin, departements } = req.body;
    DocOrder.create({
        orderId : req.params.id,
        documentId : documentId,
        pathFile: origin
    })
    .then(data => {
        departements.forEach((xm)=>{
            DepOrder.create({
                documentOrderId: data.id,
                departementId: xm.document_departements.departementId
            })           
        })
        res.json({data:req.body})
    })
    .catch(err => {
        console.log(err);
        res.status(400);
        res.json({ msg: err })
        })
}


function counter(d) {
    if(d[0]){
        const count = parseInt(d[0].number)+1
        if(count < 10){
            return "00"+count
        }
        else if(count < 100 && d > 9) {
            return "0"+count
        }else{
            return count
        }
    }else{
        return "001"
    }
}

Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}