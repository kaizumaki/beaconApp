const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.updateProximity = functions.firestore.document('users/{userId}').onWrite((event) => {
  const newValue = event.data.data();
  const previousValue = event.data.previous.data();
  const proximity = newValue.proximity;
  const token = newValue.token;
  console.log('newValue', newValue);
  console.log('previousValue', previousValue);

  const payload = {
    notification: {
      title: 'テスト',
      body: 'push通知のテストです。',
      badge: '1',
      sound: 'default',
    },
    priority: 'high',
  };
  if (proximity !== 'ccccc') return false;
  return admin.messaging().sendToDevice(token, payload);
});
