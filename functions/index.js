const functions = require('firebase-functions');
const admin = require('firebase-admin');

var newChat;
const nodemailer = require('nodemailer');
admin.initializeApp(functions.config().firebase);

// Tried uncommenting this line to get firebase push notif authentication error to go away.
//admin.initializeApp();
require('dotenv').config();

const {
    SENDER_EMAIL,
    SENDER_PASS
} = process.env;

exports.sendEmailNotification = functions.https.onRequest((req, res) => {
    let authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
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
                subject: "iMATter InfoDesk", // Subject line
                text: "There is a new question in the InfoDesk!", // plain text body
                html: "<b>There is a new question in the InfoDesk!</b>" // html body
            }).then(res => console.log('successfully sent that mail')).catch(err => console.log(err));
        });
        //if the res.send is the same each time, for some reason it stops working? Added random number so its different each send.
        var number = Math.random();
        res.send("Emails have been sent" + number);
        return null;
    }).catch(reason => {

        res.send(email)
    })


});

exports.sendRecoveryEmail = functions.firestore.document('recoveryEmail/{docID}').onCreate((snap, context) => {
    const data = snap.data();
    let authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASS
        }


    });

    authData.sendMail({
        from: 'imatternotification@gmail.com',
        to: data.email, // list of receivers
        subject: "iMATter InfoDesk", // Subject line
        text: "Here is your recovery code: " + data.code, // plain text body
        html: "Here is your recovery code: " + data.code // html body
        //res.send("sent");
    }).then(res => console.log('successfully sent that mail')).catch(err => console.log(err));
});

// This function invoked when the userPointsRedeem table receives a new document.
exports.sendGCRequestEmail = functions.firestore.document('usersPointsRedeem/{docID}').onCreate((snap, context) => {
    const data = snap.data();

    let authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASS
        }
    });

    email = data.adminEmail;
    console.log(email);
    authData.sendMail({
        from: 'imatternotification@gmail.com',
        to: email, // admin set receiver
        subject: "iMATter Gift Card Request", // Subject line
        text: "There is a new request for a gift card.", // plain text body
        html: "User " + data.username + " with the email: " + data.email + " has redeemed points for a(n) " + data.gcType +
            "gift card." // html body
    }).then(res => console.log('successfully sent that mail')).catch(err => console.log(err));

});

/**
 * Updates the following fields for a user:
 * Days a user, totalDaysPregnant, daysPregnant, daysSinceLogin, and weeksPregnant
 */
exports.updateDays = functions.https.onRequest((req, res) => {

    const ref = admin.firestore().collection('users');
    ref.get().then((result) => {
        result.forEach(doc => {

            const docID = doc.get('code');

            var currentUser = admin.firestore().collection('users').doc(docID);

            //user hasn't signed up yet, skip them
            if (doc.get('codeEntered') === false) {
                return;
            }

            var username = doc.get('username');

            //Update daysAUser and daysSinceLogin
            var new_days = doc.data().daysAUser + 1;
            var sinceLogin = doc.data().daysSinceLogin + 1;

            // update challenge days
            // update challenge days
            let updateJoinedChallenges = doc.data().joinedChallenges;

            for (let challenge of updateJoinedChallenges) {
                if (challenge.dayComplete === true) {
                    challenge.currentDay = challenge.currentDay + 1;
                    challenge.dayComplete = false;

                    if (challenge.currentDay > challenge.challenge.length) {
                        challenge.dateFinished = new Date();
                        updateJoinedChallenges.splice(updateJoinedChallenges.indexOf(challenge), 1)
                    }
                }
            }

            currentUser.update({
                daysAUser: new_days
            });

            currentUser.update({
                daysSinceLogin: sinceLogin
            });

            currentUser.update({
                joinedChallenges: updateJoinedChallenges
            });

        });

        //if the res.send is the same each time, for some reason it stops working? Added random number so its different each send.
        var number = Math.random();
        res.send("days have been updated" + number);

        return null;
    }).catch(err => {

        res.send("failed: " + err)
    });

    

});

exports.sendInfoDeskNotification =
    functions.firestore.document('questions/{questionID}').onCreate(async (snap, context) => {
        console.log('entered the function');
        const newPost = snap.data();
        const payload = {
            notification: {
                title: 'iMATter Information Desk',
                body: 'There is a new post in the InformationDesk',
                sound: "default"
            },
        };

        const ref = admin.firestore().collection('users');
        ref.get().then((result) => {
            result.forEach(doc => {
                if (doc.get('infoDeskNotif') === true) {
                    if (newPost.userID !== doc.get('code'))
                        token = doc.get('token');
                    admin.messaging().sendToDevice(token, payload)
                        .then((response) => {
                            console.log('sent notification');
                            return payload;
                        }).catch((err) => {
                            console.log('entered doc, but did not send', err);
                        });
                }
            });
            return 'true';
        }).catch(error => {
            console.log('did not send', error)
        });
        return 'true';
    });

