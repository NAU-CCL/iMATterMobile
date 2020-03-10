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

  addToRedeemTable(adminEmail, email, username, gcType) {
      this.afs.firestore.collection('usersPointsRedeem').add({adminEmail: adminEmail, email: email, username: username, gcType: gcType});
  }

  updateEmail(newEmail: string, password: string, userID: string) {
      this.afs.firestore.collection('users').where('code', '==', userID)
          .get().then(snapshot => {
          snapshot.forEach(doc => {
              const userPassword = doc.get('password');
              if (userPassword === password) {
                  return this.afs.firestore.collection('users')
                      .doc(userID).update({email: newEmail});
              }
          });
      });
  }

  updatePassword(newPassword: string, oldPassword: string, userID: string) {
      this.afs.firestore.collection('users').where('code', '==', userID)
          .get().then(snapshot => {
          snapshot.forEach(doc => {
              const userPassword = doc.get('password');
              if (userPassword === oldPassword) {
                  return this.afs.firestore.collection('users')
                      .doc(userID).update({password: newPassword});
              }
          });
      });
  }





  updateLocation(newLocation: number, userID: string) {
      return this.afs.firestore.collection('users')
          .doc(userID).update({location: newLocation});
  }

  updateBio(newBio: string, userID: string) {
      return this.afs.firestore.collection('users')
          .doc(userID).update({bio: newBio});
  }

    updatePoints(currentPointTotal, pointsUsed, userID) {
      const newPointTotal = currentPointTotal - pointsUsed;
      return this.afs.firestore.collection('users')
            .doc(userID).update({points: newPointTotal});
    }

    /**
     * Update the number of points a user has
     * Not called updatePoints because that's for redeeming points
     */
    editRewardPoints(newPointValue: number, userID: string)
    {
        return this.afs.firestore.collection('users')
            .doc(userID).update({points: newPointValue});
    }

}
