import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentChangeAction, DocumentReference, Query } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/take'
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


  constructor(private afs: AngularFirestore) {
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

    this.deleteBlankChats();
    
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

    console.log(`Adding chat. Chat to be added is ${JSON.stringify(newChat)}`);
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
    this.afs.collection('settings').doc('chatroomSettings').ref.get().then((result) => {
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
        const ref = this.afs.collection<any>('chats').ref.where('cohort', '==', cohortID)
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
        const ref = this.afs.collection('chats').ref.where('cohort', '==', cohortID).orderBy('timestamp', 'desc');
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

   // Delete all chats in db that are blank. ie every single field is an empty string.
   // Not sure where these chats come from at the moment but they start to pile up over time.
   deleteBlankChats()
   {
     let chatCount = 1;
     this.afs.collection('chats').ref.where('type','==','').get().then( ( querySnap ) => {
       querySnap.forEach( (queryDocSnap) => {
         let chatDoc = queryDocSnap.data();
         chatCount++;
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

  // Consider using state changes for the instead of snapshot changes for new chats.
  getNewChats(cohortID): Observable<Chat[]>  {
    // this.iterateChats(cohortID);
    let currentDateAndTime  = new Date();
    console.log(`Getting current chats, current date is ${currentDateAndTime}`);
    
    this.chatCollection = this.afs.collection('chats', reference => reference.where('timestamp', '>', currentDateAndTime) );

    return this.chats = this.chatCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data(); // payload is a property of DocumentChange object.
          //Return the data object for the chat object.
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
  addAutoChat( newChat, userCode, isEmotionChat = false )
  {
    this.afs.collection('autoChats').add(newChat);

    if( !isEmotionChat )
    {
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
    else
    {
      console.log(`Auto chat was emotion`)
    }
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


  

}
