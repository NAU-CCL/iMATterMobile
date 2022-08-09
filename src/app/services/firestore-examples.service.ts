import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreExamplesService {
  
  constructor(private firestore: AngularFirestore) { 
    //console.log(`Ex service initialized.`)
    
    //this.getAllUsers();

    //this.listenForNewData();

   //this.firestore.collection('testRealTimeData').ref.add({message: 'hi', timestamp: new Date()});
  }


  getUser()
  {
    this.firestore.collection('users').ref.where('code','==','NTw38h').get().then( (querySnap) =>{
      querySnap.forEach( (docSnap) =>{
        let userDoc = docSnap.data();

        // Update a single field on user or create it if it doesnt exist.
        docSnap.ref.update({cohort: 'cookie'});

        console.log(`User doc ${userDoc}`);
      })
    })
  }

  getAllUsers()
  {
    this.firestore.collection('users').ref.get().then( (querySnap) =>{
      querySnap.forEach( (docSnap) =>{
        let userDoc = docSnap.data();
        console.log(`User doc ${ JSON.stringify(userDoc) }`);
      })
    })
  }

  
  addUser()
  {

    // Add new doc to a collection. Does not need to have any specific fields.
    this.firestore.collection('users').ref.add({}).then( (docRef) => {
      console.log(`New user added to database. Doc is ${docRef.get().then( (docSnap)=> {
        console.log(`the doc data is ${JSON.stringify(docSnap.data())}`);
      })}`);
    });

    // Create a new collection. Specify the name of a collec that does not exist and add a doc to it and
    // the collection will be created.
  }

  listenForNewData()
  {
    this.firestore.collection('testRealTimeData').snapshotChanges().subscribe( (docChangeArray) =>{
      docChangeArray.forEach( (docChange) => {
        console.log(`The doc changed was ${JSON.stringify(docChange)}`);
      })
    })
  }

}
