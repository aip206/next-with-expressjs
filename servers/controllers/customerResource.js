const Customer = require('../models/customer');


exports.getAllBySearch = (req,res) => {
    Customer.find({
        where:{
            email:req.params.email
        }
    }).then((data)=>{
        res.json({data:data})
    }).catch(err => {
        console.log(err)
        res.json({ msg: err })})  
}