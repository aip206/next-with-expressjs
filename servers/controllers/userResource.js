'use strict';

exports.getAll = (req,res) => {
    User.find({}, (err,user)=>{
        if(err){
            res.send(err);
        }
        res.json(user);

    });
};