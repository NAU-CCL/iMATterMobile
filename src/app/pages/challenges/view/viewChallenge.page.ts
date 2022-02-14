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
import {isNegativeNumberLiteral} from 'tslint';


@Component({
    selector: 'app-forum',
    templateUrl: './viewChallenge.page.html',
    styleUrls: ['./viewChallenge.page.scss'],
})

export class ViewChallengePage implements OnInit {
    public urls = [];
    public userID;
    public joined = false;
    public complete: boolean;

    public joinedChallenges = [];
    public completedChallenges = [];
    challenge: Challenge = {
        title: '',
        description: '',
        type: '',
        length: 0,
        coverPicture: '',
        icon: '',
        contents: []
    };

    public daysCompleted;
    public dayComplete;

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

        // gets the id of the challenge to show.
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
                console.log(this.challenge);
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
                                    this.dayComplete = item.dayComplete;
                                    if (!item.dayComplete) {
                                        this.daysCompleted--;
                                    }
                                }
                            });
                        });
                        this.challengeService.getCompletedChallenges(this.userID).then(resp => {
                            this.completedChallenges = resp;
                        });
                    });
                });
            }
        });
    }

    expand(element) {
        if (element.classList.contains('icon')) {
            return;
        }
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
        setTimeout(() => {
            this.ionViewWillEnter();
        }, 1000);
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

    completeDay(challengeId, id) {
        const check = document.getElementById(id) as HTMLInputElement;
        if (check.name === 'checkbox') {
            check.name = 'square-outline';
            this.joinedChallenges.forEach(item => {
                if (item.challenge.id === challengeId) {
                    item.dayComplete = !item.dayComplete;
                    this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(r => {
                        console.log(r);
                    });
                }
            });
        } else {
            this.areYouSure(challengeId, id);
        }
    }

    async areYouSure(id, checkbox) {
        const alert = await this.alertController.create({
            header: 'Are you sure?',
            message: '',
            buttons: [
                {
                    text: 'Yes',
                    handler: () => {
                        alert.dismiss(true);
                        this.checkForComplete(id);
                        console.log(this.complete);

                        if (this.complete) {
                            this.joined = false;
                            this.presentAlert('WOW! You finished the challenge!', 'Way to stick with it.');
                            // setTimeout(() => {
                            //     this.ionViewWillEnter();
                            // }, 1000);
                        } else {
                            this.presentAlert('Congratulations!', 'Good work on completing the task for today.' +
                                'Check back tomorrow for another challenge.');
                        }

                        this.joinedChallenges.forEach(item => {
                            if (item.challenge.id === id) {
                                item.dayComplete = !item.dayComplete;
                                this.challengeService.updateJoinedChallenges(this.userID,
                                    this.joinedChallenges).then(r => console.log(r));
                            }
                        });

                        if (this.complete) {
                            this.joinedChallenges.forEach(item => {
                                if (item.challenge.id === id) {
                                    item.dateFinished = new Date();
                                    const challenge = {
                                        challenge: id,
                                        dateStarted: item.dateStarted,
                                        dateFinished: item.dateFinished,
                                    };
                                    this.completedChallenges.push(challenge);
                                    this.joinedChallenges.splice(
                                        this.joinedChallenges.indexOf(item),
                                        1
                                    );
                                    this.challengeService.updateJoinedChallenges(this.userID,
                                        this.joinedChallenges).then(r => console.log(r));
                                    this.challengeService.updateCompletedChallenges(this.userID,
                                        this.completedChallenges).then(r => console.log(r));
                                }
                            });
                        }
                        const icon = document.getElementById(checkbox) as HTMLInputElement;
                        icon.name = 'checkbox';
                        return true;
                    }
                }, {
                    text: 'No',
                    handler: () => {
                        alert.dismiss(false);
                        const check = document.getElementById(id) as HTMLInputElement;
                        check.checked = false;
                        return false;
                    }
                }
            ]
        });

        await alert.present();
    }

    async checkForComplete(id) {
        this.joinedChallenges.forEach(item => {
            if (item.challenge.id === id) {
                if (item.currentDay === item.challenge.length) {
                    console.log('LAST DAY COMPLETED');
                    this.complete = true;
                } else {
                    this.complete = false;
                }
            }
        });
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
