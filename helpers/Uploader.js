import firebase from "firebase"
import RNFetchBlob from "react-native-fetch-blob"
const Blob = RNFetchBlob.polyfill.Blob

const firebaseConfig = {
    apiKey: "AIzaSyAvOfaegGuwsjZNzzhPrDOutRizggH0Hsw",
    authDomain: "pontiac-970fe.firebaseapp.com",
    databaseURL: "https://pontiac-970fe.firebaseio.com",
    projectId: "pontiac-970fe",
    storageBucket: "pontiac-970fe.appspot.com",
    messagingSenderId: "952642331912"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);

// TODO: Get from auth
// Note: firebase doesn't let u save string with "." so replace with word "dot".
const userId = "therondevelopment@gmaildotcom"

// TODO: Make sure UI isn't allowed to perform operations before this completes
// TODO: Build in auth
let email = 'therondevelopment@gmail.com'
let password = 'default'

firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;

  console.log("error " , errorMessage);
});

window.Blob = Blob;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;

// TODO: Need to handle memory here better, getting crashes after uploading a lot of movies
const uploadMovie = function(movie, callback) {

  let storageRef = firebase.storage().ref();

   let rnfbURI = RNFetchBlob.wrap(movie.path)
   // create Blob from file path
   let blobBuilder = Blob
     .build(rnfbURI, { type : 'video/mov'})
     .then((blob) => {
       console.log("after creating " , blob);

       // upload image using Firebase SDK
       let refObject = storageRef
       .child(userId)
       .child(movie.timestamp.toString() + ".mov")
       .put(blob)

       let subscribe = refObject.on(firebase.storage.TaskEvent.STATE_CHANGED);
       subscribe({
         'next': (snapshot) => {
           console.log("next " , snapshot);
           // Wicked weird thing where bytesTransferred sometimes comes back as a (seemingly arbitrary?)
           // string instead of the int of bytes it should be
           if (typeof snapshot.bytesTransferred === "number") {
             let percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
             console.log(percent + "% done")
           }

         },
         'error': (snapshot) => {console.log("errored" , snapshot);},
         'complete': (snapshot) => {
           console.log("completed" , snapshot);

           // Try clearing out some memory
           // Note: Doesn't seem to be doing shit rn
           storageRef = null;
           rnfbURI = null;
           blobBuilder = null;
           subscribe = null;
           refObject = null;

           callback()
         }
       });

     })
}

const uploadMovieMetadata = function(movie) {

  // TODO: Assign a GUID to movies
  let timestamp = movie.timestamp.toString()

  let dataToSave = {}
  dataToSave[timestamp] = movie.location

  firebase.database().ref(`${userId}-movies`).update(dataToSave);

}

export default {
  firebaseConfig,
  firebaseApp,
  userId,
  uploadMovie,
  uploadMovieMetadata
}
