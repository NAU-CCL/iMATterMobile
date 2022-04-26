import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/take'
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';


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

  async addChat(chat: Chat) {
    return this.afs.collection('chats').add({
      username: chat.username,
      message: chat.message,
      userID: chat.userID,
      cohort: chat.cohort,
      timestamp: chat.timestamp,
      profilePic: chat.profilePic,
      type: chat.type,
      visibility: chat.visibility,
      count: chat.count
    });
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

  // Deletes all chats from db.
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
  // documents from some index in a collection, could proably use this to create a much simpler function.
  initChatServce(path, field, opts?)
  {
    this.query = {
      path,
      field,
      limit: 10,
      reverse: true,
      prepend: true,
      ...opts
    }

    // order by desc if reverse is true.
    const first = this.afs.collection(this.query.path, ref => {
      return ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc').limit(this.query.limit)
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
  // Snapshots changes so the returned observable fetches any new messages to the db.
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










}
