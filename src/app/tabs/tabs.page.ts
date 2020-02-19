import { Component, OnInit} from '@angular/core';
//import { ClickChatService, CClicks} from 'src/app/services/analytics.service';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
//import { firestore  } from 'Firebase';
import * as firebase from 'firebase';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})

export class TabsPage implements OnInit {

  constructor(public firestore: AngularFirestore) {}

  ngOnInit(){}

addClick(){
  const now = new Date();
  var date = now.toISOString().slice(0,10);

  var fireStoreRef = this.firestore.collection('analyticsStorage/chatClicks/year2020').doc('February');
  fireStoreRef.update({
    //numberOfClicks: firestore.FieldValue.increment(1)
  });

  //const arrayValue = fireStoreRef.documentSnapshot.get('numberOfClicks')
  //var arrUnion = fireStoreRef.update({
  //  dataChatClicksArray: firestore.FieldValue.arrayUnion(date)
 // });

  }



}
