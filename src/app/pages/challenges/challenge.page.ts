import { Component, OnInit } from '@angular/core';
import {ChallengeService, Challenge, ChallengeTypes} from '../../services/challenges/challenge-service.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {ExpandableComponent} from '../../components/expandable/expandable.component';


@Component({
    selector: 'app-forum',
    templateUrl: './challenge.page.html',
    styleUrls: ['./challenge.page.scss'],
})

export class ChallengePage implements OnInit {
    analytic: Analytics =
        {
            page: '',
            userID: '',
            timestamp: '',
            sessionID: '',
        };

    public challenges: Observable<Challenge[]>;
    public types: Observable<ChallengeTypes[]>;
    public showChallengeDetails = false;
    public joinedChallenges = [];
    public userID;
    public challengeView = 'all';

    constructor(private challengeService: ChallengeService,
                private storage: Storage,
                private router: Router,
                private afs: AngularFirestore,
                private analyticsService: AnalyticsService,
                private alertController: AlertController) {
    }

    ngOnInit() {
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });

        this.challenges = this.challengeService.getAllChallenges();
        this.types = this.challengeService.getChallengeTypes();
    }

    ionViewWillEnter() {
        this.storage.get('userCode').then((val) => {
            if (val) {
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.userID = val;
                        this.challengeService.getJoinedChallenges(this.userID).then(resp => {
                            this.joinedChallenges = resp;
                            console.log(this.joinedChallenges);
                        });
                    });
                });
            }
        });
    }

    joinChallenge(id) {
        const join = {
            challenge: id,
            day: 1
        };

        if (this.joinedChallenges.includes(id)) {
           this.presentAlert('You are already a part of this challenge.', '');
        } else {
            this.joinedChallenges.push(join);
            this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(() => {
                this.presentAlert('Congratulations!', 'You\'ve joined this challenge');
            });
        }
    }

    quitChallenge(id) {
        this.joinedChallenges.forEach((element, index) => {
            if (element.challenge === id) { this.joinedChallenges.splice(index, 1); }
        });
        this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(() => {
            this.presentAlert('You have quit this challenge.', 'Don\'t be afraid to try again!');
        });
    }

    challengeJoined(id): boolean {
        const joined = [];
        this.joinedChallenges.forEach(element => {
            joined.push(element.challenge);
        });
        return joined.includes(id);
    }

    // present a basic alert -- used for displaying gc info
    async presentAlert(header: string, message: string) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }

    expandCard(id) {
        const card = document.getElementsByClassName(id)[0].children;
        Array.from(card).forEach(element => {
            if (element.tagName !== 'ION-CARD-TITLE') {
                if (element.classList.contains('ion-hide')) {
                    element.classList.remove('ion-hide');
                } else {
                    element.classList.add('ion-hide');
                }
            }
        });
    }
}
