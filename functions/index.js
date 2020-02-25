const functions = require('firebase-functions');
const admin=require('firebase-admin');
admin.initializeApp(functions.config().firebase);

var newChat;
const nodemailer = require('nodemailer');
admin.initializeApp(functions.config().firebase);


//admin.initializeApp();
require('dotenv').config()

const {SENDER_EMAIL, SENDER_PASS}= process.env;

exports.sendEmailNotification=functions.https.onRequest((req, res)=>{	
	let authData = nodemailer.createTransport({
		host:'smtp.gmail.com',
		port:587,
		secure: false,
		auth: {
		  user: SENDER_EMAIL, 
		  pass: SENDER_PASS 
		}
		
		
});

	const ref = admin.firestore().collection('providers');
			ref.get().then((result) => {			
			  result.forEach(doc => {
				email = doc.get('email');
				console.log(email);
				authData.sendMail({
					from: 'imatternotification@gmail.com',
					to: email, // list of receivers
					subject: "Imatter InfoDesk", // Subject line
					text: "There is a new question on the InfoDesk!", // plain text body
					html: "<b>There is a new question on the InfoDesk!</b>" // html body
				}).then(res=>console.log('successfully sent that mail')).catch(err=>console.log(err));
			  });
			  //if the res.send is the same each time, for some reason it stops working? Added random number so its different each send.
			  var number = Math.random();
			  res.send("Emails have been sent" + number);
			  return null;
			}).catch(reason => {
			
			res.send(email)
		})


});

exports.sendRecoveryEmail=functions.firestore.document('recovery_email/{docID}').onCreate((snap,context)=>{	
	const data=snap.data();
	let authData = nodemailer.createTransport({
		host:'smtp.gmail.com',
		port:587,
		secure: false,
		auth: {
		  user: SENDER_EMAIL, 
		  pass: SENDER_PASS
		}
		
		
});

	authData.sendMail({
		from: 'imatternotification@gmail.com',
		to: data.email, // list of receivers
		subject: "Imatter InfoDesk", // Subject line
		text: "Here is your recovery code: " + data.code, // plain text body
		html: "Here is your recovery code: " + data.code // html body
		//res.send("sent");
		}).then(res=>console.log('successfully sent that mail')).catch(err=>console.log(err));
	});


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