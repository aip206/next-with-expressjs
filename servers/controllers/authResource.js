const Departement = require('../models/departement');
const jwt = require('jsonwebtoken');
const config = require('../config').get(process.env.NODE_ENV)
const ResetPassword = require('../models/reset_password');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const DepartementPic = require('../models/departement_pic');

exports.authenticate = (req,res) =>{
    const { email, password } = req.body;
    if (email && password) {
      let user = Departement.findOne({
        where: {email: email}
      }).then(async (data) => {
          let valid = await data.comparePassword(password);
          if(valid){
            let payload = { id: data.id };
            let token = jwt.sign(payload, config.key.salt, { expiresIn: '1h' });
            res.json({ msg: 'ok', token: "Bearer " + token, data:data });
            }else{
                res.status(401).json({ msg: 'Password Salah' });
            }
      }).catch((err) => {
        res.status(401).json({ msg: 'Account Tidak Ditemukan' });  
      })
    }else{
      res.status(400).json({ msg: 'Username/Password Harus Di isi' });
    }
}

exports.changePassword = (req,res) => {
  const salt = bcrypt.genSaltSync();
  const hashPass = bcrypt.hashSync(req.body.password, salt);
  Departement.update({password:hashPass},{
    where: {email: req.user.email}
  }).then((data)=>{
    res.json({data:true})
  }).catch((err)=>{
    res.status(400);
    res.json({ msg: err })
  })
}

exports.forgotPassword = async (req,res) => {
  const {email} = req.body;
  const password = crypto.randomBytes(20).toString('hex');
  const resetPassword = {
    email : email,
    token: password
  }
  try{
    let dep = await Departement.findOne({where:{
            email:email
        },attributes: ['id','name','email']
        })
    let pic = await DepartementPic.findOne({where:{departementId:dep.id}}) 
      ResetPassword.create(resetPassword).then((data)=>{
        sendEmailPassword(data,pic,dep);
        res.json({data:true})
        })
  }catch(err){
    console.log(err)
    res.status(400);
  }
//  Departement
//     .findOne({
//         where:{
//             email:email
//         },attributes: ['id','name','email']
//     }).then((dep)=>{
//       const pic = DepartementPic.findOne({where:{departementId:dep.id}})    
//       ResetPassword.create(resetPassword).then((data)=>{
//           sendEmailPassword(data,pic,dep);
//           res.json({data:true})
//       }).catch((err) => {
//         console.log(err)
//           res.status(400);
//           res.json({ msg: err })
//       })
//     })
  

}

exports.resetPassword = (req,res) =>{
  const {password, email, token} = req.body;
  ResetPassword.findOne({where:{
    email: email,
    token: token
  }}).then((resp)=>{
    const salt = bcrypt.genSaltSync();
    const hashPass = bcrypt.hashSync(password, salt);
    Departement.update({
      password: hashPass
    },{where: {
      email:email
    }}).then((resp)=>{
      res.json({data:true})
    }).catch((er) =>{
      console.log(err) 
      res.status(400);
      res.json({ msg: err })
    })
  })
}

function sendEmailPassword (data, pic, departemen) {
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
        
        <p>${pic.nama} - ${departemen.name}</p>
    
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
