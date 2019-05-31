const Departement = require('../models/departement');
const jwt = require('jsonwebtoken');
const config = require('../config').get(process.env.NODE_ENV)
const ResetPassword = require('../models/reset_password');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const nodemailer = require('nodemailer');

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

exports.forgotPassword = (req,res) => {
  const {email} = req.body;
  const password = crypto.randomBytes(20).toString('hex');
  const resetPassword = {
    email : email,
    token: password
  }
  ResetPassword.create(resetPassword).then((data)=>{
    sendEmailPassword(data);
    res.json({data:true})
}).catch((err) => {
  console.log(err)
    res.status(400);
    res.json({ msg: err })
})

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

function sendEmailPassword (data) {
  const output = `
  <p>You have a new contact request</p>
  <h3>Contact Details</h3>
  ${config.url}/reset-password?token=${data.token}&id=${data.email}
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
    from: '"Nodemailer Contact" <your@email.com>', // sender address
    to: data.email, // list of receivers
    subject: 'Reset Password', // Subject line
    text: 'Hello world?', // plain text body
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
