import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})

export class ProfileService {

    public userProfile: firebase.firestore.DocumentReference;
    public currentUser: firebase.User;

    constructor(public afs: AngularFirestore) {

    }

    /**
     * The redeem table holds the information required for a user to redeem their points
     * This function adds a new doc to this collection - which calls a cloud function
     * that sends an email to the currently listed email
     */
    addToRedeemTable(adminEmail, email, username, gcType) {
        this.afs.firestore.collection('usersPointsRedeem').add({
            adminEmail: adminEmail,
            email: email,
            username: username,
            gcType: gcType,
            state: "new",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Update the user's email in db, only if their password entered matches the one
     * currently in the db
     */
    async updateEmail(newEmail: string, password: string, userID: string) {
        this.afs.firestore.collection('users').where('code', '==', userID)
            .get().then(snapshot => {
                snapshot.forEach(doc => {
                    const userPassword = doc.get('password');
                    if (userPassword === password) {
                        return this.afs.firestore.collection('users')
                            .doc(userID).update({ email: newEmail });
                    }
                });
            });
    }

    /**
     * Update the user's password in db, only if their old password entered matches the one
     * currently in the db
     */
    async updatePassword(newPassword: string, oldPassword: string, userID: string) {
        this.afs.firestore.collection('users').where('code', '==', userID)
            .get().then(snapshot => {
                snapshot.forEach(doc => {
                    const userPassword = doc.get('password');
                    if (userPassword === oldPassword) {
                        return this.afs.firestore.collection('users')
                            .doc(userID).update({ password: newPassword });
                    }
                });
            });
    }

    /**
     * Update the user's location in db
     */
    async updateLocation(newLocation: number, userID: string) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({ location: newLocation });
    }

    /**
     * Update the user's bio in db
     */
    async updateBio(newBio: string, userID: string) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({ bio: newBio });
    }

    /**
     * Update the user's bio in db
     */
    async updateRecoveryDate(newDate: string, userID: string) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({ endRehabDate: newDate });
    }

    /**
     * Update the user's bio in db
     */
    async updateProfilePic(newPic: string, userID: string) {
        console.log(`USER ID IS ${userID}`);
        return this.afs.firestore.collection('users')
            .doc(userID).update({ profilePic: newPic });
    }

    /** 
    * Update the users auto login preference.
    */
    async updateAutoLogin( autoLogPref: boolean, userID: string )
    {
        return this.afs.firestore.collection('users').doc(userID).update({autoLogin: autoLogPref});
    }

    /**
     * Update the number of points a user has after they redeem points
     */
    async updatePoints(currentPointTotal, pointsUsed, userID) {
        const newPointTotal = currentPointTotal - pointsUsed;
        return this.afs.firestore.collection('users')
            .doc(userID).update({ points: newPointTotal });
    }

    /**
     * Update the number of points a user has
     * Not called updatePoints because that's for redeeming points
     */
    editRewardPoints(newPointValue: number, userID: string) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({ points: newPointValue });
    }

    updateAvailableSurveys(newAvailableSurveys: any, userID: string) {
        return this.afs.firestore.collection('users')
            .doc(userID).update({ availableSurveys: newAvailableSurveys });
    }
}
