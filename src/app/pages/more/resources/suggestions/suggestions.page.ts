import { Component, OnInit } from '@angular/core';
import { LocationSuggestion, UserSubmissionsService } from '../../../../services/userSubmissions/user-submissions.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.page.html',
  styleUrls: ['./suggestions.page.scss'],
})
export class SuggestionsPage implements OnInit {

  locationSuggestion: LocationSuggestion = {
    name: '',
    address: '',
    reason: '',
    username: '',
    userID: '',
    timestamp: '',
    type: '',
  };

  constructor(private afs: AngularFirestore,
  private activatedRoute: ActivatedRoute,
  private userSubmissionService: UserSubmissionsService,
  private toastCtrl: ToastController,
  private router: Router,
  private storage: Storage) { }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
  }

  submitLocationSuggestion() {
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.locationSuggestion.userID = val;
            this.locationSuggestion.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.locationSuggestion.username = doc.get('username');
            this.locationSuggestion.type = 'Location Suggestion';

            this.userSubmissionService.addLocationSuggestion(this.locationSuggestion).then(() => {
              this.router.navigateByUrl('/more');
              this.showToast('Suggestion sent');
              this.locationSuggestion.name = '';
              this.locationSuggestion.address = '';
              this.locationSuggestion.reason = '';
            }, err => {
              this.showToast('There was a problem sending the suggestion');
            });


          });
        });
      }
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }
}