exports.sendChatNotifications =
    functions.firestore.document('chats/{chatID}').onCreate(async (snap, context) => {
        const newChat = snap.data();
        const payload = {
            notification: {
                title: 'iMATter Chat Room',
                body: 'There is a new message in the chat room',
                sound: "default"
            },
        };

        console.log(newChat.cohort);


        const ref = admin.firestore().collection('users');
        return ref.get().then(async (result) => {
            // iterate through the list of entire list of users.
            result.forEach(async (doc) => {
                {
                    // Avoid getting entire document as object and printing it as this uses up quite a bit of processing power for no good reason.
                    //let userDocument = doc.data();
                    //console.log(`Sending Chat notif: User doc object is ${JSON.stringify(userDocument)}`)

                    // If the user is already in the chat, do not send them a push notification.
                    if ( doc.get('isInChat')) {
                        console.log(`Not sending chat to user ${doc.get('username')} they are already in chat.`);
                        // return nothing to skip sending a notification to this user.
                        return;
                    }

                    userNotifToken = doc.get('token');

                    if (userNotifToken === '') {
                        console.log(`User notification token is ''`);
                        return;
                    }
                    // Only send the message if the current user has notifications on, and the user id of 
                    // the chat is not the userid of the current user( dont notify the person who sent the message )
                    if (doc.get('chatNotif') === true && newChat.userID !== doc.get('code')) {
                        token = doc.get('token');
                        await admin.messaging().sendToDevice(token, payload)
                            .then(async (response) => {
                                // In firebase console this will usually print undefined as this is an async operation, add await to this line to ensure firebase logs
                                // the users name correctly, not needed though.
                                console.log(`sent notification to user with name: ${doc.get('name')} and code ${doc.get('code')}`);
                                return payload;
                            }).catch((err) => {
                                console.log('entered doc, but did not send', err);
                            });
                    }
                }
            });
        }).catch(error => {
            console.log('DID NOT send', error)
        });
        
    
    });


//works for BOTH administrators and provideres
exports.sendProviderRecoveryEmail = functions.firestore.document('provider_recovery_email/{docID}').onCreate((snap, context) => {
    const data = snap.data();
    let authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
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
    }).then(res => console.log('successfully sent that mail')).catch(err => console.log(err));
});

