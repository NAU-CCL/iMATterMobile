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

/**
 * Specifically for sending emotion survey notifications
 * Triggered whenever user's profile changes, and checks to see if it was their mood that changed
 */
exports.emotionSurveyNotification = functions.firestore.document('users/{userID}').onUpdate((change, context) => {
	const newValue = change.after.data();
	const previousValue = change.before.data();
	const surveys = admin.firestore().collection('surveys');
	var surveyType;
	var emotionType;
	var userNotifToken;

	const payload = {
		notification: {
			title: 'iMATter Survey',
			body: 'There is a new survey available!',
			sound: "default"
		},
	};

	//If the user's mood has changed
	if (newValue.mood !== previousValue.mood)
	{
		surveys.get().then((value) => {
			value.forEach(singleSurvey => {
				surveyType = singleSurvey.get("type");
				if (surveyType == "Emotion")
				{
					//The type of emotion this survey is for
					emotionType = singleSurvey.get("emotionChosen");
					//If this user's emotion matches survey's emotion type and their survey notifs are on
					if (newValue.mood == emotionType && newValue.surveyNotif == true)
					{
						userNotifToken = newValue.token;
						admin.messaging().sendToDevice(userNotifToken, payload)
							.then((response) => {
								console.log("New survey notification sent successfully!");
								return payload;
							}).catch((err) => {
								console.log(err);
							});

					}
				}
			});
		});
		//for the sake of needing to return something
		return true;
	}

	return false;
});

/**
 * Used for checking surveys that aren't emotion surveys
 * Iterates through all surveys and within each survey iterates through all users to see if they match criteria
 */
exports.newSurveyNotification = functions.https.onRequest((req, res) => {
	console.log(req);
	console.log(res);

	const surveys = admin.firestore().collection('surveys');
	const users = admin.firestore().collection('users');
	var surveyType;
	var userNotifToken;
	var surveyVisibility = [''];
	var userCode;
	var storedSurveyVisibility

	const payload = {
		notification: {
			title: 'iMATter Survey',
			body: 'There is a new survey available!',
			sound: "default"
		},
	};

	surveys.get().then((value) => {
		value.forEach(singleSurvey => {

			surveyType = singleSurvey.get("type");
			storedSurveyVisibility = singleSurvey.get("userVisibility");

			if (surveyType == "After Joining")
			{
				var afterJoiningDaysArray = singleSurvey.get("daysTillRelease").split(/(?:,| )+/);
				var expirationDays = singleSurvey.get("daysTillExpire");

				//iterate through users
				users.get().then((element) => {
					element.forEach(singleUser => {

						var daysSinceJoined = singleUser.get("daysSinceJoined");
						userCode = singleUser.get("code");

						for(var index in afterJoiningDaysArray){
							if(daysSinceJoined >= parseInt(afterJoiningDaysArray[index]) && 
								daysSinceJoined < parseInt(afterJoiningDaysArray[index]) + expirationDays)
							{
								surveyVisibility.push(userCode);

								if (!storedSurveyVisibility.includes(userCode) && singleUser.get("surveyNotif") == true)
								{
									userNotifToken = singleUser.get("token");
									admin.messaging().sendToDevice(userNotifToken, payload)
										.then((response) => {
											console.log("New survey notification sent successfully!");
											return payload;
									}).catch((err) => {
										console.log(err);
									});
								}
							}
						  }
					});
				});

			}
			else if (surveyType == "Due Date")
			{
				var dueDateDaysArray = singleSurvey.get("daysBeforeDueDate").split(/(?:,| )+/);
				var expirationDays = singleSurvey.get("daysTillExpire");

				var currentDate = new Date();
				var dateString = currentDate.getMonth() + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
				var now = new Date(dateString);
				
				//iterate through users
				users.get().then((element) => {
					element.forEach(singleUser => {

						this.dueDate = singleUser.get("dueDate").toString().split('-');
						var dateDue = new Date(this.dueDate[1] + "/" + this.dueDate[2] + "/" + this.dueDate[0]);
						var timeBeforeDue =  dateDue.getTime() - now.getTime();
						var daysBeforeDue = timeBeforeDue / (1000 * 3600 * 24);

						for(var index in dueDateDaysArray)
						{
							if(daysBeforeDue <= parseInt(dueDateDaysArray[index]) && 
								daysBeforeDue > parseInt(dueDateDaysArray[index]) - expirationDays)
							{
								surveyVisibility.push(singleUser.get("code"));
								if (!storedSurveyVisibility.includes(userCode) && singleUser.get("surveyNotif") == true)
								{
									userNotifToken = singleUser.get("token");
									admin.messaging().sendToDevice(userNotifToken, payload)
										.then((response) => {
											console.log("New survey notification sent successfully!");
											return payload;
									}).catch((err) => {
										console.log(err);
									});
								}
							}
						}
					});
				});

			}
			else if (surveyType == "Inactive")
			{
				var daysSinceLogin;
				var surveyDaysInactive = singleSurvey.get("daysInactive");

				//iterate through users
				users.get().then((element) => {
					element.forEach(singleUser => {
						daysSinceLogin = singleUser.get("daysSinceLogin");
						if (daysSinceLogin >= surveyDaysInactive)
						{
							surveyVisibility.push(singleUser.get("code"));
							if (!storedSurveyVisibility.includes(userCode) && singleUser.get("surveyNotif") == true)
							{
								userNotifToken = singleUser.get("token");
								admin.messaging().sendToDevice(userNotifToken, payload)
									.then((response) => {
										console.log("New survey notification sent successfully!");
										return payload;
								}).catch((err) => {
									console.log(err);
								});
							}
						}
					});
				});
			}

			//admin.firestore().collection('surveys').doc(singleSurvey.id).
			surveys.doc(singleSurvey.id).update({
				userVisibility: surveyVisibility
			})
		});
	});

});


