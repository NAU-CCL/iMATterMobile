import { Component, OnInit } from '@angular/core';
import {ChallengeService, Challenge } from '../../../services/challenges/challenge-service.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService } from 'src/app/services/analyticsService.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import { StorageService } from 'src/app/services/storage/storage.service';



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

    public currentDay;
    public dayComplete;
    private storage: Storage = null;
    
    constructor(private challengeService: ChallengeService,
                private storageService: StorageService,
                private router: Router,
                private afs: AngularFirestore,
                private analyticsService: AnalyticsService,
                private alertController: AlertController,
                private activatedRoute: ActivatedRoute,
                public inAppBrowser: InAppBrowser) {
    }

    async ngOnInit() {
        this.storage = await this.storageService.getStorage();
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
                                    this.currentDay = item.currentDay;

                                    // More recent dates are greater than older dates.
                                    // So if today is more recent than the date of last completion,
                                    // then dayComplete should be false
                                    //item.dateOfLastCompletion.toDate() < new Date( new Date().setHours(0,0,0,0) )
                                    if(item.dateOfLastCompletion.toDate() < new Date( new Date().setHours(0,0,0,0) ) )
                                    {

                                        this.dayComplete = false;
                                    }
                                    else
                                    {
                                        this.dayComplete = true;
                                    }

                                    console.log(`Current Day: ${this.currentDay} Day complete ${this.dayComplete} Date of last completion: ${ item.dateOfLastCompletion.toDate() }`);
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
            dateOfLastCompletion: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0,0,0,0)), // set this to yesterday so its not null
            dayComplete: false
        };

        this.joinedChallenges.push(join);

        this.joined = true;
        this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(() => {
            this.presentAlert('Congratulations!', "You've joined this challenge");
        });
        setTimeout(() => {
            this.ionViewWillEnter();
        }, 1000);
    }

    async quitChallenge(id) {

        const alert = await this.alertController.create({
            header: 'Are you sure?',
            message: 'Clicking this will erase any progress on this challenge, are you sure you want to quit?',
            buttons: [
                {
                    text: 'Quit',
                    handler: () => {
                        this.joinedChallenges.forEach((element, index) => {
                            if (element.challenge.id === id) { this.joinedChallenges.splice(index, 1); }
                        });
                        this.joined = false
                        this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(async () => {
                            this.presentAlert('You have quit this challenge.', 'Don\'t be afraid to try again!');
                        });
                    }
                },
                {
                    text: 'Cancel',
                    handler: () => {
                        alert.dismiss( true )
                    }
                }
            ]
        })
        await alert.present()
    }

    completeDay(challengeId) {
       

        // Create an updated array of joined challenges after iterating through the array
        this.joinedChallenges = this.joinedChallenges.map(item => {
            if (item.challenge.id === challengeId) {
                // mark the challenge as complete for the day.
                item.dayComplete = true;
                this.dayComplete = true;

                // Increment current day now that user has completed today.
                item.currentDay++;

                this.currentDay++;

                // set the date of the last completed activity to the current date without a timestamp (hh:mm) so we can tell if the user has
                // waited at least 1 day before they can do the next task.
                item.dateOfLastCompletion = new Date(new Date().setHours(0,0,0,0));
                //item.dateOfLastCompletion = new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0,0,0,0));

                console.log(`Current Day: ${this.currentDay} Day complete ${this.dayComplete} Date of last completion: ${ item.dateOfLastCompletion }`);
                
                return item;
            }
            return item;
        });

        //console.log(`Updated challenges array before service: ${JSON.stringify(this.joinedChallenges)}`);

        // Now update the joined challenges array 
        this.challengeService.updateJoinedChallenges(this.userID, this.joinedChallenges).then(r => {
            console.log(`Updated challenges: ${JSON.stringify(r)}`);
        });
        
        
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
                        
                        // Display correct msg to user. If they finshed the challenge let em know.
                        if (this.complete) {
                            this.joined = false;
                            this.presentAlert('WOW! You finished the challenge!', 'Way to stick with it.');
                            this.router.navigate(['tabs/habits/completed_challenge/1']);
                            // setTimeout(() => {
                            //     this.ionViewWillEnter();
                            // }, 1000);
                        } else {
                            this.presentAlert('Congratulations!', 'Good work on completing the task for today.' +
                                'Check back tomorrow for another challenge.');
                        }


                        

                        // Remove the challenge from the users joined challenges array
                        // and then update the joined/completed challenges array.
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
                        else
                        {
                            // If user did not complete the challenge, update the joined challenges array.
                            this.completeDay(id);
                        }



                        // Change the empty square border into a check box
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


    showArrowIconOnTask(taskIndex)
    {
        // if our current day is incomplete OR currentDay represents tommorows task and is today is complete show the arrow
        return (taskIndex + 1) == this.currentDay && !this.dayComplete || (taskIndex + 1) == this.currentDay && this.dayComplete
    }

    showCheckBoxIconOnTask(taskIndex)
    {
        return (taskIndex + 1 ) < this.currentDay;
    }

    showCompleteTaskCheckbox(taskIndex)
    {
        return (taskIndex + 1) == this.currentDay && !this.dayComplete;
    }

    getTaskCompleteText(taskIndex)
    {
        // Task index is a 0 zero based index, add 1 to it so it corresponds directly with currentDay.
        let taskIndexAsDay = taskIndex + 1;

        // If the day was completed, then currentDay represents the next day to be completed so subtract 1 to find the task day previous
        // to the currentDay. Show this text on the task that was completed today.
        if(taskIndexAsDay < this.currentDay)
        {
            return 'Day ' + taskIndexAsDay + ' Complete!';
        }
        else
        {
            return 'Check back tomorrow to complete another task!'
        }

    }
}
