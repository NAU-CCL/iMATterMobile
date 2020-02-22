const functions = require('firebase-functions');
const admin=require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp(functions.config().firebase);


//admin.initializeApp();
require('dotenv').config()

const {SENDER_EMAIL, SENDER_PASSWORD}= process.env;

exports.sendEmailNotification=functions.https.onRequest((req, res)=>{
	//var ref = admin.firestore().doc("providers/{docID}");
	//const data=ref.data();
	
	let authData = nodemailer.createTransport({
		host:'smtp.gmail.com',
		port:587,
		secure: false,
		auth: {
		  user: SENDER_EMAIL, 
		  pass: SENDER_PASSWORD 
		}
		
		
});
/*
ref = admin.firestore().collection('/providers/');
ref.where('code', '==', 3oYi4BQiDYOY6vDfpZsp )
            .get().then(snap => {
				var email = ref.email;
				
          /*if (snap.docs.length > 0) {
            const userRef = ref.where('code', '==', this.userProfileID);
            userRef.get().then((result) => {
              result.forEach(doc => {
                this.userType = 'provider';
                this.provider.username = doc.get('username');
                this.provider.bio = doc.get('bio');
                this.provider.profilePic = doc.get('profilePic');
              });
            });
          }
        }); */

//admin.firestore().doc('/providers/').once('value').then(function(snapshot) {
//var email = snapshot.val().email;

//});
var maillist = [
  'vml56@nau.edu',
  'toryleafgren@gmail.com',
];

/*var stuff = [];
var db = admin.firestore();
    db.collection("providers").get().then(snapshot => {
console.log("1");
        snapshot.forEach(doc => {
			console.log("2");
            var newelement = {
				
				"email": doc.data().email
				
            }
			console.log("5");
			console.log(email);
			res.send(email);
			console.log(email);
            stuff = stuff.concat(newelement);
        });
        //res.send(stuff)
		console.log("6");
		console.log(stuff);
        return "";
    }).catch(reason => {
		console.log(":/");
        res.send(reason)
    })*/

//console.log("1");
const ref = admin.firestore().collection('providers');
        ref.get().then((result) => {
			//console.log("2")
          result.forEach(doc => {
            email = doc.get('email');
			//console.log("4");
            console.log(email);
			authData.sendMail({
				//console.log(ref.email);
				from: 'imatternotification@gmail.com',
				to: email, // list of receivers
				subject: "Imatter InfoDesk", // Subject line
				text: "There is a new question on the InfoDesk!", // plain text body
				html: "<b>There is a new question on the InfoDesk!</b>" // html body
			}).then(res=>console.log('successfully sent that mail')).catch(err=>console.log(err));
	      });
		  //console.log("5");
		  res.send("Emails have been sent");
		  return null;
		}).catch(reason => {
		
        res.send(email)
    })


});


/*
function sendEmail(){
	let transporter = nodemailer.createTransport({
		host: "smtp.imatternotification@gmail.com",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
		  user: iMatter Notification, 
		  pass: WordPass1 
		}
	  });

	  // send mail with defined transport object
	  let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to: "bar@example.com, baz@example.com", // list of receivers
		subject: "Hello ✔", // Subject line
		text: "Hello world?", // plain text body
		html: "<b>Hello world?</b>" // html body
	  });
}
*/

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
