const Promise = require('promise');
const Departement = require('../models/departement');
const ResetPassword = require('../models/reset_password');
const DepartementPic = require('../models/departement_pic');
const nodemailer = require('nodemailer');
const config = require('../config').get(process.env.NODE_ENV)
const crypto = require("crypto");
exports.getAll = (req,res) => {
    
    Departement
    .findAndCountAll({where:{
        isDelete:false,
        role:'departement'
    },
    order: [
        [req.query.sortBy, req.query.sort],
    ],
    subQuery: false,
    attributes: ['id', 'name', 'email', 'role','isActive','createdAt'],
    include:[{
        model: DepartementPic,
        attributes: ['nama','phone']
    }]})
    .then(data => res.json({data:data})).catch(err => 
        {
            console.log(err);
            res.json({ msg: err })
    })
}

exports.getBySearch = (req,res) => {
        Departement
        .findAll({
            where:{
                isDelete: false,
                role: "departement"
            },
            attributes: ['id','name']
        })
        .then(data => {
          
            res.json({data:data})
        }).catch(err => { 
                        console.log(err) 
                        res.status(400);
                        res.json({ msg: err })
                    
                    })
        
}
exports.update = (req,res) => {
    Departement
    .update({ name: 'foooo', description: 'baaaaaar'})
}
exports.getById = (req,res) => {
    Departement
    .findOne({
        where:{
            id:req.params.id,
            isDelete:false
        }
    })
    .then(data => res.json({data:data}))
    .catch(err => { console.log(err) 
                res.status(400);
                res.json({ msg: err })
            })
}

exports.getByIdWithPic = (req,res) => {
    const user_profile = Departement
    .findOne({
        where:{
            id:req.params.id,
            isDelete:false
        },attributes: ['id','name','email']
    })
    const pic = DepartementPic.findOne({where:{departementId:req.params.id}})

    Promise

        .all([user_profile, pic])
        .then(responses => {
        res.json(responses)
    })
    .catch(err => {
        res.status(400);
        res.json({ msg: err })
    });
}

exports.udpateByIdWithPic = (req,res) => {
    const {name, email, nama, phone, idpic} = req.body
    try {
        Departement
            .update({
                name:name,
                email:email
            },{where:{id:req.params.id}})
            DepartementPic.update({
                nama:nama,
                phone:phone
            },{
                where:{id:idpic}
            })
            res.json(req.body)
    }catch(err){
        res.status(400);
        res.json({ msg: err })
    }

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
    let { password, id } = req.body;
    Departement.update({password: true},{
        where:{
            id:password
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

 exports.create = async (req,res) => {
    
    let { name, email, role, nama,phone} = req.body;
    let errors = []
    if(!name) {
        errors.push({msg:"Missing Parameter Name"})
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
        
        const password = crypto.randomBytes(20).toString('hex');
        const resetPassword = {
            token: password,
            email: email
        }
        try{
            let validationEmail = await Departement.findOne({where: {email:email}})
            if(!validationEmail){
                Departement
                    .create( { name, email,password:password, role })
                    .then(data => {
                        const departementId = data.id
                        DepartementPic
                        .create({nama:nama,phone:phone,departementId:departementId})
                        .then((pic)=>{
                            ResetPassword.create(resetPassword).then((data)=>{
                                sendEmailPassword(data,pic,name);
                            })
                        })
                })
                res.json({valid:true, data:req.body})

            }else{
            res.status(400);
            res.json({ valid:false, msg: "Email Sudah digunakan" })
            } 
        }catch(e) {
            console.log(e);
            res.status(400);
            res.json({ valid:false, msg: e })
        }
         
        
    }
}

function sendEmailPassword (data, pic, name) {
    let link =  config.url+"/reset-password?token="+data.token+"&id="+data.email
    const output = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Order Management System</title>
    </head>
    <body>
        <h1 style="margin-bottom: 1rem;">Setel Ulang Sandi</h1>
        <hr>
        
        <p>${pic.nama} - ${name}</p>
    
        <p style="margin-bottom: 1rem"><a href=${link}>Klik disini</a> untuk setel ulang sandi.</p>
    
        <p>Terima kasih.</p>
    
    </body>
    
    </html>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
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

  // setup email data with unicode symbols
  let mailOptions = {
      from: 'Order Management System', // sender address
      to: data.email, // list of receivers
      subject: 'Pergantian Sandi', // Subject line
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('contact', {msg:'Email has been sent'});
  });
}
