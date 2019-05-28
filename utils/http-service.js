import axios from 'axios';
import izitoast from 'izitoast';

export const configureHttp = function() {
 

  //handling error
  axios.interceptors.request.use(function (config) {
    return config;
  }, function (error) {
    izitoast.error({title: 'Warning', message: error})
    return Promise.reject(error);
  });

  // Add a response interceptor
  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error, b, c) {
    var err = error.message;
    var title = 'Warning';
    if(error.response) {
      if(error.response.data) {
        err = error.response.data.error_description;
        if(error.response.data.message)  err = error.response.data.message;
        if(error.response.data.detail) err = error.response.data.detail
        if(error.response.data.title) title = error.response.data.title
      }
    }

    // var arrayContainUserMe = error.config.url.split('user/me')
    // if(arrayContainUserMe.length > 1){

    // } else {
    //   izitoast.show({title: title, message: err, theme: 'dark'})    
    // }
  
    return Promise.reject(error);
  });
}


export default axios;
