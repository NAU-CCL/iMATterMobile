import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import * as firebase from 'firebase/app';
import { firebaseConfig } from './firebaseCredentials';
import { Storage } from '@ionic/storage';
import { BnNgIdleService } from 'bn-ng-idle';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private router: Router,
    private bnIdle: BnNgIdleService
  ) {
    this.initializeApp();
    firebase.initializeApp(firebaseConfig);
    this.bnIdle.startWatching(20).subscribe((isTimedOut: boolean) => {
       if (isTimedOut) {

         console.log('session expired');

         this.logOut();

       }
     });
  }

  logOut(): void {
    this.storage.set('authenticated', 'false');
    this.storage.remove('userCode');
    this.storage.remove('totalDaysPregnant');
    this.storage.remove('weeksPregnant');
    this.storage.remove('daysPregnant');
    this.router.navigateByUrl('login');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
