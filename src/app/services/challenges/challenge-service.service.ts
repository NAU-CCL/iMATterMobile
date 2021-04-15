import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';


export interface Challenge {
    id?: string;
    title: string;
    description: string;
    type: string;
    length: number;
    coverPicture: string;
    contents: any[];
}

export interface ChallengeTypes {
    id?: string;
    type: string;
    picture: string;
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

    updateJoinedChallenges(userID: string, joined: any[]) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({joinedChallenges: joined});
    }

    updateCompletedChallenges(userID: string, completed: any[]) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({completedChallenges: completed});
    }
}

