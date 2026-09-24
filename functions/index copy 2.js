const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
 if (__DEV__) {
    functions().useFunctionsEmulator('http://localhost:5000'); //Deploy funstion using emulator
  }
});

// exports.listProducts = functions.https.onCall((data, context) => {
//     const { page = 1, limit = 10 } = data;
  
//     const startAt = (page - 1) * limit;
//     const endAt = startAt + limit;
  
//     return products.slice(startAt, endAt);
//   });

 
  // exports.sendPushNotification = functions.database
  // .ref("users/{userID}")
  // .onCreate(event => {
  //     const data = event._data;
  //     payload = {
  //       notification: {
  //         title: "Welcome",
  //         body: "thank for installed our app",
  //       },
  //     };
  //     admin
  //       .messaging()
  //       .sendToDevice(data.notification_token, payload)
  //       .then(function(response) {
  //         console.log("Notification sent successfully:", response);
  //       })
  //       .catch(function(error) {
  //         console.log("Notification sent failed:", error);
  //       });
  //   });

  exports.waitReq = functions.https.onRequest((req, res)=>{
    res.status(200).json({
      message:'OKAY'
    });

  })

