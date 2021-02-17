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
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

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
        private analyticsService: AnalyticsService
    ) {
        this.initializeApp();
        //firebase.initializeApp(firebaseConfig);
        this.bnIdle.startWatching(300).subscribe((isTimedOut: boolean) => {
            if (isTimedOut) {

                this.updateLogOut();
                console.log('session expired');

                this.logOut();

            }
        });
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

    updateLogOut() {
        this.analyticsService.updateLogOut(this.session);
        console.log('added LogOutTime');
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }
}
