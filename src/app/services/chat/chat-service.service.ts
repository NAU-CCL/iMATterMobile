import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentChangeAction, DocumentReference, Query } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/take'
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import {autoChat} from '../../pages/chat/chatInterface'

interface chatsQueryConfig{
  path: string,
  field: string,
  limit?: number,
  reverse?: boolean,
  prepend?: boolean
}

export interface Cohort {
  id?: string;
  name: string;
}

export interface Chat {
  id?: string;
  cohort: string;
  username: string;
  userID: string;
  timestamp: any;
  message: string;
  profilePic: any;
  type: any;
  visibility: boolean;
  count: number;
}

export interface chatSettings {
  autoChatLifeSpanInSeconds: number,
  hours: number,
  lifeType:string,
  maxAutoChatsOnScreen: number,
  numberOfChats:number
}

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  private cohorts: Observable<Cohort[]>;
  private cohortCollection: AngularFirestoreCollection<Cohort>;

  private chats: Observable<Chat[]>;
  private chatCollection: AngularFirestoreCollection<Chat>;


  private doneLoadingChats = new BehaviorSubject(false); // Done loading chats.
  private loadingChats = new BehaviorSubject(false); // are we currently waiting on chats to load?
  private currentChatDataBatch = new BehaviorSubject([]); // last batch of chats returned from firestore.

  private query: chatsQueryConfig;

  //Observable Data
  doneLoadingChatsObs: Observable<boolean> = this.doneLoadingChats.asObservable(); // loaded all chats
  loadingChatsObs: Observable<boolean> = this.loadingChats.asObservable(); // currently loading chats.
  currentChatDataBatchObs: Observable<any>; // data


  constructor(private afs: AngularFirestore, private storage: Storage) {
    this.cohortCollection = this.afs.collection<Cohort>('cohorts');

    this.cohorts = this.cohortCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      })
    );

    //this.deleteAllDateChats();
    //this.initializeDateChats();


    //this.addIsInChatFieldToUsers();

  }


  getChats(cohortID): Observable<Chat[]> {
    this.getChatCollection(cohortID);
    // this.iterateChats(cohortID);
    return this.chats;
  }

  getChatCollection(cohortID) {
    // this.iterateChats(cohortID);

    console.log(`getting chats, cohort id is ${cohortID}`);
    
    this.chatCollection = this.afs.collection('chats',
      reference => reference.where('cohort', '==', cohortID).orderBy('timestamp'));

    this.chats = this.chatCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      })
    );
  }

  async addChat( newChat: Chat) {

    // If the newChat is a day older than the most recent chat in the database then add a date divider chat message to the db. 
    // First query the collection for chats ordered from newest first to oldest, limit query to 1, then check the returned chat to see if
    // the chat was sent the day before the new chat being added to the db. If this is the case add a timestamp divider with a date equal to the new chat date.
    await this.afs.collection('chats').ref.orderBy('timestamp', 'desc').limit(1).get().then( (querySnap) => {
      querySnap.forEach((docSnap) =>{
        let mostRecentChatMessage = docSnap.data();
        // Get date but without time stamp. toDateString returns a string of the date without timestamp and then we recreate date object using this stirng which returns
        // a date object that includes a time stamp of 12:00am so datedividers are always the most recent timestamped chat messages in the db.
        let mostRecentChatDate = new Date( mostRecentChatMessage.timestamp.toDate().toDateString());
        let newChatDate = new Date( newChat.timestamp.toDateString() );

        console.log(`Adding new message: Most recent chat date is ${mostRecentChatDate.toDateString()} New chat msg date is ${newChatDate.toDateString()}`);
        console.log(`\n New message body from service is: ${newChat.message}`);

        // If the new chat date is newer than  the most recent chat mesage by 1 day or more, then add a datedivider to the db with the new chats datestamp.
        if(newChatDate > mostRecentChatDate)
        {
          this.afs.collection('chats').ref.add({
            cohort: 'default',
            username: 'datedivider',
            userID: 'system',
            timestamp: newChatDate,
            message: 'datedivider',
            profilePic: 'NA',
            type: 'datedivider',
            visibility: 'true',
            count: '0',
          });
          console.log(`added new date divider message.`);
        }
        else
        {
          console.log(`new chat date was NOT greater than most recent chat date`);
        }

      }
    )})

    // Add the new chat to the database.
    this.afs.collection('chats').add(newChat);

  }

  async deleteChat(id: string): Promise<void> {
    return this.chatCollection.doc(id).delete();
  }

  async updateChatVisibility(docID, bool) {
    if (bool === false) {
      return this.afs.firestore.collection('chats')
        .doc(docID).update({ visibility: false });
    } else {
      return this.afs.firestore.collection('chats')
        .doc(docID).update({ visibility: true });
    }
  }

  updateChatNumberCounter(docID, num) {
    return this.afs.firestore.collection('chats')
      .doc(docID).update({ count: num });
  }

  /* This function iterates through all chats in a cohort to decide if they are visible to the user or not */
  async iterateChats(cohortID, timeCalled) {
    console.log('iterateChats called');
    // get what the admin has set to determine user visibility of chats
    firebase.firestore().collection('settings').doc('chatroomSettings').get().then((result) => {
      const lifeType = result.get('lifeType');

      // if chat visibility is based on number of hours the chat has existed
      if (lifeType === 'hours') {
        // get admin set time for chats to last
        let setHours = result.get('hours');
        // convert to ms
        setHours = setHours * 60 * 60 * 1000;
        // get todays date
        const now = new Date();
        console.log('now', now);

        // go into all chats
        const ref = firebase.firestore().collection('chats').where('cohort', '==', cohortID);
        ref.get().then((res) => {
          res.forEach(doc => {
            const timestamp = new Date(doc.get('timestamp').toDate());
            // check difference between the time the chat was sent and now
            const difference = now.getTime() - timestamp.getTime();

            // if this difference is greater than set hours, set visibility to false. Otherwise, true
            if (difference >= setHours) {
              this.updateChatVisibility(doc.id, false);
            } else {
              // can be used to set chats back to true for testing purposes
              // this.updateChatVisibility(doc.id, true);
            }
          });
        });
        // check if the type is based on number of chats in the room
      } else if (lifeType === 'number') {
        // get the number admin has set
        const numChatsVis = result.get('numberOfChats');

        let numberOfCurrentChats = 0;
        let numberOfCurrentAutoChats = 0;
        // time order is oldest to newest
        const ref = firebase.firestore().collection('chats').where('cohort', '==', cohortID).orderBy('timestamp', 'desc');
        ref.get().then((res) => {
          res.forEach(doc => {
            // for each doc in the cohort chat room, if it is a user sent, iterate
            if (doc.get('type') === 'user' && doc.get('visibility') === true) {
              // count the number of non-auto chats
              numberOfCurrentChats += 1;
              // assign a new number to each chat
              this.updateChatNumberCounter(doc.id, numberOfCurrentChats);

              if (timeCalled === 'ngOnInit' || timeCalled === 'ionViewWillLeave') {
                if (doc.get('count') > numChatsVis) {
                  this.updateChatVisibility(doc.id, false);
                }
              } else if (timeCalled === 'addChat') {
                if (doc.get('count') > numChatsVis - 1) {
                  this.updateChatVisibility(doc.id, false);
                }
              }

            } else if (doc.get('type') === 'emotion' || doc.get('type') === 'auto') {
              if (doc.get('visibility') === true) {
                // count the number of auto chats
                numberOfCurrentAutoChats += 1;
                // assign a new number to each chat
                this.updateChatNumberCounter(doc.id, numberOfCurrentAutoChats);

                if (timeCalled === 'ngOnInit' || timeCalled === 'ionViewWillLeave') {
                  if (doc.get('count') > numChatsVis) {
                    this.updateChatVisibility(doc.id, false);
                  }
                } else if (timeCalled === 'addChat') {
                  if (doc.get('count') > numChatsVis - 1) {
                    this.updateChatVisibility(doc.id, false);
                  }
                }

              }
            }
          });
        });
      }
    });
  }

  // Deletes all chats from 'chats' collection in the db.
  deleteAllChats()
  {
    this.afs.collection('chats').ref.get().then( ( querySnap ) => {
      querySnap.forEach( (queryDocSnap) => {
        queryDocSnap.ref.delete();
      })
    })
  }




  // Initialize the chat service that fetches old chat messgaes. Likely over complicated, and 
  // I can not explain how everything works but note the startAt function. This is used to access
  // documents from some index in a collection, can use this to only fetch all document after index n in a collection for example,
  // works great for fetching chats because we need to keep track of what index we have fetched messages from last.
  // Can probably be used to create a much simpler function.
  initChatServce(path, field, opts?)
  {
    this.query = {
      path, // The name of the collection to fetch data from.
      field, // Field to order the chats by, this is timestamp for our use.
      limit: 30, // Load 30 chat messages on each db query.
      reverse: true, // Whether to load the data in reverse order.
      prepend: true, // Whether to add data to beginning or end of our observable array.
      ...opts
    }

    // order by desc if reverse is true.
    const first = this.afs.collection(this.query.path, ref => {
      return ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc').limit(this.query.limit);
     })

     this.mapAndUpdate(first);


     // SCan allows us to build a larger array over time.
     // Convert our chat batch subject to an observable and save it into the current batch obs variable.
     this.currentChatDataBatchObs = this.currentChatDataBatch.asObservable().scan( (acc, val) =>{
      return this.query.prepend ? val.concat(acc) : acc.concat(val) 
     } )
  }



  private async mapAndUpdate( chatCollection: AngularFirestoreCollection<any>)
  {
    // Dont run this function if weve loaded all chats in the db, or if were already loading chats.
    if( this.loadingChats.value || this.doneLoadingChats.value ) 
    {
      return
    };

    this.loadingChats.next(true);

    return chatCollection.snapshotChanges()
            .do( array => {
              let values = array.map( snapShot => {
                const data = snapShot.payload.doc.data();
                const doc = snapShot.payload.doc
                return { ...data, doc};
              })

              values = this.query.prepend ? values.reverse() : values;

              this.currentChatDataBatch.next(values);
              this.loadingChats.next(false);


              // If length is 0, execute if statement. Means we have loaded all chats
              // because the values array has a length of 0.
              if( !values.length)
              {
                // Found all chats. No more chats to load.
                this.doneLoadingChats.next(true)
              }
            }).take(1).subscribe();
  }

  private getCursor(){
    const current = this.currentChatDataBatch.value;
    if(current.length)
    {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc // add to end or beginning of the observable.
    }
    return null;
  }

  async more()
  {
    const cursor = this.getCursor();

    const more = this.afs.collection(this.query.path, ref => {
      return ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc').limit(this.query.limit).startAfter(cursor)
    })

    await this.mapAndUpdate(more);
  }

  // Gets all chats from the db that are added after the user joins the chatroom.
  // Snapshots any changes so the returned observable can fetch new messages from the db.
  getNewChats(cohortID): Observable<Chat[]>  {
    // this.iterateChats(cohortID);
    let currentDateAndTime  = new Date();
    console.log(`Getting current chats, current date is ${currentDateAndTime}`);
    
    this.chatCollection = this.afs.collection('chats', reference => reference.where('timestamp', '>', currentDateAndTime) );

    return this.chats = this.chatCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      })
    );
  }


 
  // One off function to create a bunch of test chats in the chat room as I accidentally deleted them all.
  createTestChats()
  {

    let index = 0;
    while( index < 30){
      this.afs.collection('chats').add(
        {
          cohort: 'default',
          userID:'NTw38h',
          message: 'test',
          username: 'calvin',
          profilePic: 'https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/ProfileImages%2Fpeacock.png?alt=media&token=ba0dd515-3350-4258-a615-5d76ec48e9ef',
          timestamp: new Date(),
          visibility: true,
          type: 'user',
          count: 0
        }
      );
      index++;
    }
  }


  // Adds a new auto chat to the autoChats collection
  addAutoChat( newChat, userCode )
  {
    this.afs.collection('autoChats').add(newChat);

    // Query database for the user document and change the users chat status to active or non active 
    // depending on whether the user is actively in the chat.
    this.afs.collection('users').ref.where('code','==',userCode).get().then( (querySnapshot) => {
      querySnapshot.forEach( (docSnap) =>{
        // Get doc reference so we can call update on it.
        let userDocRef = docSnap.ref;

        if(newChat.type == 'entered')
        {
          userDocRef.update({isInChat: true});  
        }
        else
        {
          userDocRef.update({isInChat: false});  
        }
        
      } )
    });
  }

  getAutoChats( ): Observable<DocumentChangeAction<autoChat>[]>
  {
    let currentDate = new Date();
    // Return all new or edited documents. In this case, should only return new docs as they are never edited.
    // stateChanges vs snapshotChanges. snapshotChanges reexecutes the query each time a document in the database changes. This would be good
    // for refreshing a list of data that the user can see, but we only want a single autochat document so we use stateChanges. Statechanges only returns a single document from the database on change.
    return this.afs.collection<autoChat>('autoChats', ref=> ref.where('timestamp','>', currentDate )).stateChanges();
  }

  deleteAllAutoChats()
  {
    this.afs.collection('autoChats').ref.get().then( ( querySnap ) => {
      querySnap.forEach( (queryDocSnap) => {
        queryDocSnap.ref.delete();
      })
    })
  }


  async getAutoChatSettings()
  {
    return this.afs.collection<chatSettings>('settings').ref.doc('chatroomSettings');
  }


  // Function that will add a bunch of messages to the database that represent timestamp dividers.
  // Each message added by this function represents a line displayed in the chat room to show division between messages sent of different days.
  // Is only designed for adding timestmaps to the chat database initially! This was only used because the chat room had no datedividers which are going to be
  // added dynamically instead of like this.
  async initializeDateChats()
  {

    // Date of the current chat document. We check to see if this date changes, and if 
    // it does we know to place a date stamp chat with that date into the database.
    // Not always going to be the same data as the one stored in currentChat.
    let newerDate: Date;

    // The date extracted from the current chat messages. Could be older or the same as newerDate, 
    // we dont know and want to find out.
    let currentDate: Date;

    // Once we start iterating we need the date of the first chat before we can start any comparisons.
    // Get the first date then set this to true.
    let gotFirstDate = false;


    // The current chat from the database.
    let currentChat: Chat;

    await this.afs.collection<Chat>('chats').ref.where('type','==','user').orderBy('timestamp','desc').get().then( (querySnap) =>
    {
      querySnap.forEach( (docSnap) =>
      {
        currentChat = docSnap.data() as Chat;

        console.log(`Current Doc Date is ${currentChat.timestamp.toDate().toString() }`)

        if( gotFirstDate )
        {
          currentDate = new Date( currentChat.timestamp.toDate().toDateString() ); // Get date from chat message without hour minute, second timestamp.

          // If the currentDate is actually older than newerDate
          if( currentDate < newerDate )
          {
            console.log(`Adding new datedivider with date ${newerDate.toString()}`)
            // If the currentDate is older than the newerDate, add a chat message of type datedivider with the same date as the newerDate.
            // We use newerDates date becuase we are working backwards, adding date dividers  for the newest messages and then the oldest.
            this.afs.collection('chats').ref.add({
              cohort: 'default',
              username: 'datedivider',
              userID: 'system',
              timestamp: newerDate,
              message: 'datedivider',
              profilePic: 'NA',
              type: 'datedivider',
              visibility: 'true',
              count: '0',
            });

            // Set the newerDate to currentDate. Current date is older, so that will be the next date we examine.
            newerDate = currentDate;
          }
        }
        else
        {
          // call toDate() on the timestamp object.
          // Call toDateString() on the date object returned from toDate() to get a string of the date without a timestamp, ie just MM/DD/YYYY
          // Then pass the timestamp string without a timestamp to the new Date contrusctor to get a timestamp that does not have a time.
          // We dont care what time a chat was sent, only the day it was sent.
          newerDate = new Date( currentChat.timestamp.toDate().toDateString() );

          gotFirstDate = true;
        }

      })
    });

    console.log(`Current date is ${currentDate.toString()} newer date is ${newerDate.toString()}`)
    // After we have examined all chats, the messages sent on the oldest date will not have received a timestamp datedivider, so we add one here.    
    
    this.afs.collection('chats').ref.add({
      cohort: 'default',
      username: 'datedivider',
      userID: 'system',
      timestamp: currentDate,
      message: 'datedivider',
      profilePic: 'NA',
      type: 'datedivider',
      visibility: 'true',
      count: '0',
    });




  }

  deleteAllDateChats()
  {
    this.afs.collection('chats').ref.where('type','==','datedivider').get().then( ( querySnap ) => {
      querySnap.forEach( (queryDocSnap) => {
        queryDocSnap.ref.delete();
      })
    })
  }


  

}
