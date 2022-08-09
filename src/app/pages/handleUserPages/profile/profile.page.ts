import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthServiceProvider, User } from '../../../services/user/auth.service';
import { ProfileService } from '../../../services/user/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { AnalyticsService, Analytics, Sessions } from 'src/app/services/analyticsService.service';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MoodProviderNotifService, EmotionNotif } from '../../../services/mood-provider-notif.service';
import { ChatService, Cohort, Chat } from '../../../services/chat/chat-service.service';
import { ActionSheetController } from '@ionic/angular';
import { EMOJIS } from '../../../services/emojiArray';
import { StorageService } from 'src/app/services/storage/storage.service';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user: User = {
        code: '',
        username: '',
        email: '',
        password: '',
        dueDate: '',
        endRehabDate: '',
        location: 0,
        cohort: '',
        weeksPregnant: '',
        daysPregnant: '',
        totalDaysPregnant: '',
        bio: '',
        securityQ: '',
        securityA: '',
        currentEmotion: '',
        profilePic: '',
        joined: '',
        daysAUser: 0,
        points: 0,
        chatNotif: true,
        learningModNotif: true,
        surveyNotif: true,
        infoDeskNotif: true,
        token: '',
        recentNotifications: [],
        answeredSurveys: [],
        joinedChallenges: [],
        completedChallenges: [],
        codeEntered: true,
        dailyQuote: '',
        availableSurveys: [],
        autoLogin: false,

    };

    chat: Chat = {
        cohort: '',
        username: '',
        userID: '',
        timestamp: '',
        message: '',
        profilePic: '',
        type: '',
        visibility: true,
        count: 0
    };

    analytic: Analytics =
        {
            page: '',
            userID: '',
            timestamp: '',
            sessionID: ''
        };

    emotionNotif: EmotionNotif = {
        userID: '',
        username: '',
        emotionEntered: '',
        viewed: false,
        timestamp: ''
    };

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

    private userProfileID: any;
    public pointsForRedemption: any;
    private analytics: string;
    private sessions: Observable<any>;
    public canRedeemPoints: boolean;
    public displayRedeemOptions: boolean;
    public chosenGCType: string;
    public gcTypes: Array<string>;
    public userEmotionIcon: string;
    public recoveryDate: string;
    public newRecoveryDate: string;

    public editingMode = false;
    public showImages = false;
    public allPicURLs: any;
    public previewPic: any;
    public collapsePersonalInfo: boolean = true;
    public showSettingsDropDown = false;
    public openRecoveryDatePicker:boolean = false;

    public pointsLeftForGC;

    public  emotionIcons = EMOJIS;

    static checkUserPoints(userPoints, pointsNeeded): boolean {
        return userPoints >= pointsNeeded;
    }
    private storage: Storage = null;
    constructor(
        private alertCtrl: AlertController,
        private authService: AuthServiceProvider,
        private profileService: ProfileService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private afs: AngularFirestore,
        private storageService: StorageService,
        private analyticsService: AnalyticsService,
        private alertController: AlertController,
        private toastCtrl: ToastController,
        private http: HttpClient,
        public datePipe: DatePipe,
        private chatService: ChatService,
        private mpnService: MoodProviderNotifService,
        private actionSheetController: ActionSheetController,
        private analyticService: AnalyticsService
    ) {
        this.getProfilePictureChoices();
    }

    async ngOnInit() {
        this.storage = await this.storageService.getStorage();
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });

        this.displayRedeemOptions = false;

        
       

    }

    ngAfterViewInit(){
        
    }

    setProgressBarBackground()
    {
        console.log(`Points required ${this.pointsForRedemption} User points ${this.user.points}`);
        let pointsRequiredToRedeem = this.pointsForRedemption;
        // Get the percent the user is at for receiving a giftcard.
        let progressPercent = (this.user.points/pointsRequiredToRedeem)*100;
        //let progressPercent = (29/pointsRequiredToRedeem)*100;
        // What percent of points does the user need to get a giftcard?
        let unfinishedPercent = 100 - progressPercent;

        if( unfinishedPercent > 0 )
        {
            this.pointsLeftForGC = pointsRequiredToRedeem - this.user.points;
        }

        let progressBarEl: HTMLElement = document.querySelector('#gc-points-prog-bar');

        console.log(`the bar ${JSON.stringify(progressBarEl) } Percent ${progressPercent} unfinished ${unfinishedPercent}`)

        // Use the gradient to cover a portion of the background image. Gradient must come first for this to work.
        progressBarEl.style.backgroundImage =`linear-gradient(90deg, #00FFFF00 ${progressPercent}%, #FFFFFFFF 0%), url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23236240' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`; 

        if(progressPercent >= 100)
        {
            progressBarEl.classList.add('can-redeem-gc-animation');
        }

        console.log(`Setting background`);
    }
   

    // get user info
    ionViewWillEnter() {
        this.addView();
        this.refreshPage();
    }

    addView() {
        // this.analytic.sessionID = this.session.id;
        this.storage.get('userCode').then((val) => {
            if (val) {
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.analytic.page = 'profile';
                        this.analytic.userID = val;
                        this.analytic.timestamp = new Date();
                        // this.analytic.sessionID = this.idReference;
                        this.analyticsService.addView(this.analytic).then(() => {
                            console.log('successful added view: profile');

                        }, err => {
                            console.log('unsuccessful added view: profile');

                        });
                    });
                });
            }
        });
    }

    // log user out, sets authentication to false and removes some unnecessary storage
    logOut(): void {
        this.analyticsService.endSessionOnAppExit();
        this.storage.set('authenticated', 'false');
        this.storage.remove('userCode');
        this.storage.remove('totalDaysPregnant');
        this.storage.remove('weeksPregnant');
        this.storage.remove('daysPregnant');
        this.router.navigateByUrl('login');
    }

    validateEmail(email) {
        return /(.+)@(.+){2,}\.(.+){2,}/.test(email);
    }

    // allows user to update email if the put in their current password
    async updateEmail(): Promise<void> {
        const alert = await this.alertCtrl.create({
            header: 'Update Email',
            inputs: [
                { type: 'text', name: 'newEmail', placeholder: 'Your new email' },
                { name: 'password', placeholder: 'Your password', type: 'password' },
            ],
            buttons: [
                { text: 'Cancel' },
                {
                    text: 'Save',
                    handler: data => {
                        if (this.validateEmail(data.newEmail)) {
                            this.profileService.updateEmail(data.newEmail, data.password, this.userProfileID)
                                .then(() => {
                                    this.showToast('Your email has been updated!');
                                    this.storage.set('email', data.newEmail).then( ()=>{
                                        this.refreshPage();
                                    });
                                },
                                    err => {
                                        this.showToast('There was a problem updating your email');
                                    });
                        } else {
                            alert.message = 'Invalid Email';
                            return false;
                        }
                    },
                },
            ],
        });
        await alert.present();
    }

    async updatePassword(): Promise<void> {
        const alert = await this.alertCtrl.create({
            header: 'Update Password',
            inputs: [
                { name: 'oldPassword', placeholder: 'Old password', type: 'password' },
                { name: 'newPassword', placeholder: 'New password', type: 'password' },
            ],
            buttons: [
                { text: 'Cancel' },
                {
                    text: 'Save',
                    handler: data => {
                        if (data.newPassword.length >= 8 && this.user.password === data.oldPassword) 
                        {
                            this.profileService.updatePassword(data.newPassword, this.userProfileID)
                                .then(() => {
                                    this.showToast('Your password has been updated!');
                                    this.refreshPage();
                                },
                                    err => {
                                        this.showToast('There was a problem updating your password');
                                    });
                        } 
                        else if(data.newPassword.length <= 8 )
                        {
                            console.log(`Password is less than 8. New pass ${data.newPassword}. Old password ${data.oldPassword}`);
                            alert.message = 'Password must be 8 characters or longer';
                            return false;
                        }
                        else if(this.user.password != data.oldPassword)
                        {
                            console.log(`Old password incorrect. User pass ${this.user.password}. Old password ${data.oldPassword}`);
                            alert.message = 'Old password incorrect';
                            return false;
                        }
                    },
                },
            ],
        });
        await alert.present();
    }

    validateLocation(zip) {
        return /^[0-9]{5}(?:-[0-9]{4})?$/.test(zip) || zip === '';
    }

    async updateLocation(): Promise<void> {
        const alert = await this.alertCtrl.create({
            header: 'Update Location (Zip Code)',
            inputs: [
                { type: 'text', name: 'newLocation', placeholder: 'Leave empty to remove' },
            ],
            buttons: [
                { text: 'Cancel' },
                {
                    text: 'Save',
                    handler: data => {

                        if (this.validateLocation(data.newLocation)) {
                            this.profileService.updateLocation(data.newLocation, this.userProfileID)
                                .then(() => {
                                    this.showToast('Your location has been updated!');
                                    this.refreshPage();
                                },
                                    err => {
                                        this.showToast('There was a problem updating your location');
                                    });
                        } else {
                            alert.message = 'Invalid Zip Code';
                            return false;
                        }
                    },
                },
            ],
        });
        await alert.present();
    }

    // async updateBio(): Promise<void> {
    //     const alert = await this.alertCtrl.create({
    //         header: 'Update Bio',
    //         inputs: [
    //             {type: 'text', name: 'newBio', placeholder: 'Nothing personal!'},
    //         ],
    //         buttons: [
    //             {text: 'Cancel'},
    //             {
    //                 text: 'Save',
    //                 handler: data => {
    //                     this.profileService.updateBio(data.newBio, this.userProfileID)
    //                         .then(() => {
    //                                 this.showToast('Your bio has been updated!');
    //                                 this.refreshPage();
    //                             },
    //                             err => {
    //                                 this.showToast('There was a problem updating your bio');
    //                             });
    //                 },
    //             },
    //         ],
    //     });
    //     await alert.present();
    // }

    /**
     * Grabs the user's necessary info for the profile
     * Can be called to refresh the data on the page
     */
    refreshPage() {
        this.storage.get('userCode').then((val) => {
            if (val) {
                this.userProfileID = val;
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        console.log(`user code is ${val}`)
                        this.user.username = doc.get('username');
                        this.user.email = doc.get('email');
                        this.user.password = doc.get('password');
                        this.user.bio = doc.get('bio');
                        this.user.location = doc.get('location');
                        // this.user.cohort = doc.get('cohort');
                        // const rehabDate = new Date(doc.get('endRehabDate'));
                        // this.user.endRehabDate = this.datepipe.transform(rehabDate, 'D MM YYYY');
                        // this.user.endRehabDate = doc.get('endRehabDate');
                        const date = doc.get('endRehabDate');
                        console.log(`The date is ${JSON.stringify(date)}`);
                        this.recoveryDate = date;
                        this.newRecoveryDate = date;
                        // console.log(date);
                        this.user.endRehabDate = doc.get('endRehabDate');
                        // console.log(dateString);
                        this.user.currentEmotion = doc.get('mood');
                        this.user.profilePic = doc.get('profilePic');
                        this.previewPic = this.user.profilePic;
                        this.user.points = doc.get('points');
                        this.user.autoLogin = doc.get('autoLogin');
                        this.userEmotionIcon = this.getUserEmotionIcon(this.user.currentEmotion);

                        const pointRef = this.afs.collection<any>('settings').doc('giftCardSettings').ref.get();
                        pointRef.then((res) => {
                            this.pointsForRedemption = res.get('points');
                            this.gcTypes = res.get('types');
                            this.canRedeemPoints = ProfilePage.checkUserPoints(this.user.points, this.pointsForRedemption);
                            // Set the progress bar styling once we have got the user points and points to redeem values.
                            this.setProgressBarBackground();
                        });
                    });
                });

                
            }
        });
    }

    // gets admin set point amount and uses that to
    displayPointInfo() {
        const pointRef = this.afs.collection('settings').doc('giftCardSettings').get();
        let pointRef_ = pointRef.subscribe((res) => {
            const points = res.get('points');
            this.presentAlert('Earning Points',
                'You can earn points by completing surveys and answering learning module questions. Once you have earned ' +
                +points + ' points, you will see a redeem button, which you may press to use your points to get a gift card for $5');
                
            pointRef_.unsubscribe();
        });
    }

    // this function deducts the admin set point amount from the user
    // and sends an email to the admin set email
    redeemGiftCard(currentPoints, pointsUsed, gcType, email, username) {

        this.profileService.updatePoints(currentPoints, pointsUsed, this.userProfileID);
        this.displayRedeemOptions = false;

        this.refreshPage();

        // send an email
        let giftCardSettings_ = this.afs.collection('settings').doc('giftCardSettings').get().subscribe((result) => {
            const adminEmail = result.get('email');
            this.profileService.addToRedeemTable(adminEmail, email, username, gcType);

            giftCardSettings_.unsubscribe();
        });
        this.showToast('An email was sent for your gift card request!');
    }

    saveEmotion(emotion: string, emoji: string)
    {
        this.analyticService.updateClicks('emotionChangeClicks');

        this.afs.firestore.collection('users').doc(this.userProfileID)
            .update({ mood: emotion });

         // If new emotion is different than old, add a chat message describing the new emotion.
         if (emotion != this.user.currentEmotion) {
            this.chatService.addAutoChat(this.chat, this.chat.userID, true);
         }

        this.user.currentEmotion = emotion;

        this.chat.cohort = this.user.cohort;
        this.chat.userID = this.userProfileID;
        this.chat.username = this.user.username;
        this.chat.profilePic = this.user.profilePic;
        this.chat.timestamp = new Date();
        this.chat.message = 'is currently feeling ' + emoji;
        this.chat.type = 'emotion';
        this.chat.visibility = true;

        

        this.updateEmotionBadge(this.user.currentEmotion);

        if (emotion === 'stressed') {
            this.presentAlert('Stay Strong!',
                'Remember you have your cohort to support you and health modules available to you! If you need help,' +
                'please go to the Resources page to find help near youTake a deep breath and ground yourself. Have faith that it’ll work out.  If you are in need of additional support please contact your counselor or a hotline available on the Resource Location page.');
        } else if (emotion == 'happy') {
            this.presentAlert('Fantastic!',
                'Glad to hear you are doing well! Positive emotions can help you sieze the day and find new opportunities.')
        } else if (emotion == 'loved') {
            this.presentAlert('Feeling loved is a great feeling!',
                'Surrounding yourself with those who support and love you will help you during recovery.')
        } else if (emotion == 'ok') {
            this.presentAlert('It\'s okay to have off days.',
                'days. Keep going strong, think of ways to make tomorrow a better day!')
        } else if (emotion == 'sad') {
            this.presentAlert('Your feelings are valid.',
                'You aren’t being too sensitive. You aren’t being too dramatic. You are hurting and that is okay. If you need additional support please reach out to someone who supports you or visit the Resource Locations page.');
        } else if (emotion == 'angry') {
            this.presentAlert('Stay strong!', ' Anger is a normal reaction as your body is recovering and healing from substance use. When experiencing anger take a step back and assess the situation. Take some time to reflect and practice calming techniques. It is important to acknowledge when you feel this way and simply talking about it could help you overcome it.  If you need additional support please reach out to someone who supports you or visit the Resource Locations page.  https://www.careaddiction.com/amp/halt-addiction-recovery');
        } else if (emotion == 'lonely') {
            this.presentAlert('Stay strong!', 'Feeling lonely can occur even when you\'re not alone. While starting your recovery process it is easy to feel isolated. Creating a strong sober network of like minded people can help discourage loneliness. If you want additional support, there is a chat available in the app for you to reach out and talk to others in similar situations. https://www.careaddiction.com/amp/halt-addiction-recovery');
        } else if (emotion == 'tired') {
            this.presentAlert('That\'s okay!', 'Tired: With all of the demands in life it is easy to feel exhausted and difficult to find time to rest. Proper rest is the foundation for clear thoughts, energy, and coping skills. Try participating in ways to relax your mind like meditation, listening to music, or taking a nap to increase your energy. https://www.careaddiction.com/amp/halt-addiction-recovery');
        }
        this.emotionNotif.userID = this.userProfileID;
        this.emotionNotif.username = this.user.username;
        this.emotionNotif.emotionEntered = emotion;
        this.emotionNotif.timestamp = new Date();
    }

    updateEmotionBadge(emotion: string) {
        const emotionBadge = this.getUserEmotionIcon(emotion);
        const badge = document.getElementsByTagName('ion-badge');
        badge.item(0).innerHTML = emotionBadge;
    }

    getUserEmotionIcon(emotion: string) {
        if (emotion === 'excited') {
            return this.emotionIcons.excited;
        } else if (emotion === 'happy') {
            return this.emotionIcons.happy;
        } else if (emotion === 'loved') {
            return this.emotionIcons.loved;
        } else if (emotion === 'ok') {
            return this.emotionIcons.ok;
        } else if (emotion === 'stressed') {
            return this.emotionIcons.stressed;
        } else if (emotion === 'sad') {
            return this.emotionIcons.sad;
        } else if (emotion === 'angry') {
            return this.emotionIcons.angry;
        } else if (emotion === 'tired') {
            return this.emotionIcons.tired;
        } else if (emotion === 'lonely') {
            return this.emotionIcons.tired;
        }
    }

    // present a basic alert -- used for displaying gc info
    async presentAlert(header: string, message: any) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }

    showToast(msg) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }

    showPics() {
        this.showImages = true;
    }

    getProfilePictureChoices() {
        let userSignUpSetting_ = this.afs.collection('settings').doc('userSignUpSettings').get().subscribe((result) => {
            this.allPicURLs = result.get('profilePictures');
            userSignUpSetting_.unsubscribe();
        });
    }

    changePic(pic) {
        this.showImages = false;
        this.previewPic = pic;
    }

    editProfile( ) {
        this.editingMode = true;
    }

    saveProfile() {
        
        console.log(`New recover date in save profile is ${this.newRecoveryDate}`);

        if (this.newRecoveryDate !== this.user.endRehabDate) {
            console.log('Date value changed');
            // const newRehabDate = (document.getElementById('newEndRehabDate') as HTMLInputElement).value;
            this.user.endRehabDate = this.newRecoveryDate;
            //this.recoveryDate = date;
            this.profileService.updateRecoveryDate(this.user.endRehabDate, this.userProfileID);
        } else {
            console.log('In the else');
            // we use newrecovery date in the date picker and use recoverdate to persist out changes in case the user cancels their edits.
            this.newRecoveryDate = this.recoveryDate;
        }

        console.log('Out of if');
        const newBio = (document.getElementById('newBio') as HTMLInputElement).value;
        this.user.profilePic = this.previewPic;
        this.user.bio = newBio;
        this.profileService.updateProfilePic(this.user.profilePic, this.userProfileID);
        this.profileService.updateBio(newBio, this.userProfileID);

        
        this.editingMode = false;
    }

    cancelEdit() {
        this.previewPic = this.user.profilePic;
        this.editingMode = false;
        this.newRecoveryDate = this.recoveryDate;
    }

    async showSettingsActionSheet() {
        const actionSheet = await this.actionSheetController.create({
          buttons: [{
            text: 'Log Out',
            role: 'destructive',
            handler: () => {
                this.logOut();
            }
          }, {
            text: 'Go to Settings',
            role: 'destructive',
            handler: () => {
                this.router.navigateByUrl('/tabs/more/settings');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Share clicked');
            }
          }
        ]
        });
        await actionSheet.present();
    
        const { role, data } = await actionSheet.onDidDismiss();
        console.log('onDidDismiss resolved with role and data', role, data);
      }
}


