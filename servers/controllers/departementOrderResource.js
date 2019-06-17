const DepOrder = require('../models/departement_order');
const Order = require('../models/order');
const Departement = require('../models/departement');
const Sequelize = require('sequelize');
const db = require('../db/config')
const nodemailer = require('nodemailer');
const config = require('../config').get(process.env.NODE_ENV)
 transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.tls, // true for 465, false for other ports
    auth: {
        user: config.mail.username, // generated ethereal user
        pass: config.mail.password  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });
  const path = require('path'),
  Promise = require('bluebird');
const EmailTemplate = require('email-templates').EmailTemplate;

exports.getAll = (req,res) => {
   db.query("SELECT dorders.id,dorders.status, docor.orderId, o.createdAt, o.order_invoice, o.customer_name, dp.`name`, docor.pathFile, dorders.file, documen.dokumen_type FROM `departement_orders` as dorders \
    INNER JOIN departements dp on dp.id = dorders.departementId \
    INNER JOIN document_orders docor on docor.id = dorders.documentOrderId \
    INNER JOIN orders o on o.id = docor.orderId \
    INNER JOIN documents documen on documen.id = docor.documentId \
    WHERE dorders.departementId = :id and o.isDelete = 0",
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
    INNER JOIN document_orders docor on docor.id = dorders.documentOrderId \
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
            documentOrderId: req.query.orderId
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
    try{
        let update =DepOrder
        .update({status:"Sudah Diproses",file:req.body.file, link:req.body.link},{where:{id:req.params.id}})
        kirimKeDiriSendiri(req.user.email,req.body.link)
        res.json({data:req.body})
    }catch(e){
        console.log(e)
        res.json({ msg: e })
    }
    
}
exports.updateStatusDalamProses = (req,res) =>{
    DepOrder
    .update({status:"Dalam Proses"},{where:{id:req.params.id}})
    .then(data => res.json({data:data})).catch(err => res.json({ msg: err }))
}

exports.getProgresDepartementOrder = (req,res) => {
    db.query("SELECT count(*) as total, \
    (SELECT COUNT(*) FROM departement_orders WHERE documentOrderId= :docOdrdeID and `status` = 'Sudah Diproses' ) as sukses\
    FROM `departement_orders` depder \
    where depder.documentOrderId = :docOdrdeID",  
    {replacements: { docOdrdeID: req.params.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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

async function kirimKeDiriSendiri(nama, link){
  
    let users = [
        {
            email: nama,
            link: link
        }
    ];
    loadTemplate('mail-self', users).then((results) => {
        return Promise.all(results.map((result) => {
            sendEmail({
                to: result.context.email,
                from: 'Order Management System',
                subject: "File Upload",
                html: result.email.html,
            });
        }));
    }).then(() => {
        console.log('Yay!');
    });
 }


function sendEmail(obj){
    return transporter.sendMail(obj);
}

function loadTemplate(templateName, contexts){
    let template = new EmailTemplate(path.join(__dirname, 'template', templateName));
    return Promise.all(contexts.map((context) => {
        return new Promise((resolve, reject) => {
            template.render(context, (err, result) => {
                if (err) reject(err);
                else resolve({
                    email: result,
                    context,
                });
            });
        });
    }));
}