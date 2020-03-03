const functions = require('firebase-functions');
const admin=require('firebase-admin');
<<<<<<< HEAD
=======
admin.initializeApp(functions.config().firebase);

var newChat;
>>>>>>> master
const nodemailer = require('nodemailer');
admin.initializeApp(functions.config().firebase);


//admin.initializeApp();
require('dotenv').config()

<<<<<<< HEAD
const {SENDER_EMAIL, SENDER_PASSWORD}= process.env;
=======
const {SENDER_EMAIL, SENDER_PASS}= process.env;
>>>>>>> master

exports.sendEmailNotification=functions.https.onRequest((req, res)=>{	
	let authData = nodemailer.createTransport({
		host:'smtp.gmail.com',
		port:587,
		secure: false,
		auth: {
		  user: SENDER_EMAIL, 
<<<<<<< HEAD
		  pass: SENDER_PASSWORD 
=======
		  pass: SENDER_PASS 
>>>>>>> master
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
		
//https://firebase.google.com/docs/functions/http-events
//Once a day, iterate through learning modules and grab all the weeks of visibility from all LMS
//Then, iterate through users and see if their weeks pregnant is in the visibilty array
//If yes, check that they're 0 daysPregnant
//If yes, then send them a notification

exports.cronTest = functions.https.onRequest((req, res) => {
    
	var visibilityWeekList = [];
	const learningMods = admin.firestore().collection('learningModules');
	const users = admin.firestore().collection('users');
  
	const payload = {
	  notification: {
		  title: 'iMATter Learning Module',
		  body: 'There is a new learning module in the learning center!',
		  sound: "default"
	  },
  };
  
	var moduleVisibiltyTimeList;
  
	learningMods.get().then((value) => {
	  console.log("LEARNING MOD VALUE: ");
	  console.log(value);
	  value.forEach(singleMod => {
		console.log("SINGLE MOD:");
		console.log(singleMod);
		//singleMod['moduleVisibilityTime']; WILL COME BACK UNDEFINED
		moduleVisibiltyTimeList = singleMod.get("moduleVisibilityTime");
		console.log("TYPE OF MOD VIS TIME: " + typeof(moduleVisibiltyTimeList));
		console.log(moduleVisibiltyTimeList);
		moduleVisibiltyTimeList.forEach(week => {
		  console.log("LM WEEK: " + week);
		  visibilityWeekList.push(week);
		  console.log(visibilityWeekList);
		});
	  });
	});
  
	console.log("LEARNING MODULE LIST: " + visibilityWeekList);
  
	var userWeeksPregnant;
	var userDaysPregnant;
	var userNotifToken;
  
	users.get().then((element) => {
	  console.log("USERS ELEMENT: ");
	  console.log(element);
  
	  element.forEach(singleUser => {
		console.log("SINGLE USER: ");
		console.log(singleUser);
		userWeeksPregnant = singleUser.get('weeksPregnant');
		console.log("USER WEEKS PREGNANT: " + userWeeksPregnant);
  
		  //if the weeks is in the learning mod list
		  if (visibilityWeekList.includes(userWeeksPregnant))
		  {
			userDaysPregnant = singleUser.get('daysPregnant'); 
			console.log("USER DAYS PREGNANT: " + userDaysPregnant);
			  //They're in a new week, meaning new learning module shows up
			  if (userDaysPregnant == 0)
			  {
				userNotifToken = singleUser.get('token');
				//Send notification if they have notifications on
				if (userNotifToken)
				{
				  admin.messaging().sendToDevice(userNotifToken, payload).then((response) => {
					console.log("New learning module notification sent successfully!");
					return payload;
				  }).catch((err) => {
					console.log(err);
				  })
				}
			  }
			}
		});
	  });
	});
