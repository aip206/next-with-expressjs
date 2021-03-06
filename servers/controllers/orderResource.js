const Order = require('../models/order');
const DocOrder = require('../models/document_order');
const Departement = require('../models/departement');
const DepOrder = require('../models/departement_order');
const Document = require('../models/documents');
const Customer = require('../models/customer');
const Sequelize = require('sequelize');
const db = require('../db/config');
const config = require('../config').get(process.env.NODE_ENV)
const nodemailer = require('nodemailer'),
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


exports.dashboardDokumenFinis = (req,res) => {
    if(req.user.role == 'admin'){
        db.query("Select (SELECT count(*) FROM `document_orders` where isDelete = 0 ) as total , \
        (SELECT count(*) FROM `document_orders` where isDelete = 0 and status = 'FINISH') as finish  "
        ,
        {raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
    else{
        db.query("Select (SELECT count(*) FROM `document_orders` docord \
        INNER JOIN departement_orders depord on depord.documentOrderId = docord.id \
        where docord.isDelete = 0 and depord.departementId = :id ) as total ,  \
            (SELECT count(*) FROM `document_orders` docord \
                INNER JOIN departement_orders depord on depord.documentOrderId = docord.id \
                where docord.isDelete = 0 and docord.status = 'FINISH' and depord.departementId = :id ) as finish "
        ,
        {replacements: { id: req.user.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
}

exports.dashboardDateSelisih = (req,res) => {
    if(req.user.role == 'admin'){
        db.query("select DATEDIFF(date_succses,createdAt) as selisih from orders\
        where order_status = 'Finish' and isDelete = 0 "
        ,
        {raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
    }else{
        db.query("select DATEDIFF(tgl_selesai,o.createdAt) as selisih from orders o \
        INNER JOIN document_orders docord on docord.orderId =  o.id \
        INNER JOIN departement_orders depord on depord.documentOrderId = docord.id \
        where order_status = 'Finish' and o.isDelete = 0 and depord.departementId = :id"
        ,
        {replacements: { id: req.user.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
}
exports.dashboardDayOfDokumen = (req,res) => {
    if(req.user.role == 'admin'){
        db.query("SELECT \
        COUNT(*) as total, \
        WEEKDAY(createdAt) AS hari \
        FROM document_orders  \
        WHERE isDelete = 0\
        GROUP BY hari; "
        ,
        {raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
    }else{
        db.query("SELECT  \
        COUNT(*) as total,  \
        WEEKDAY(docord.createdAt) AS hari  \
        FROM document_orders  docord  \
				INNER JOIN departement_orders depord on depord.documentOrderId = docord.id \
        WHERE docord.isDelete = 0 and depord.departementId = :id \
        GROUP BY hari;"
        ,
        {replacements: { id: req.user.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
}

exports.dashboardDayOfOrder = (req,res) => {
    if(req.user.role == 'admin'){
        db.query("SELECT \
        COUNT(*) as total, \
        WEEKDAY(createdAt) AS hari \
        FROM orders  \
        WHERE isDelete = 0\
        GROUP BY hari; "
        ,
        {raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
    }else{
        db.query("\
        SELECT \
            COUNT(*) as total,  \
            WEEKDAY(o.createdAt) AS hari  \
            FROM orders  o \
        INNER JOIN document_orders docord on docord.orderId =  o.id \
        INNER JOIN departement_orders depord on depord.documentOrderId = docord.id \
            WHERE o.isDelete = 0 and depord.departementId = :id and docord.isDelete = 0 \
            GROUP BY hari; "
        ,
        {replacements: { id: req.user.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
}

exports.dashboardOrderFinis = (req,res) => {
    if(req.user.role == 'admin'){
        db.query("Select (SELECT count(*) FROM `orders` where isDelete = 0 ) as total , \
        (SELECT count(*) FROM `orders` where isDelete = 0 and order_status = 'Finish') as finish "
        ,
        {raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
    }else{
        
    db.query("Select (SELECT count(*) FROM `orders` o \
    INNER JOIN document_orders docord on docord.orderId =  o.id \
    INNER JOIN departement_orders depord on depord.documentOrderId = docord.id \
    where o.isDelete = 0 and depord.departementId = :id and docord.isDelete = 0 \
    ) as total , \
        (SELECT count(*) FROM `orders` o \
    INNER JOIN document_orders docord on docord.orderId =  o.id\
    INNER JOIN departement_orders depord on depord.documentOrderId = docord.id\
    where o.isDelete = 0 and depord.departementId = :id and order_status = 'Finish' and docord.isDelete = 0 ) as finish"
    ,
    {replacements: { id: req.user.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
}

exports.getAll = (req,res) => {
    Order.findAndCountAll({
        where:{
            isDelete:false
        },
        subQuery: false
        })
        .then(data => res.json({data:data})).catch(err => res.json({ msg: err }))
}

exports.getDocOrder = (req,res) => {
    DocOrder.findAll({
        where:{
            orderId:req.params.id,
            isDelete:false
        },
        include: [
            {
                model: DepOrder,
                where:{
                    isDelete: false
                },include: [
                    {
                        model: Departement
                    }]
            },
            Document]
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
            model: DocOrder
        }]
    }).then(data => res.json({data:data})).catch(err => {
        console.log(err)
        res.json({ msg: err })})
}

exports.delete = (req,res ) => {
    try{
        let order = Order.update({isDelete: true},{
            where:{
                id:req.params.id
            }})
        let docOrder = DocOrder.update({isDelete: true},{
            where:{
                orderId:req.params.id
            }
        })
        res.json({data:true})
    }catch(err){
        console.log(err)
        res.json({ msg: err })
    }
    
}

exports.create = async (req,res) => {
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
    try{
        const dataCustomer = {
            address: customer_address,
            email: customer_email,
            phone: customer_phone,
            first_name:customer_name, 
            provinsi:customer_provinsi,
            kabupaten:customer_kabupaten,
            kecamatan: customer_kecamatan,
            id_kabupaten: id_kabupaten,
            id_provinsi: id_provinsi,
            id_kecamatan: id_kecamatan
        }
        let customer = await updateOrCreate(Customer, {email:customer_email},dataCustomer)
        let linkFirebase=[];
        let c  = await db.query("select count(*) as number from orders where DATE(createdAt) = CURDATE()",{ raw: true,type: Sequelize.QueryTypes.SELECT})
        let order_invoice = "OMS-"+tahun+month+day+counter(c)
        let order = await Order.create({
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
        })
        let dokumen = await saveDokumen(dokuments, order)
        setTimeout(() => kirimEmailCustomer(customer_email, order,dokumen), 10000);
        res.json({data:req.body})
    }catch(err) {
        console.log(err)
        res.status(400);
        res.json({ msg: err })
        }


    }


exports.update = async (req, res) => {
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
    const dataCustomer = {
        address: customer_address,
        email: customer_email,
        phone: customer_phone,
        name:customer_name, 
        provinsi:customer_provinsi,
        kabupaten:customer_kabupaten,
        kecamatan: customer_kecamatan,
        id_kabupaten: id_kabupaten,
        id_provinsi: id_provinsi,
        id_kecamatan: id_kecamatan
    }
    let customer = await updateOrCreate(Customer, {email:customer_email},dataCustomer)
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
    DepOrder.update({isDelete: true},{where: {"documentOrderId":req.params.id}})
    DocOrder
    .update({isDelete: true},{where:{id:req.params.id}}).then((data)=>{
        res.json({data:true})
    }).catch((e)=>{
        res.status(400);
        res.json({ msg: err })
    })

}

exports.suksesOrder = (req,res) =>{
    let {order_invoice, customer_email} = req.body
    const newInvoice = order_invoice.replace("OMS", "DO")
    Order.update({
        order_status: "Finish",
        order_invoice: newInvoice,
        date_succses: new Date()
        },{
        where:{
            id:req.params.id
        }}).then(result =>{
            kirimEmailCustomerFinish(customer_email,req.params.id)
             res.json({data:result})
            })
          .catch(err =>
            {
                res.status(400);
                res.json({ msg: err })
            }
          )
   
}

exports.addOrderDokumen = async (req, res) => {
    let {documentId, origin, departements,link } = req.body;
    try {
    let dokumeOrder = await DocOrder.create({
            orderId : req.params.id,
            documentId : documentId,
            pathFile: origin,
            link
        })    
        departements.forEach(async (xm)=>{
            DepOrder.create({
                documentOrderId: dokumeOrder.id,
                departementId: xm.document_departements.departementId
            })           
            let kirimEmail = await kirimEmailDepartement(link, xm.document_departements.departementId)
        })
        res.json({data:req.body})
    }catch(err) {
        console.log(err)
        res.status(400);
        res.json({ msg: err })
    }
    // DocOrder.create({
    //     orderId : req.params.id,
    //     documentId : documentId,
    //     pathFile: origin,
    //     link
    // })
    // .then(data => {
    //     departements.forEach(async (xm)=>{
    //         DepOrder.create({
    //             documentOrderId: data.id,
    //             departementId: xm.document_departements.departementId
    //         })           
    //         let kirimEmail = await kirimEmailDepartement(link, xm.document_departements.departementId)
    //     })
    //     res.json({data:req.body})
    // })
    // .catch(err => {
    //     console.log(err);
    //     res.status(400);
    //     res.json({ msg: err })
    //     })
}

exports.checkProgress = (req,res) => {
    db.query("    SELECT count(*) as total, (\
        SELECT count(*) FROM `orders` o \
        INNER JOIN document_orders docder on docder.orderId = o.id\
        INNER JOIN departement_orders depder on depder.documentOrderId = docder.id\
        where docder.isDelete = 0 and o.id = :orderId and depder.`status` = 'Sudah Diproses'\
        ) as totalDepartement FROM `orders` o \
        INNER JOIN document_orders docder on docder.orderId = o.id\
        INNER JOIN departement_orders depder on depder.documentOrderId = docder.id\
        where docder.isDelete = 0 and o.id = :orderId",  
    {replacements: { orderId: req.params.id},raw: true,type: Sequelize.QueryTypes.SELECT}).then((data)=>{
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
    })
}


async function kirimEmailCustomerFinish(nama, order){
   let data = await  db.query("SELECT depor.file,o.customer_email, depor.link FROM `departement_orders` depor\
   INNER JOIN document_orders  docor on docor.id = depor.documentOrderId\
   INNER JOIN orders o on o.id = docor.orderId\
   where o.id = :orderId",  
{replacements: { orderId: order},raw: true,type: Sequelize.QueryTypes.SELECT})
   let users = [
       {
           email: nama,
           link: data.map((x)=> x.link)
       }
   ];
   loadTemplate('mail-finish-order', users).then((results) => {
       return Promise.all(results.map((result) => {
           sendEmail({
               to: result.context.email,
               from: 'Order Management System',
               subject: "Pesanan Diteruskan",
               html: result.email.html,
           });
       }));
   }).then(() => {
       console.log('Yay!');
   });
}



 async function kirimEmailCustomer(nama, order){
    let data = await DocOrder.findAll({where:{
        orderId:order.id
    }})
    let users = [
        {
            email: nama,
            link: data.map((x)=> x.link)
        }
    ];
    loadTemplate('mail-customer', users).then((results) => {
        return Promise.all(results.map((result) => {
            sendEmail({
                to: result.context.email,
                from: 'Order Management System',
                subject: "Pesanan Diteruskan",
                html: result.email.html,
            });
        }));
    }).then(() => {
        console.log('Yay!');
    });
}

async function kirimEmailDepartement(link, id){
    let data = await Departement.findOne({where:{
        id:id
    }})
    let users = [
        {
            email: data.email,
            link: link
        }
    ];
    loadTemplate('mail-departement', users).then((results) => {
        return Promise.all(results.map((result) => {
            sendEmail({
                to: result.context.email,
                from: 'Order Management System',
                subject: "Pesanan Baru",
                html: result.email.html,
            });
        }));
    }).then(() => {
        console.log('Yay!');
    });
}


function counter(d) {
    if(d[0]){
        const count = parseInt(d[0].number)+1
        if(count < 10){
            return "00"+count
        }
        else if(count < 100 && count > 9) {
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

async function saveDokumen(dokuments, order){
    dokuments.forEach(async (x,index) => {
        let {id, origin,link } = x
        let emailDep = []
        const docOrder = await DocOrder.create({
                orderId : order.id,
                documentId : id,
                pathFile: origin,
                link:link
            }).then((d)=>{
                x.departements.forEach(async (xm)=>{
                    DepOrder.create({
                        documentOrderId: d.id,
                        departementId: xm.document_departements.departementId
                    })
                    let kirimEmail = await kirimEmailDepartement(link, xm.document_departements.departementId)
                })  
            })
            
    })
}