import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentReference} from '@angular/fire/compat/firestore';
import { StorageService } from 'src/app/services/storage/storage.service';


import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})

export class ProfileService {

    public userProfile: DocumentReference;

    constructor(public afs: AngularFirestore,
                private storageService: StorageService) {

    }

    /**
     * The redeem table holds the information required for a user to redeem their points
     * This function adds a new doc to this collection - which calls a cloud function
     * that sends an email to the currently listed email. The function: sendGCRequestEmail located in index.js in the functions folder.
     */
    addToRedeemTable(adminEmail, email, username, gcType) {
        this.afs.firestore.collection('usersPointsRedeem').add({
            adminEmail: adminEmail,
            email: email,
            username: username,
            gcType: gcType,
            state: "new",
            timestamp: new Date()
        });
    }
    
    /**
     * Update the user's email in db, only if their password entered matches the one
     * currently in the db
     */
    async updateEmail(newEmail: string, password: string, userID: string): Promise<void>
    {
        return this.afs.firestore.collection('users').where('code', '==', userID)
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
     * Update the user's password in db regardless if old password matches new password.
     */
    async updatePassword(newPassword: string, userID: string) {
        return this.afs.firestore.collection('users').where('code', '==', userID)
            .get().then(snapshot => {
                snapshot.forEach(doc => {
                    
                    return this.afs.firestore.collection('users')
                          .doc(userID).update({ password: newPassword }).then( () =>{
                            console.log(`Finished updating pass`);
                          });
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

    async getCurrentUserCode()
    {
        let storage  = await this.storageService.getStorage();
        return storage.get('userCode').then((val) => {
            console.log(`In profile service, user code is ${val}`)
            return this.afs.collection<any>('users').doc(val).get();
        });
    }

    convertCompletedSurveyDateStringsToDates()
    {
        this.afs.collection('users').get().subscribe( (userQuerySnap) =>{
            userQuerySnap.forEach( (userQueryDocSnap) =>{
                let userCompletedSurveysArray = userQueryDocSnap.get( "answeredSurveys" );
                if( !userCompletedSurveysArray )
                {
                    userCompletedSurveysArray = [];
                }

                console.log(`User ID is ${userQueryDocSnap.ref.id}`);

                userCompletedSurveysArray = userCompletedSurveysArray.map( (answeredSurveyObj) =>{
                    console.log(`Before change: answered survey object is ${JSON.stringify(answeredSurveyObj)}`);

                     let timeStart=  new Date(answeredSurveyObj.date + 'T' + answeredSurveyObj.timeStart.split(' ')[0] + ':00');
                     let timeEnd =  new Date(answeredSurveyObj.date + 'T' + answeredSurveyObj.timeEnd.split(' ')[0]);
                     let date =  new Date(answeredSurveyObj.date + 'T' + answeredSurveyObj.timeStart.split(' ')[0] + ':00');

                     answeredSurveyObj.timeStart = timeStart;
                     answeredSurveyObj.timeEnd = timeEnd;
                     answeredSurveyObj.date = date;

                     console.log(`AFTER CHANGE: answered survey object is ${JSON.stringify(answeredSurveyObj)}`);
                    return answeredSurveyObj;
                } );

                console.log(`MAPPED user compelted surveys array ${JSON.stringify(userCompletedSurveysArray)}`);

                //userQueryDocSnap.ref.update({answeredSurveys: userCompletedSurveysArray});
            })
        } )
    }
}
