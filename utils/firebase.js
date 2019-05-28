import firebase from 'firebase/app';
import 'firebase/storage';
var firebaseConfig = {
    apiKey: "AIzaSyBkTv69ePSfObKVkSSvMAHwx1EupnLammE",
    authDomain: "api-project-786509725884.firebaseapp.com",
    databaseURL: "https://api-project-786509725884.firebaseio.com",
    projectId: "api-project-786509725884",
    storageBucket: "api-project-786509725884.appspot.com",
    messagingSenderId: "786509725884",
    appId: "1:786509725884:web:40fcfaaa7bf69ffd"
  };
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    }


const storage = firebase.storage();
export {
    storage,
    firebase as default
}