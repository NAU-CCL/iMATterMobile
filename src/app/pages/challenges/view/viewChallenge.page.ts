import { Component, OnInit } from '@angular/core';
import {ChallengeService, Challenge, ChallengeTypes} from '../../../services/challenges/challenge-service.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {ExpandableComponent} from '../../../components/expandable/expandable.component';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {compilerSetStylingMode} from '@angular/compiler/src/render3/view/styling_state';
import {isNegativeNumberLiteral} from "tslint";


@Component({
    selector: 'app-forum',
    templateUrl: './viewChallenge.page.html',
    styleUrls: ['./viewChallenge.page.scss'],
})

export class ViewChallengePage implements OnInit {
    public urls = [];
    public userID;
    public joined = false;

    public joinedChallenges = [];
    challenge: Challenge = {
        title: '',
        description: '',
        type: '',
        length: 0,
        coverPicture: '',
        contents: []
    };

    public daysCompleted;

    constructor(private challengeService: ChallengeService,
                private storage: Storage,
                private router: Router,
                private afs: AngularFirestore,
                private analyticsService: AnalyticsService,
                private alertController: AlertController,
                private activatedRoute: ActivatedRoute,
                private inAppBrowser: InAppBrowser) {
    }

    ngOnInit() {
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });
    }

    ionViewWillEnter() {
// gets the id of the survey
        const id = this.activatedRoute.snapshot.paramMap.get('id');

        // if the id exists, meaning that this is an already existing survey, get the corresponding
        // survey and assign it to the Survey object delcared above
        if (id) {
            this.challengeService.getChallenge(id).subscribe(challenge => {
                this.challenge = challenge;
                this.challenge.contents.forEach(task => {
                   task.tips.forEach(tip => {
                       if (tip.includes('https://')) {
                           this.urls.push(tip);
                       }
                   });
                });
            });
        }

        this.storage.get('userCode').then((val) => {
            if (val) {
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.userID = val;
                        this.challengeService.getJoinedChallenges(this.userID).then(resp => {
                            this.joinedChallenges = resp;

                            this.joinedChallenges.forEach(item => {
                                if (item.challenge.id === this.challenge.id) {
                                    this.joined = true;
                                    this.daysCompleted = item.currentDay;
                                    if (!item.dayComplete) {
                                        this.daysCompleted--;
                                    }
                                }
                            });
                        });
                    });
                });
            }
        });
    }

    expand(element) {
        let item = element.nextSibling;
        while (item !== null) {
            if (item.classList.contains('ion-hide')) {
                item.classList.remove('ion-hide');
            } else {
                item.classList.add('ion-hide');
            }
            item = item.nextSibling;
        }
    }

    joinChallenge(id) {
        const join = {
            dateStarted: new Date(),
            dateFinished: '',
            challenge: this.challenge,
            currentDay: 1,
            dayComplete: false
        };

        this.joinedChallenges.push(join);
        this.joined = true;
        this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(() => {
            this.presentAlert('Congratulations!', 'You\'ve joined this challenge');
        });
    }

    quitChallenge(id) {
        console.log(this.joinedChallenges);

        this.joinedChallenges.forEach((element, index) => {
            if (element.challenge.id === id) { this.joinedChallenges.splice(index, 1); }
        });
        this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(() => {
            this.presentAlert('You have quit this challenge.', 'Don\'t be afraid to try again!');
        });

        this.joined = false;
    }

    async presentAlert(header: string, message: string) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }
}
