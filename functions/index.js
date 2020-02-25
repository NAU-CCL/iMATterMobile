const functions = require('firebase-functions');
const admin=require('firebase-admin');
admin.initializeApp(functions.config().firebase);

var newChat;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendChatNotfication =
    functions.firestore.document('chats/{chatID}').onCreate(async (snap, context) => {
            const newChat = snap.data();
            const payload = {
                notification: {
                    title: 'iMATter Chat Room',
                    body: 'There is a new message in the chat room',
                    sound: "default"
                },
            };

            const ref = admin.firestore().collection('users').where('cohort', '==', newChat.cohort);
            ref.get().then((result) => {
                result.forEach(doc => {
                    if(doc.get('chatNotif') === true && newChat.userID !== doc.get('code')) {
                        token = doc.get('token');

                        admin.messaging().sendToDevice(token, payload)
                            .then((response) => {
                                console.log('worked');
                                return payload;
                            }).catch((err) => {
                            console.log(err);
                        });
                    }
                });
                return token;
            }).catch(error => {console.log('error', error)});
        });
