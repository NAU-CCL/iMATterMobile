import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AnalyticsService, Analytics, Sessions} from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {firebaseConfig} from './firebaseCredentials';
import {Storage} from '@ionic/storage';
import {BnNgIdleService} from 'bn-ng-idle';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import { ProfileService } from './services/user/profile.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})

export class AppComponent {


    session: Sessions =
        {
            userID: '',
            LogOutTime: '',
            LoginTime: '',
            numOfClickChat: 0,
            numOfClickCalendar: 0,
            numOfClickLModule: 0,
            numOfClickInfo: 0,
            numOfClickSurvey: 0,
            numOfClickProfile: 0,
            numOfClickMore: 0,
            numOfClickHome: 0
        };
    public sessions: Observable<any>;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private storage: Storage,
        private router: Router,
        private bnIdle: BnNgIdleService,
        private analyticsService: AnalyticsService,
        private profileService: ProfileService
    ) {
        this.initializeApp();


        // Event that is suppose to fire when the user leaves to their homescreen.
        document.addEventListener('pause',  (  ) => {  analyticsService.endSessionOnAppExit() }, false);

        // Event that fires when user opens app after leaving app previously.
        document.addEventListener('resume', ( ) => { 
            analyticsService.addSessionOnAppEnter()  }, false);


    }

    logOut(): void {
        this.storage.set('authenticated', 'false');
        // this.storage.remove('userEmail');
        this.storage.remove('userCode');
        this.storage.remove('email');
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
