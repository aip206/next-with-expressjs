const Customer = require('../models/customer');


exports.getAllBySearch = (req,res) => {
    Customer.count({
        where:{
            isDelete:false
        }
    }).then((data)=>{
        res.json({data:data})
    }).catch(err => {
        console.log(err)
        res.json({ msg: err })})  
}
