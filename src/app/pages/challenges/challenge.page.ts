import { Component, OnInit } from '@angular/core';
import {ChallengeService, Challenge, ChallengeTypes} from '../../services/challenges/challenge-service.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import {DatePipe} from '@angular/common';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {ExpandableComponent} from '../../components/expandable/expandable.component';
import {element} from 'protractor';
import {forEach} from '@angular-devkit/schematics';


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
    public completedChallenges = [];
    public userID;
    public challengeView = 'all';

    constructor(private challengeService: ChallengeService,
                private storage: Storage,
                private router: Router,
                private afs: AngularFirestore,
                private analyticsService: AnalyticsService,
                private alertController: AlertController,
                private datePipe: DatePipe) {
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
                        this.challengeService.getCompletedChallenges(this.userID).then(resp => {
                            this.completedChallenges = resp;
                            this.completedChallenges.forEach(challenge => {
                                console.log(new Date(challenge.dateFinished.seconds * 1000).toLocaleDateString('en-US'));
                                console.log(challenge.dateFinished);
                                challenge.dateFinished = new Date(challenge.dateFinished.seconds * 1000).toLocaleDateString('en-US');
                                challenge.dateFinished = this.datePipe.transform(challenge.dateFinished, 'MMMM d, yyyy')
                            });
                            console.log(this.completedChallenges);
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

    challengeJoined(id): boolean {
        const joined = [];
        this.joinedChallenges.forEach(item => {
            joined.push(item.challenge.id);
        });
        return joined.includes(id);
    }

    challengeFinished(id): boolean {
        const finished = [];
        this.completedChallenges.forEach(item => {
            finished.push(item.challenge);
        });
        return finished.includes(id);
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
        Array.from(card).forEach(item => {
            if (item.tagName !== 'ION-CARD-TITLE') {
                if (item.classList.contains('ion-hide')) {
                    item.classList.remove('ion-hide');
                } else {
                    item.classList.add('ion-hide');
                }
            }
        });
    }
}
