import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';


export interface Challenge {
    id?: string;
    title: string;
    description: string;
    type: string;
    length: number;
    coverPicture: string;
    icon: string;
    contents: any[];
}

export interface ChallengeTypes {
    id?: string;
    type: string;
    picture: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ChallengeService {

    private challenges: Observable<Challenge[]>;
    private challengeCollection: AngularFirestoreCollection<Challenge>;
    private types: Observable<ChallengeTypes[]>;
    private typesCollection: AngularFirestoreCollection<ChallengeTypes>;

    constructor(private afs: AngularFirestore) {

        //this.addDateOfLastCompletionToChallengArray();
    }

    getChallengeCollection() {
        this.challengeCollection = this.afs.collection<Challenge>('challenges');
        this.challenges = this.challengeCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
            })
        );
        this.typesCollection = this.afs.collection<ChallengeTypes>('challengeTypes');
        this.types = this.typesCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
            })
        );
    }

    getAllChallenges(): Observable<Challenge[]> {
        this.getChallengeCollection();
        return this.challenges;
    }

    getChallengeTypes() {
        return this.types;
    }

    getJoinedChallenges(userID: string) {
        return this.afs.firestore.collection('users').doc(userID).get()
            .then((doc) => {
                return doc.data().joinedChallenges;
            });
    }

    getCompletedChallenges(userID: string) {
        return this.afs.firestore.collection('users').doc(userID).get()
            .then((doc) => {
                return doc.data().completedChallenges;
            });
    }

    getChallenge(id: string) {
        return this.afs.collection('challenges').doc<Challenge>(id).valueChanges().pipe(
            take(1),
            map(challenge => {
                challenge.id = id;
                return challenge;
            })
        );
    }

    updateJoinedChallenges(userID: string, joined: any[]): Promise<any> {

        //console.log(`Updated joined challenge ${JSON.stringify(joined)} \n\n\n for user id ${userID}`);

        return this.afs.firestore.collection('users')
            .doc(userID).update({joinedChallenges: joined});
    }

    updateCompletedChallenges(userID: string, completed: any[]) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({completedChallenges: completed});
    }


    addDateOfLastCompletionToChallengArray()
    {
        this.afs.firestore.collection('users').doc('NTw38h').get().then((user) =>{
            let userDataObj = user.data();
            let userChallengeArray = userDataObj.joinedChallenges;

            userChallengeArray.map((challengePropObj) =>{
                // Get yesterdays date in the most convoluted way possible.
                challengePropObj.dateOfLastCompletion = new Date(new Date(new Date().setDate(new Date().getDate() - 5)).setHours(0,0,0,0));
                challengePropObj.currentDay++;

                return challengePropObj;
            })

            console.log(`New User challenge array is ${JSON.stringify(userChallengeArray)}`);

            user.ref.update({joinedChallenges: userChallengeArray});
        })
    }
}

