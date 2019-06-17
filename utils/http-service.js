import axios from 'axios';
// import izitoast from 'izitoast';
import Router from 'next/router'
import nextCookie from 'next-cookies'
import cookie from 'js-cookie'

const instance = axios.create({
  timeout: 10000,
  params: {} // do not remove this, its added to add params later in the config
});

// export const configureHttp = function() {
 

  //handling error
  instance.interceptors.request.use(function (config) {
    return config;
  }, function (error) {
    // izitoast.error({title: 'Warning', message: error})
    return Promise.reject(error);
  });

  // Add a response interceptor
  instance.interceptors.response.use(function (response) {
    return response;
  }, function (error, b, c) {
    var err = error.message;
    var title = 'Warning';
    if(error.response) {
      if(error.response.status == 401){
        swal({
          title: "Error",
          text: "Anda tidak Memiliki Hak Akses, apakah anda ingin Login Kembali ?",
          icon: "error",
          buttons: true,
        }).then((isDelete)=>{
          if(isDelete){
            cookie.remove('token');
            window.localStorage.removeItem('myData');
            Router.push('/login')
          }
         
        })  
      }else{
        swal({
          title: "Error",
          text: error,
          icon: "error",
          buttons: true,
        })
      }
      
      return Promise.reject(error);
    }})

    // var arrayContainUserMe = error.config.url.split('user/me')
    // if(arrayContainUserMe.length > 1){

    // } else {
    //   izitoast.show({title: title, message: err, theme: 'dark'})    
    // }
  
    
//   });
// }


export default instance;