// Does not seem to be used
// The webapp has a similar function that is actually used and is scheduled to run at certain times.
// At time of writing, this funciton is disabled, but to adjust scheduled functions go to
// https://console.cloud.google.com/cloudscheduler?project=imatter-nau
exports.deleteOldChatMessages = functions.https.onRequest((req, res) => {
    const today = new Date();
    const ref = admin.firestore().collection('chats');
    ref.get().then((result) => {
        let batch = admin.firestore().batch();
        result.forEach(doc => {
            if (doc.get('visibility') === false) {
                batch.delete(doc.ref);
            }
            const dateSent = toDate(doc.get('timestamp'));
            if (today > dateSent.addDays(0.5)) {
                batch.delete(doc.ref);
            }
        });
        batch.commit();
        return 'finished';
    }).catch(error => {
        console.log('did not check', error)
    });
    return 'worked';
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
            if (moduleActive == false) {
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
                    if (userDaysPregnant == null) {
                        //return as as "continue" in forEach loop
                        return;
                    }

                    userCode = singleUser.get("code");
                    userNotifToken = singleUser.get("token");

                    if (userNotifToken == '') {
                        return;
                    }

                    //for each week in the module visibility list
                    moduleVisibility.forEach(week => {

                        //if module is to always be displayed
                        if (week == 0) {
                            lmUserVisibility.push(userCode);

                            //if user hasn't yet been notified and user's notifications are turned on, send push notif
                            //Covers case where new module is added
                            if ((!storedLMUserVisibility.includes(userCode)) && singleUser.get("learningModNotif") == true) {
                                currentUser = admin.firestore().collection('users').doc(userCode);
                                currentUser.update({
                                    recentNotifications: admin.firestore.FieldValue.arrayUnion(
                                        "There is a new learning module available!" + "," + learningModule.id
                                    )
                                });

                                admin.messaging().sendToDevice(userNotifToken, payload)
                                    .then((response) => {
                                        console.log("New learning module notification sent successfully to " + singleUser.get("username"));
                                        return payload;
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                            }
                        } else {
                            var daysStart = 7 * week; //number of days pregnant this module would start at

                            //if the module is never supposed to expire
                            if (moduleExpiration == 0) {
                                var daysEnd = daysStart + 100000; //add a large number of days (274 years)
                            } else {
                                var daysEnd = daysStart + moduleExpiration; //number of days pregnant this module would end
                            }

                            //If user is within the days this LM should be visible to them
                            if (userDaysPregnant >= daysStart && userDaysPregnant <= daysEnd) {
                                //to cover the case where intervals of visibility possibly overlap
                                //prevent user code from being pushed more than once
                                if (!lmUserVisibility.includes(userCode)) {
                                    lmUserVisibility.push(userCode);
                                }

                                //if user hasn't yet been notified and user's notifications are turned on, send push notif
                                if ((!storedLMUserVisibility.includes(userCode)) && singleUser.get("learningModNotif") == true) {
                                    currentUser = admin.firestore().collection('users').doc(userCode);
                                    currentUser.update({
                                        recentNotifications: admin.firestore.FieldValue.arrayUnion(
                                            "There is a new learning module available!" + "," + learningModule.id
                                        )
                                    });

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
                //IMPORTANT: update the previousUserVisibility and userVisibility array
                learningModules.doc(learningModule.id).update({
                    previousUserVisibility: storedLMUserVisibility
                });
                learningModules.doc(learningModule.id).update({
                    userVisibility: lmUserVisibility
                });
            });
        });
    }).then(() => {
        res.send("finished");
    });
});

/**
 * Specifically for sending emotion survey notifications
 * Triggered whenever user's profile changes, and checks to see if it was their mood that changed
 * 
 * JUNE 29 2022 COMMENTING THIS METHOD OUT SINCE WE ARE TEMPORARILY DISBANDING EMOTION TRIGGERED SURVEYS. WILL REIMPLEMENT IN THE FUTURE.
 */
/*
exports.emotionSurveyNotification = functions.firestore.document('users/{userID}').onUpdate((change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const surveys = admin.firestore().collection('surveys');
    var surveyType;
    var emotionType;
    var userNotifToken;
    var userCode;
    var notifMessage;
    var recent = [];

    const payload = {
        notification: {
            title: 'iMATter Survey',
            body: 'There is a new survey available!',
            sound: "default"
        },
    };

    //If the user's mood has changed
    if (newValue.mood !== previousValue.mood) {
        surveys.get().then((value) => {
            value.forEach(singleSurvey => {
                surveyType = singleSurvey.get("type");
                if (surveyType == "Emotion") {
                    //The type of emotion this survey is for
                    emotionType = singleSurvey.get("emotionChosen");
                    //If this user's emotion matches survey's emotion type and their survey notifs are on
                    if (newValue.mood == emotionType && newValue.surveyNotif == true) {
                        userCode = newValue.code;
                        currentUser = admin.firestore().collection('users').doc(userCode);

                        currentUser.update({
                            recentNotifications: admin.firestore.FieldValue.arrayUnion(
                                "There is a new survey available" + "," + singleSurvey.id
                            )
                        });

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

*/

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

            if (surveyType == "After Joining") {
                //iterate through users
                users.get().then((element) => {
                    var afterJoiningDaysArray = singleSurvey.get("daysTillRelease").split(/(?:,| )+/);
                    var expirationDays = singleSurvey.get("daysTillExpire");

                    element.forEach(singleUser => {
                        var daysSinceJoined = singleUser.get("daysAUser");

                        //Checks that this value is valid/exists
                        //covers the case where a user account exists with a code but hasn't been filled out yet
                        if (daysSinceJoined == null) {
                            //in a forEach loop, return acts as "continue"
                            return;
                        }

                        userCode = singleUser.get("code");

                        afterJoiningDaysArray.forEach(dayValue => {
                            if (daysSinceJoined >= parseInt(dayValue) &&
                                daysSinceJoined <= parseInt(dayValue) + expirationDays) {
                                surveyVisibility.push(userCode);

                                //If this user was not already in the user visibility array (meaning that a notif hasn't been sent yet)
                                //and their notifications are on, send them the notif
                                if ((!storedSurveyVisibility.includes(userCode)) && singleUser.get("surveyNotif") == true) {
                                    currentUser = admin.firestore().collection('users').doc(userCode);
                                    currentUser.update({
                                        recentNotifications: admin.firestore.FieldValue.arrayUnion(
                                            "There is a new survey available" + "," + singleSurvey.id
                                        )
                                    });
                                    userNotifToken = singleUser.get("token");

                                    if (userNotifToken == '') {
                                        return;
                                    }

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
                    surveys.doc(singleSurvey.id).update({
                        userVisibility: surveyVisibility
                    });
                });
            } else if (surveyType == "Due Date") {
                var dueDateDaysArray = singleSurvey.get("daysBeforeDueDate").split(/(?:,| )+/);
                var expirationDays = singleSurvey.get("daysTillExpire");
                var currentDate = new Date();

                //iterate through users
                users.get().then((element) => {
                    element.forEach(singleUser => {

                        var userDueDate = singleUser.get("dueDate");

                        //Check that this value is valid/exists
                        if (userDueDate == null) {
                            //in a forEach loop, return acts as "continue"
                            return;
                        }
                        userDueDate = userDueDate.toString().split('-');
                        var dateDue = new Date(userDueDate[1] + "/" + userDueDate[2] + "/" + userDueDate[0]);
                        var timeBeforeDue = dateDue.getTime() - currentDate.getTime();
                        var daysBeforeDue = timeBeforeDue / (1000 * 3600 * 24);

                        for (var index in dueDateDaysArray) {
                            if (daysBeforeDue <= parseInt(dueDateDaysArray[index]) &&
                                daysBeforeDue >= parseInt(dueDateDaysArray[index]) - expirationDays) {
                                surveyVisibility.push(singleUser.get("code"));

                                if ((!storedSurveyVisibility.includes(userCode)) && singleUser.get("surveyNotif") == true) {

                                    userNotifToken = singleUser.get("token");

                                    currentUser = admin.firestore().collection('users').doc(userCode);
                                    currentUser.update({
                                        recentNotifications: admin.firestore.FieldValue.arrayUnion(
                                            "There is a new survey available" + "," + singleSurvey.id
                                        )
                                    });

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
                    surveys.doc(singleSurvey.id).update({
                        userVisibility: surveyVisibility
                    });
                });
            } else if (surveyType == "Inactive") {
                var daysSinceLogin;
                var surveyDaysInactive = singleSurvey.get("daysInactive");

                //iterate through users
                users.get().then((element) => {
                    element.forEach(singleUser => {
                        daysSinceLogin = singleUser.get("daysSinceLogin");

                        //Check that this value is valid/exists
                        if (daysSinceLogin == null) {
                            //in a forEach loop, return acts as "continue"
                            return;
                        }

                        if (daysSinceLogin >= surveyDaysInactive) {
                            surveyVisibility.push(singleUser.get("code"));

                            if ((!storedSurveyVisibility.includes(userCode)) && singleUser.get("surveyNotif") == true) {
                                currentUser = admin.firestore().collection('users').doc(userCode);
                                currentUser.update({
                                    recentNotifications: admin.firestore.FieldValue.arrayUnion(
                                        "There is a new survey available" + "," + singleSurvey.id
                                    )
                                });

                                userNotifToken = singleUser.get("token");
                                if (userNotifToken == '') {
                                    return;
                                }
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
                    surveys.doc(singleSurvey.id).update({
                        userVisibility: surveyVisibility
                    });
                });
            }
        });
    }).then(() => {
        res.send("finished");
    });
});

// This function invoked when the reports collection has a new document added to it.
exports.sendProblemReportedEmail = functions.firestore.document('reports/{docID}').onCreate(async (snap, context) => {
    
        console.log(`Getting current admin emails`);
    
        // Remember, querying firestore in node.js is different than in typescript.
         let adminEmailArray = await admin.firestore().collection('settings').doc('adminSettings').get().then( (docSnap) => {
            let adminSettings = docSnap.data();
      
            let currentAdminEmails = adminSettings.adminEmails;
      
            console.log(`Current admin emails array in send problem report email ${currentAdminEmails}`);
      
            return currentAdminEmails;
          });
    
        console.log(`Got current admin emails`);
    
        // Get an object representing the document that was just created in the reports table.
        const data = snap.data();
    
        let authData = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_PASS
            }
        });
    
        authData.sendMail({
            from: 'imatternotification@gmail.com',
            to: adminEmailArray, // admin set receiver
            subject: "iMATter: New Problem Reported", // Subject line
            text: "There has been a new problem reported.", // plain text body
            html: `<div style="border:2px solid black; padding:15px; border-radius: 10px;">
                        <h2>Problem Title: ${data.title}</h2>
                        <h2>Submitted by: ${data.username}</h2>
                        <div style="margin-left: auto; margin-right: auto; margin-top: 10px; width: 80%; padding: 20px;">
                            <h3 style="text-decoration: underline; width: fit-content; margin-left: auto; margin-right: auto;"> Problem Description </h3>
                            <span> ${data.description}</span>
                        </div>
                   </div>` 
        }).then(res => console.log('Successfully sent that feedback/problem mail')).catch(err => console.log(`Error sending that feedback/problem email: ${err}`));
    
     });

exports.updateCompletedSurveys = functions.https.onRequest((request, response) => {
    console.log('Query Params: ', request.query);

    return response.send(200, { message: 'ok' });
    
});