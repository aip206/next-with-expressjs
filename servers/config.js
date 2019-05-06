
var config = {
  production: {
    key:{
        salt:'sanguan_broh'
    },
    database: {
      host     : 'localhost',
      user     : 'root',
      password : '1234abcd',
      database : 'temp',
      insecureAuth: true
    }
  },
  default: {
    key:{
        salt:'sanguan_broh'
    },
    database: {
      host     : 'localhost',
      user     : 'root',
      password : '1234abcd',
      database : 'temp',
      insecureAuth: true
    }
  }
}

exports.get = function get(env) {
  return config[env] || config.default;
}