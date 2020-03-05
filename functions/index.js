const functions = require('firebase-functions');
const admin=require('firebase-admin');

var newChat;
const nodemailer = require('nodemailer');
admin.initializeApp(functions.config().firebase);


//admin.initializeApp();
require('dotenv').config();

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


exports.updateDays=functions.https.onRequest((req, res)=>{	
	
	//const increment = admin.firestore().FieldValue.increment(1);
	const ref = admin.firestore().collection('users');
			ref.get().then((result) => {			
			  result.forEach(doc => {
				  docID = doc.get('code');
				var currentUser = admin.firestore().collection('users').doc(docID);
				var new_days = doc.data().daysAUser + 1;
				var sinceLogin = doc.data().daysSinceLogin + 1;
				//doc.update({ "daysAUser": new_days});
				currentUser.update({
					daysAUser: new_days
				});
				
				currentUser.update({
					daysSinceLogin: sinceLogin
				});
				
			  
			});
			//if the res.send is the same each time, for some reason it stops working? Added random number so its different each send.
			  var number = Math.random();
			  res.send("days have been updated" + number);

			return null;
			}).catch(err => {
			
			res.send("failed: " +err)
			});
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
								console.log('entered', err);
							});
						}
                });
                return token;
            }).catch(error => {console.log('did not enter', error)});
        });


exports.deleteOldChatMessages=functions.https.onRequest((req, res)=> {
	const now = new Date();
	console.log('now', now);

	admin.firestore().collection('mobileSettings').doc('chatHours').get().then(function(doc) {
		let setHours = Number(doc.get('hours'));
		console.log('setHours', setHours);
		setHours = setHours * 60 * 60 * 1000;
		console.log('setHours', setHours);

		const ref = admin.firestore().collection('chats');
		ref.get().then((result) => {
			let batch = admin.firestore().batch();
			result.forEach(doc => {
				const timestamp = new Date(doc.get('timestamp').toDate());
				console.log('timestamp', timestamp);
				const difference = now.getTime() - timestamp.getTime();
				console.log('difference', difference);
				console.log('setHours', setHours);

				if(difference >= setHours) {
					batch.delete(doc.ref);
				}

			});
			batch.commit();
			return setHours;
		}).catch(error => {console.log('did not check', error)});
		return setHours;
	}).catch(error => {console.log('failed', error)});
});
		
//https://firebase.google.com/docs/functions/http-events
//Iterate through learning modules and grab all the weeks of visibility from all learning modules
//Then, iterate through users and see if their weeks pregnant is in the visibilty array
//If yes, check that they're 0 daysPregnant
//If yes and they have LM notifs turned on, then send them a notification
exports.newLearningModuleNotification = functions.https.onRequest((req, res) => {
    
	var visibilityWeekList = [];
	const learningMods = admin.firestore().collection('learningModules');
	const users = admin.firestore().collection('users');
	var userWeeksPregnant;
	var userDaysPregnant;
	var userNotifToken;
  
	const payload = {
	  notification: {
		  title: 'iMATter Learning Module',
		  body: 'There is a new learning module in the learning center!',
		  sound: "default"
	  },
  };
  
	var moduleVisibiltyTimeList;
	//Iterating through learning modules and grabbing weeks of visibility
	learningMods.get().then((value) => {
	  value.forEach(singleMod => {
		moduleVisibiltyTimeList = singleMod.get("moduleVisibilityTime");
		moduleVisibiltyTimeList.forEach(week => {
			//need to convert week to Number because it's a string
		  visibilityWeekList.push(Number(week));
		});
	  });
	});
  
	//Iterating through users and checking for weeks & days pregnant
	users.get().then((element) => {
	  element.forEach(singleUser => {
		userWeeksPregnant = singleUser.get('weeksPregnant');
		  //if the weeks is in the learning mod list
		  if (visibilityWeekList.includes(userWeeksPregnant))
		  {
			userDaysPregnant = singleUser.get('daysPregnant'); 
			  //They're in a new week, meaning new learning module shows up
			  //And they have learning module notifications turned on
			  if (userDaysPregnant === 0 && singleUser.get('learningModNotif') === true)
			  {
				userNotifToken = singleUser.get('token');
				
				admin.messaging().sendToDevice(userNotifToken, payload)
					.then((response) => {
					console.log("New learning module notification sent successfully!");
					return payload;
					}).catch((err) => {
						console.log(err);
				});
			  }
			}
		});
		return userNotifToken;
	  }).catch(error => {console.log('error', error)});
	});

exports.newSurveyNotification = functions.https.onRequest((req, res) => {
	const surveys = admin.firestore().collection('surveys');

});