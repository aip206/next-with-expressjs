const fs = require('fs');
var foo = require('../db/json/propinsi.json');


exports.getProvinsi = (req,res,next) =>{
    res.send(foo);
    
}

exports.getKabupaten = (req,res) => {
    const data = require('../db/json/kabupaten/'+req.params.id+'.json');
    res.send(data)
}

exports.getKecamatan = (req,res) => {
    const data = require('../db/json/kecamatan/'+req.params.id+'.json');
    res.send(data)
}

exports.getKelurahan = (req,res) => {
    const data = require('../db/json/kelurahan/'+req.params.id+'.json');
    res.send(data)
}