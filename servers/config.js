
var config = {
  version:"1.0.0 - Beta Test",
  production: {
    key:{
        salt:'sanguan_broh'
    },
    database: {
      host     : 'localhost',
      user     : 'root',
      password : 'mysecretpassword',
      database : 'omsdb',
      insecureAuth: true
    },
    mail : {
      host: "smtp.gmail.com",
      port:"465",
      tls:true,
      username:"oms.butternut1@gmail.com",
      password:"hajiabun14"
    },
    url:"http://165.22.99.204:3001"
  },
  default: {
    key:{
        salt:'sanguan_broh'
    },
    database: {
      host     : 'localhost',
      user     : 'root',
      password : '1234abcd',
      database : 'omsdb',
      insecureAuth: true
    },
    mail : {
      host: "smtp.gmail.com",
      port:"587",
      tls:false,
      username:"oms.butternut1@gmail.com",
      password:"hajiabun14"
    },
    url:"http://localhost:3001"
  }
}

exports.get = function get(env) {
  return config[env] || config.default;
}