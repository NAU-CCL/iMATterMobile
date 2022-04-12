import {Component, OnInit} from '@angular/core';
// import { ClickChatService, CClicks} from 'src/app/services/analytics.service';
import {Observable} from 'rxjs';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument,
    DocumentReference
} from '@angular/fire/firestore';
// import { firestore  } from 'Firebase';
import * as firebase from 'firebase';
import {AnalyticsService, Analytics, Sessions} from 'src/app/services/analyticsService.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})

export class TabsPage implements OnInit {

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

    private sessions: Observable<any>;
    private activeTab?: HTMLElement;

    constructor(public firestore: AngularFirestore,
                private analyticsService: AnalyticsService) 
    {
        
    }

    ngOnInit() {
    }


    updateChatClicks() {
        this.analyticsService.updateChatClicks(this.session);
        console.log('added chat click');

    }


    updateCalendarClicks() {
        this.analyticsService.updateCalendarClicks(this.session);
        console.log('added calendar click');

    }


    updateMoreClicks() {
        this.analyticsService.updateMoreClicks(this.session);
        console.log('added more click');

    }


    updateHomeClicks() {
        this.analyticsService.updateHomeClicks(this.session);
        console.log('added home click');

    }

}
