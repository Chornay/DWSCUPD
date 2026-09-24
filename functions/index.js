//NOTE all the functions are deployed in asia-southeast2


// const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const { HttpsError } = require("firebase-functions/v2/https");
const { functions } = require('firebase-functions/v2');
const admin = require("firebase-admin");
const { logger } = require('firebase-functions');
// const crypto = require('crypto')
const nodemailer = require("nodemailer");
admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true })
// const orderRef = admin.firestore().collection('Orders')
const db = admin.firestore();
const semver = require('semver');

const MIN_ANDROID = '1.0.0'


//this was test account
// const MERCHANT_KEY = "HQgUUZLVzg"
// const MERCHANT_CODE = "M01230"
// const MERCHANT_KEY = "fFJPKNPIpj" //as issued
// const MERCHANT_CODE = "M31384_S0001" //CAREFUL ... THIS LITERAL VALUE IS ALSO USED IN THE CODE!!!
//IF YOU CHANGE THEN CHANGE THERE AS WELL


/////////////////// testCustId //////////////////////////////
//we look for Counters.Custid.lastAlloc and increment it to get 
//the next customer id
//throws errors both specific and general
// exports.testCustId = functions.https.onCall(async (data,context) => {
//   let nextId
//   const ctrDocRef = db.collection('Counters').doc('CustId')
//   await db.runTransaction(async trnx => {
//     const counterDoc = await trnx.get(ctrDocRef)
//     if (!counterDoc.exists) { throw new functions.https.HttpsError('not-found', 'Unable to access Counters doc') }
//     if (!counterDoc.data().hasOwnProperty('lastAlloc')) { 
//       throw new functions.https.HttpsError('not-found', 'Unable to access CustId Counter')  }
//     nextId = counterDoc.data().lastAlloc+1
//     await trnx.update(ctrDocRef, { lastAlloc: nextId })
//   })
//   return nextId
// })

/////////////////// helloDW //////////////////////////////
// Always end an HTTP function with send(), redirect(), or end()
// exports.helloDW = functions.https.onRequest(async (request, response) => {
//    try {
//       newRef = await orderRef.doc('MY02-A-01019').get()
//       functions.logger.info(newRef.name, { structuredData: true });
//       response.send(newRef.data().name);
//    }
//    catch (error) {
//       response.send('Error ' + error.message);
//    }
// });



exports.logToFirebase = onCall({ region: 'asia-southeast2' },
  (request) => {
    const message = request.data.message || 'No message provided';
    const level = request.data.level || 'info';
    switch (level) {
      case 'warning':
        logger.warn('[logMessage]', message);
        break;
      case 'error':
        logger.error('[logMessage]', message);
        break;
      default:
        logger.log('[logMessage]', message);
    }

    return { success: true, logged: message };
  });

////////////////// checkSystem //////////////////////////////
//20250924 returns mustUpdate and a trial message
exports.checkSystem = onCall({ region: 'asia-southeast2' },
  async (request) => {

    const { platform, version, buildNumber } = request.data;
    // functions.logger.info(shopId);
    const mustUpdate = semver.lt(version, MIN_ANDROID)

    return {}

    // return {
    //   mustUpdate,
    //   minVersion: MIN_ANDROID,
    //   msgAvail:false,
    //   msgText: "this is a message from DW control",
    // }
    // throw new functions.https.HttpsError('internal', `Your current version is ${version}.\nPlease update to continue.`)
  })

exports.sendMsg = onCall({ region: 'asia-southeast2' },
  async (request) => {
    const { token, title = 'Dobby Walla', text = '', sound } = request.data;
    console.log('My token------------>', request.data)
    const message = {
      // notification: { title: "Welcome", body: "thank for installing our app" },
      notification: { title: title, body: text },
      // token: 'dRg9zirGQ8S7x5ezgnurAX:APA91bEUeC1Z-9EyQ8clQK8xHc0kWKTMFXj73DeMvGX4bg4q_XPzTzQWgUbVSAIoWV4cWQEVko6xVfWV8eVDc3SURMKBXPGgFuQpREQVTku4I7bg3f5IJnY',
      token: token,
      //  priority:"high",
      "android": {
        "priority": "HIGH",
        "notification": {
          "sound": "default",
        }
      },
    }
    try {
      const response = await admin.messaging().send(message)
      console.log("Notification sent successfully:", response);
    } catch (error) {
      console.log("Notification sent failed:", error.message);
    };
  }
)



exports.sendEmail = onCall(
  {
    region: 'asia-southeast2',  // 👈 Specify the region here
  },
  async (request) => {
    const { to, subject, html } = request.data;
    // const name = request.data.name;
    // if (!name) {
    //   throw new HttpsError("invalid-argument", "The function must be called with a 'name' argument.");
    // }
    // return {
    //   message: `Hello, ${name}!`,
    // };

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'grahamcowan@dobbywalla.com',
        pass: 'zazkytvukydxxtjk'

      },
    }); //end transporter

    const mailOptions = {
      // from: 'trythis@dobbywalla.com',
      from: 'DoNotReply@dobbywalla.com',
      to: to,
      subject: subject,
      html: html,

    }; //end mailOptions

    // send mail with defined transport object
    // return transporter.sendMail(mailOptions).catch((err)=>{
    //       console.log(err);
    //   });
    try {
      // 
      await transporter.sendMail(mailOptions)
      return ""
    }
    catch (error) {
      throw new HttpsError('internal', error.message)
    }


  }
)






