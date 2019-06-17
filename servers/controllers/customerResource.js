const Customer = require('../models/customer');


exports.getAllBySearch = (req,res) => {
    Customer.find({
        where:{
            isDelete:false
        }
    }).then((data)=>{
        res.json({data:data})
    }).catch(err => {
        console.log(err)
        res.json({ msg: err })})  
}
