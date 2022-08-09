import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AnalyticsService, Sessions} from 'src/app/services/analyticsService.service';

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

        this.analyticsService.updateClicks( 'numOfClickChat' );
        console.log('added chat click');

    }

    updateChallengeClicks()
    {
        this.analyticsService.updateClicks( 'numOfChallengeTabClicks' );
        console.log('added challenge click');
    }

    updateMoreClicks() {
        this.analyticsService.updateClicks( 'numOfClickMore' );
        console.log('added more click');

    }

    updateHomeClicks() {
        this.analyticsService.updateClicks( 'numOfClickHome' );
        console.log('added home click');
    }

}
