const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.updateProximity = functions.firestore.document('users/{userId}').onWrite((event) => {
  const newValue = event.data.data();
  const previousValue = event.data.previous.data();
  const proximity = newValue.proximity[0];
  const token = newValue.token;
  console.log('newValue', newValue);
  console.log('previousValue', previousValue);

  const payload = {
    notification: {
      title: 'テスト',
      body: 'push通知のテストです。',
      badge: '1',
      sound: 'default',
      content_available: 'true',
    }
  };

  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24
  };

  if (proximity !== 'immediate') return false;
  return admin.messaging().sendToDevice(token, payload, options).then((response) => {
      return console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      return console.log("Error sending message:", error);
    });
});
