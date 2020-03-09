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
/**
 * Iterate through learning modules and get the times of visibility for active LMs
 * Convert the times of visibility to a range of days pregnant
 * Iterate through users, checking if they're within the range of days pregnant for a learning module
 * If they are and haven't yet been notified/added to userVisibility array, send push notif and add them
 */
exports.newLearningModuleNotification = functions.https.onRequest((req, res) => {
	
	const learningModules = admin.firestore().collection('learningModules');
	const users = admin.firestore().collection('users');
	var userNotifToken;
	var userCode;

	const payload = {
		notification: {
			title: 'iMATter Learning Module',
			body: 'There is a new learning module available!',
			sound: "default"
		},
	};

	learningModules.get().then((value) => {
		value.forEach(learningModule => {
			
			var moduleActive = learningModule.get("moduleActive");
			//Skip over this module if it's not active
			if (moduleActive == false)
			{
				return; //return acts as "continue" in forEach loop
			}

			var lmUserVisibility = []; //reset this for each learningModule
			var storedLMUserVisibility = learningModule.get("userVisibility");
			//overdoing the splitting but does the job
			var moduleVisibility = learningModule.get("moduleVisibilityTime").split(/(?:,| )+/);
			var moduleExpiration = learningModule.get("moduleExpiration");

			//iterate through users
			users.get().then((element) => {
				element.forEach(singleUser => {
					var userDaysPregnant = singleUser.get("totalDaysPregnant");

					//Check to see this value exists/is valid
					if (userDaysPregnant == null)
					{
						//return as as "continue" in forEach loop
						return;
					}

					userCode = singleUser.get("code");
					userNotifToken = singleUser.get("token");

					//for each week in the module visibility list
					moduleVisibility.forEach(week => {

						//if module is to always be displayed
						if (week == 0)
						{
							lmUserVisibility.push(userCode);

							//if user hasn't yet been notified and user's notifications are turned on, send push notif
							//Covers case where new module is added
							if ((!storedLMUserVisibility.includes(userCode)) && singleUser.get("learningModNotif") == true)
							{
								admin.messaging().sendToDevice(userNotifToken, payload)
									.then((response) => {
										console.log("New learning module notification sent successfully to " + singleUser.get("username"));
									return payload;
									}).catch((err) => {
										console.log(err);
								});
							}
						}
						else
						{
							var daysStart = 7 * week; //number of days pregnant this module would start at

							//if the module is never supposed to expire
							if (moduleExpiration == 0)
							{
								var daysEnd = daysStart + 100000; //add a large number of days (274 years)
							}
							else
							{
								var daysEnd = daysStart + moduleExpiration; //number of days pregnant this module would end
							}

							//If user is within the days this LM should be visible to them
							if (userDaysPregnant >= daysStart && userDaysPregnant <= daysEnd)
							{
								lmUserVisibility.push(userCode);

								//if user hasn't yet been notified and user's notifications are turned on, send push notif
								if ((!storedLMUserVisibility.includes(userCode)) && singleUser.get("learningModNotif") == true)
								{
									admin.messaging().sendToDevice(userNotifToken, payload)
										.then((response) => {
											console.log("New learning module notification sent successfully to " + singleUser.get("username"));
										return payload;
										}).catch((err) => {
											console.log(err);
									});
								}
							}
						}
					});
				});
				//IMPORTANT: update the userVisibility array
				learningModules.doc(learningModule.id).update({userVisibility: lmUserVisibility});
			});
		});
	});
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
 * Keeps track of who has been sent notifications before using the userVisibility array 
 * (this array also implies that anyone new added to it just had the survey become available to them)
 */
exports.newSurveyNotification = functions.https.onRequest((req, res) => {

	const surveys = admin.firestore().collection('surveys');
	const users = admin.firestore().collection('users');
	var surveyType;
	var userNotifToken;
	var userCode;

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
			var surveyVisibility = []; //reset this for each survey
			var storedSurveyVisibility = singleSurvey.get("userVisibility");

			if (surveyType == "After Joining")
			{
				//iterate through users
				users.get().then((element) => {
					var afterJoiningDaysArray = singleSurvey.get("daysTillRelease").split(/(?:,| )+/);
					var expirationDays = singleSurvey.get("daysTillExpire");

					element.forEach(singleUser => {
						var daysSinceJoined = singleUser.get("daysAUser");

						//Checks that this value is valid/exists
						//covers the case where a user account exists with a code but hasn't been filled out yet
						if (daysSinceJoined == null)
						{
							//in a forEach loop, return acts as "continue"
							return;
						}

						userCode = singleUser.get("code");

						afterJoiningDaysArray.forEach(dayValue => {
							if(daysSinceJoined >= parseInt(dayValue) && 
								daysSinceJoined < parseInt(dayValue) + expirationDays)
							{
								surveyVisibility.push(userCode);

								//If this user was not already in the user visibility array (meaning that a notif hasn't been sent yet)
								//and their notifications are on, send them the notif
								if ((!storedSurveyVisibility.includes(userCode)) && singleUser.get("surveyNotif") == true)
								{
									userNotifToken = singleUser.get("token");
									admin.messaging().sendToDevice(userNotifToken, payload)
										.then((response) => {
											console.log("New survey notification for After Joining sent successfully to " + singleUser.get("username"));
											return payload;
									}).catch((err) => {
										console.log(err);
									});
								}
							}
						});
					});
					//IMPORTANT: Update the userVisibility array for this survey
					surveys.doc(singleSurvey.id).update({userVisibility: surveyVisibility});
				});
			}
			else if (surveyType == "Due Date")
			{
				var dueDateDaysArray = singleSurvey.get("daysBeforeDueDate").split(/(?:,| )+/);
				var expirationDays = singleSurvey.get("daysTillExpire");
				var currentDate = new Date();

				//iterate through users
				users.get().then((element) => {
					element.forEach(singleUser => {

						var userDueDate = singleUser.get("dueDate");

						//Check that this value is valid/exists
						if (userDueDate == null)
						{
							//in a forEach loop, return acts as "continue"
							return;
						}
						userDueDate = userDueDate.toString().split('-');
						var dateDue = new Date(userDueDate[1] + "/" + userDueDate[2] + "/" + userDueDate[0]);
						var timeBeforeDue =  dateDue.getTime() - currentDate.getTime();
						var daysBeforeDue = timeBeforeDue / (1000 * 3600 * 24);

						for(var index in dueDateDaysArray)
						{
							if(daysBeforeDue <= parseInt(dueDateDaysArray[index]) && 
								daysBeforeDue > parseInt(dueDateDaysArray[index]) - expirationDays)
							{
								surveyVisibility.push(singleUser.get("code"));

								console.log("STORED SURVEY FOR DUE DATE");
								console.log(storedSurveyVisibility);
								console.log("USER " + singleUser.get("userCode") + " " + singleUser.get("username"));
								console.log((!storedSurveyVisibility.includes(userCode)));

								if ((!storedSurveyVisibility.includes(userCode)) && singleUser.get("surveyNotif") == true)
								{
									userNotifToken = singleUser.get("token");
									admin.messaging().sendToDevice(userNotifToken, payload)
										.then((response) => {
											console.log("New survey notification for Due Date sent successfully to " + singleUser.get("username"));
											return payload;
									}).catch((err) => {
										console.log(err);
									});
								}
							}
						}
					});
					//IMPORTANT: Update the userVisibility array for this survey
					surveys.doc(singleSurvey.id).update({userVisibility: surveyVisibility});
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

						//Check that this value is valid/exists
						if (daysSinceLogin == null)
						{
							//in a forEach loop, return acts as "continue"
							return;
						}

						if (daysSinceLogin >= surveyDaysInactive)
						{
							surveyVisibility.push(singleUser.get("code"));

							if ((!storedSurveyVisibility.includes(userCode)) && singleUser.get("surveyNotif") == true)
							{
								userNotifToken = singleUser.get("token");
								admin.messaging().sendToDevice(userNotifToken, payload)
									.then((response) => {
										console.log("New survey notification for Inactivity sent successfully to " + singleUser.get("username"));
										return payload;
								}).catch((err) => {
									console.log(err);
								});
							}
						}
					});
					//IMPORTANT: Update the userVisibility array for this survey
					surveys.doc(singleSurvey.id).update({userVisibility: surveyVisibility});
				});
			}
		});
	});
});