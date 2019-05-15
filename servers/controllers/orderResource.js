const Order = require('../models/order');
const DocOrder = require('../models/document_order');

exports.getAll = (req,res) => {

}

exports.getDocOrder = (req,res) => {
    
}

exports.create = (req,res) => {
    let { order_invoice, order_description, order_deadline, customer_name, document } = req.body;
    Order.create({
        order_invoice: order_invoice,
        order_description: order_description,
        order_deadline : order_deadline,
        customer_name : customer_name
    }).then(data=>{
       return document.forEach((x,index) => {
            let {documentId, pathFile} = x
            DocOrder.create({
                orderId : data.id,
                documentId : documentId,
                pathFile: pathFile
            })
            .then(x => {
                res.json({data:req.body})
            })
            .catch(err => {
                res.status(400);
                res.json({ msg: err })
                })
        });
    }).catch(err => {
        res.status(400);
        res.json({ msg: err })
        })
}