const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.updateProximity = functions.firestore.document('users/{userId}').onWrite((event) => {
  const newValue = event.data.data();
  const previousValue = event.data.previous.data();
  // const proximity = newValue.proximity;
  console.log('newValue', newValue);
  console.log('previousValue', previousValue);
});
