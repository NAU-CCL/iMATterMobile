import { Component, OnInit } from '@angular/core';
import { LocationSuggestion, UserSubmissionsService } from '../../../../services/userSubmissions/user-submissions.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LocationService, Location } from 'src/app/services/resource.service';
import * as firebase from 'firebase/app';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
// Allows us to open apple or google maps from the app when user clicks an address.
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import {Device} from '@ionic-native/device/ngx';
import { AlertController } from '@ionic/angular';
import { Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReviewTagPopoverComponent } from './review-tag-popover/review-tag-popover.component'


@Component({
    selector: 'app-resource',
    templateUrl: './resource.page.html',
    styleUrls: ['./resource.page.scss'],
})
export class ResourcePage implements OnInit {
    resource: Location = {
        id: '',
        title: '',
        content: '',
        addressType: '',
        latitude: 0,
        longitude: 0,
        distance: 0,
        street: '',
        phone: '',
        phone24Hour: null,
        MOpen: '',
        MClose: '',
        TOpen: '',
        TClose: '',
        WOpen: '',
        WClose: '',
        ThOpen: '',
        ThClose: '',
        FOpen: '',
        FClose: '',
        SatOpen: '',
        SatClose: '',
        SunOpen: '',
        SunClose: '',
        special: '',
        type: '',
        hourType: '',
        url: '',
        cityState: '',
    }

    public reviewAvg: number; // average review rating for this resource.
    public totalReviews: number; // total reviews for this resource.
    public starArray = [1,2,3,4,5]; // Used to create star rating icons for resource.

    // Stores an object that describes answers to common review quesitons
    public reviewTagInfoObj: {};
    public tagAttrs = [];


    // Template Variables //

    public tagsCollapsed = false;

    constructor(private resourceService: LocationService,
        private storage: Storage,
        private router: Router,
        private afs: AngularFirestore,
        private activatedRoute: ActivatedRoute,
        private inAppBrowser: InAppBrowser,
        private toastCtl: ToastController,
        private callNumber: CallNumber,
        private launchNavigator: LaunchNavigator,
        private device: Device,
        private alertController : AlertController,
        public popoverController: PopoverController) {
    }

    public resourceID;

    async ngOnInit() {
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });
    }

    ionViewWillEnter() {
        this.resourceID = this.activatedRoute.snapshot.paramMap.get('id');

        if (this.resourceID ) {
            this.resourceService.getLocation(this.resourceID ).subscribe(resource => {
                this.resource = resource;
                console.log(this.resource);
            });
        }

        console.log(`Entering resource page.ts`)
    }

    // Use a capictor plugin to open the user phone app with a number 
    // Called when user clicks on a resoruces phone number.
    callResourcePhone(){
        this.callNumber.callNumber(this.resource.phone, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
    }

    async openAddress()
    {
        

        var platform = this.device.platform.toLowerCase();
        var map_error;
        var map_success;
        if(platform == "android")
        {
            this.launchNavigator.navigate("London, UK", {
                app: this.launchNavigator.APP.GOOGLE_MAPS
            }).then(
                success => {
                    console.log('Launched navigator');
                    map_success = success;
                },
                error => {
                    console.log('Error launching navigator', error);
                    map_error = error;
                }

                
              );

        }
        else if(platform == "ios")
        {
            this.launchNavigator.navigate("London, UK", {
                app: this.launchNavigator.APP.APPLE_MAPS
            }).then(
                success => {
                    console.log('Launched navigator');
                    map_success = success;
                },
                error => {
                    console.log('Error launching navigator', error);
                    map_error = error;
                }

                
              );
        }

        var error_alert = await this.alertController.create({
            header: 'You CLicked open address!',
            subHeader: 'Thank You',
            message: `Error:  ${map_error} \n Success: ${map_success} Platform: ${platform}`,
            buttons: [{
                text: 'OK',
                role: 'cancel'
            }
            ]
        });

        await error_alert.present();

    }

    visitSite(url) {
        console.log(url);
        const browser = this.inAppBrowser.create(url);
        browser.show();
    }

    copyAddress(address) {
        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', address);
            e.preventDefault();
        });

        document.execCommand('copy');
        this.showToast('Copied to Clipboard!')
    }

    showToast(msg) {
        this.toastCtl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }

    getReviewAvg( reviewInfoArray )
    {
        this.reviewAvg  = reviewInfoArray[0];
        this.totalReviews = reviewInfoArray[1];
        
        console.log(`Review avg IN PARENT is ${reviewInfoArray}`);
    }

    getReviewTagInfo( reviewTagInfoObj )
    {
        this.reviewTagInfoObj = reviewTagInfoObj;

        this.generateTagAttributes(this.reviewTagInfoObj)
        console.log(`REVIEW TAG IN PARENT OBJ ${JSON.stringify(reviewTagInfoObj) }`);
    }

    generateTagAttributes( reviewTagInfo )
    {
        for( let tagObj in reviewTagInfo )
        {
            let tagInfoObj = reviewTagInfo[tagObj];

            if(tagInfoObj.yes != 0 && tagInfoObj.no == 0)
            {
                this.tagAttrs.push([tagObj, 'success']);
            }
            else if( tagInfoObj.yes == 0 && tagInfoObj.no != 0 )
            {
                this.tagAttrs.push([tagObj, 'danger']);
            }
            else
            {
                this.tagAttrs.push([tagObj, 'warning']);
            }
            console.log(`TAG OBJ ${tagObj }`);
        }
    }

    toggleTagModal()
    {
        let modal: HTMLElement = document.querySelector('#tag-modal');
        modal.style.display = "block";
        modal.classList.add('animate-modal');
    }

    async presentPopover( chipID ) {
        const popover = await this.popoverController.create({
          component: ReviewTagPopoverComponent,
          translucent: true,
          componentProps: {id: chipID}
        });
        return await popover.present();
      }
}