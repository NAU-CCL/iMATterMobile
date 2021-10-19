import { Component, OnInit } from '@angular/core';
import { LocationSuggestion, UserSubmissionsService } from '../../../../services/userSubmissions/user-submissions.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LocationService, Location } from 'src/app/services/resource.service';
import * as firebase from 'firebase/app';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

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

    constructor(private resourceService: LocationService,
        private storage: Storage,
        private router: Router,
        private afs: AngularFirestore,
        private activatedRoute: ActivatedRoute,
        private inAppBrowser: InAppBrowser,
        private toastCtl: ToastController) {
    }

    ngOnInit() {
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });
    }

    ionViewWillEnter() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');

        if (id) {
            this.resourceService.getLocation(id).subscribe(resource => {
                this.resource = resource;
                console.log(this.resource);
            });
        }
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
}