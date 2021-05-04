import {AfterViewInit, Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {AngularFirestore} from '@angular/fire/firestore';
import {Storage} from '@ionic/storage';
import {NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult} from '@ionic-native/native-geocoder/ngx';
import * as firebase from 'firebase/app';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {compilerSetStylingMode} from '@angular/compiler/src/render3/view/styling_state';
import {forEach} from '@angular-devkit/schematics';


declare var google;

@Component({
    selector: 'app-resources',
    templateUrl: './resources.page.html',
    styleUrls: ['./resources.page.scss'],
})

export class ResourcesPage implements OnInit, AfterViewInit {
    latitude: any;
    longitude: any;
    dtitle: string;
    dlongitude: number;
    dlatitude: number;
    dcontent: string;
    dphone: string;
    dstreet: string;
    dspecialNote: string;
    doperationMOpen: string;
    doperationMClose: string;
    doperationTOpen: string;
    doperationTClose: string;
    doperationWOpen: string;
    doperationWClose: string;
    doperationThOpen: string;
    doperationThClose: string;
    doperationFOpen: string;
    doperationFClose: string;
    doperationSatOpen: string;
    doperationSatClose: string;
    doperationSunOpen: string;
    doperationSunClose: string;
    hourType: string;
    addressType: string;
    userLocation: string;
    userLocationHolder: string;
    userProfileID: any;
    specialNote: any;
    url: any;
    docId: any;

    map: any;
    icon: any;
    pos: any;
    position: any;
    bar: string;
    foo: string;

    dicon: any;

    public mapView = false;
    public locationList = [];
    public currentLat;
    public currentLong;

    @ViewChild('mapElement', {static: false}) mapNativeElement;

    constructor(public zone: NgZone,
                private geolocation: Geolocation,
                private nativeGeocoder: NativeGeocoder,
                public afs: AngularFirestore,
                private storage: Storage,
                private inAppBrowser: InAppBrowser) {
    }

    options = {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 3600
    };

    ngOnInit() {

        this.storage.get('userCode').then((val) => {
            if (val) {
                this.userProfileID = val;
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.userLocationHolder = doc.get('location');


                        console.log(this.userLocationHolder);
                        this.saveUserLocation(this.userLocationHolder);
                        console.log('hheeeeeeeeeeeeeeee');


                    });
                });
            }
        });

    }


    saveUserLocation(userLocationHolder) {
        this.userLocation = this.userLocationHolder;
        this.geolocation.getCurrentPosition().then((resp) => {
            console.log('RESP: ' + resp);
            this.currentLat = resp.coords.latitude;
            this.currentLong = resp.coords.longitude;
        }).catch((error) => {
            console.log('Error getting location', error);
        });
        console.log('inside saveUserLocation' + this.currentLat + ', ' + this.currentLong);


    }

    ngAfterViewInit(): void {

    }

    ionViewDidEnter() {
        this.getListView();
        this.enterMapView();
        // this.initializeLocations();
    }

    enterMapView() {
        this.initializeLocations();
    }

    async initializeLocations() {
        await this.geoMaps(this.userLocation);
        await this.getLocations();
    }

    async getLocations() {
        await firebase.firestore().collection('resourceLocations').get()
            .then(querySnapshot => {
                this.dtitle = '';
                this.dlongitude = 0;
                this.dlatitude = 0;
                this.dcontent = '';
                this.dicon = '';
                this.dstreet = '';
                this.doperationMOpen = '';
                this.doperationMClose = '';
                this.doperationTOpen = '';
                this.doperationTClose = '';
                this.doperationWOpen = '';
                this.doperationWClose = '';
                this.doperationThOpen = '';
                this.doperationThClose = '';
                this.doperationFOpen = '';
                this.doperationFClose = '';
                this.doperationSatOpen = '';
                this.doperationSatClose = '';
                this.doperationSunOpen = '';
                this.doperationSunClose = '';
                this.hourType = '';
                this.addressType = '';
                this.dphone = '';
                this.dspecialNote = '';
                this.url = '';

                querySnapshot.docs.forEach(async doc => {
                    this.dtitle = doc.get('title');
                    this.dlongitude = Number(doc.get('longitude'));
                    this.dlatitude = Number(doc.get('latitude'));
                    this.dcontent = doc.get('content');
                    this.dicon = doc.get('type');
                    this.dstreet = doc.get('street');
                    this.doperationMOpen = doc.get('MOpen');
                    this.doperationMClose = doc.get('MClose');
                    this.doperationTOpen = doc.get('TOpen');
                    this.doperationTClose = doc.get('TClose');
                    this.doperationWOpen = doc.get('WOpen');
                    this.doperationWClose = doc.get('WClose');
                    this.doperationThOpen = doc.get('ThOpen');
                    this.doperationThClose = doc.get('ThClose');
                    this.doperationFOpen = doc.get('FOpen');
                    this.doperationFClose = doc.get('FClose');
                    this.doperationSatOpen = doc.get('SatOpen');
                    this.doperationSatClose = doc.get('SatClose');
                    this.doperationSunOpen = doc.get('SunOpen');
                    this.doperationSunClose = doc.get('SunClose');
                    this.hourType = doc.get('hourType');
                    this.addressType = doc.get('addressType');
                    this.dphone = doc.get('phone');
                    this.dspecialNote = doc.get('special');
                    this.url = doc.get('url');

                    this.addMarker(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent, this.dicon,
                        this.doperationMOpen, this.doperationMClose, this.doperationTOpen, this.doperationTClose, this.doperationWOpen,
                        this.doperationWClose, this.doperationThOpen, this.doperationThClose, this.doperationFOpen, this.doperationFClose,
                        this.doperationSatOpen, this.doperationSatClose, this.doperationSunOpen, this.doperationSunClose,
                        this.addressType, this.hourType, this.dphone, this.dstreet, this.dspecialNote, this.url);


                    console.log(this.dlongitude);
                    console.log(this.dicon);


                });
            });
    }


    async geoMaps(userLocation) {
        // if (this.userLocation !== '') {
        //     console.log('enteredt user location thingy ');
        //
        //     await this.nativeGeocoder.forwardGeocode(this.userLocation)
        //         .then((result: NativeGeocoderResult[]) => {
        //             console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude);
        //             this.latitude = parseFloat(result[0].latitude);
        //             console.log('The coordinates are latitude=' + this.latitude);
        //
        //             this.longitude = parseFloat(result[0].longitude);
        //
        //             console.log('The coordinates are latitude=' + this.longitude);
        //             this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        //                 center: {lat: this.latitude, lng: this.longitude},
        //                 zoom: 16
        //             });
        //         })
        //         .catch((error: any) => console.log(error));
        //
        //
        // } else {
            await this.geolocation.getCurrentPosition().then((resp) => {
                this.latitude = resp.coords.latitude;
                this.longitude = resp.coords.longitude;
                console.log(this.latitude);
                console.log(this.longitude);
                this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
                    center: {lat: this.latitude, lng: this.longitude},
                    zoom: 16
                });

                console.log('displayed the map');

            }).catch((error) => {
                console.log('Error getting location', error);
            });
        // }

    }


    async addMarker(dtitle, dlongitude, dlatitude, dcontent, dicon,
                    doperationMOpen, doperationMClose, doperationTOpen, doperationTClose, doperationWOpen,
                    doperationWClose, doperationThOpen, doperationThClose, doperationFOpen, doperationFClose,
                    doperationSatOpen, doperationSatClose, doperationSunOpen, doperationSunClose, addressType, hourType,
                    dphone, dstreet, dspecialNote, url) {
        console.log('added pin');

        const pos = {
            lat: this.dlatitude,
            lng: this.dlongitude
        };


        if (this.dicon === 'hospital') {
            this.icon = {
                // tslint:disable-next-line:max-line-length
                url: 'https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/locationIcon%2FhospitalPin.png?alt=media&token=f1c91506-8a91-4021-9e89-2549b257f373', // image url
                scaledSize: new google.maps.Size(80, 80), // scaled size
            };

        } else if (this.dicon === 'clinic') {
            this.icon = {
                // tslint:disable-next-line:max-line-length
                url: 'https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/locationIcon%2Flocationpin.png?alt=media&token=d3777314-2607-4d4d-991f-638feed705d2', // image url
                scaledSize: new google.maps.Size(80, 80), // scaled size
            };
        } else if (this.dicon === 'therapy') {
            this.icon = {
                // tslint:disable-next-line:max-line-length
                url: 'https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/locationIcon%2FtherapyPin.png?alt=media&token=ff228dbe-361d-4399-a5ae-475d058369d5', // image url
                scaledSize: new google.maps.Size(80, 80), // scaled size
            };
        }

        const marker = await new google.maps.Marker({
            position: pos,
            map: this.map,
            title: dtitle,
            icon: this.icon
        });

        let contentString = '<div id="content">' +
            '<div id= "siteNotice" ' +
            '</div>' +
            '<h1 id="firstHeading" class="firstHeading">' + dtitle + '</h1>' +
            '<div id="bodyContent">' +
            '<p>' + dcontent + '</p>' +
            '</div>' +
            '<div id = "phone">' + 'Phone: ' + dphone + '</div>';
        if (addressType === 'physical') {
            contentString +=
                '<div id= "street">' + 'Street Address: ' + dstreet + '</div>';
        } else {
            contentString +=
                '<div id= "street">' + 'Call Center (no physical location)' + '</div>';
        }
        if (hourType === 'specific') {
            contentString +=
                '<div id = "operation">' + 'Hours of Operation' + '</div>' +
                '<div id = "monday">' + 'Monday: ' + doperationMOpen + '-' + doperationMClose + '</div>' +
                '<div id = "tuesday">' + 'Tuesday: ' + doperationTOpen + '-' + doperationTClose + '</div>' +
                '<div id = "wednesday">' + 'Wednesday: ' + doperationWOpen + '-' + doperationWClose + '</div>' +
                '<div id = "thursday">' + 'Thursday: ' + doperationThOpen + '-' + doperationThClose + '</div>' +
                '<div id = "friday">' + 'Friday: ' + doperationFOpen + '-' + doperationFClose + '</div>' +
                '<div id = "saturday">' + 'Saturday: ' + doperationSatOpen + '-' + doperationSatClose + '</div>' +
                '<div id = "sunday">' + 'Sunday: ' + doperationSunOpen + '-' + doperationSunClose + '</div>' +
                '<div id = "blank">' + '<p>' + '       ' + '</p>' + '</div>' +
                '<div id = "specialNote">' + 'Admin Note: ' + dspecialNote + '</div>' +
                '</div>';
        } else {
            contentString +=
                '<div id = "operation">' + 'Open 24 Hours' + '</div>' +
                '<div id = "specialNote">' + 'Admin Note: ' + dspecialNote + '</div>' +
                '</div>';
        }

        await google.maps.event.addListener(marker, 'click', function() {
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 300
            });
            infowindow.open(this.map, marker);
        });
    }

    showMapView() {
        this.mapView = true;
        this.enterMapView();
        document.getElementById('mapPicker').classList.add('selected');
        document.getElementById('listPicker').classList.remove('selected');
    }

    showListView() {
        this.mapView = true;
        this.getListView();
        document.getElementById('listPicker').classList.add('selected');
        document.getElementById('mapPicker').classList.remove('selected');
    }

    getListView() {
        this.mapView = false;
        firebase.firestore().collection('resourceLocations').get()
            .then(querySnapshot => {
                this.dtitle = '';
                this.dlongitude = 0;
                this.dlatitude = 0;
                this.dcontent = '';
                this.dicon = '';
                this.dstreet = '';
                this.doperationMOpen = '';
                this.doperationMClose = '';
                this.doperationTOpen = '';
                this.doperationTClose = '';
                this.doperationWOpen = '';
                this.doperationWClose = '';
                this.doperationThOpen = '';
                this.doperationThClose = '';
                this.doperationFOpen = '';
                this.doperationFClose = '';
                this.doperationSatOpen = '';
                this.doperationSatClose = '';
                this.doperationSunOpen = '';
                this.doperationSunClose = '';
                this.addressType = '';
                this.hourType = '';
                this.dphone = '';
                this.dspecialNote = '';
                this.url = '';
                this.docId = '';


                querySnapshot.docs.forEach(async doc => {
                    this.dtitle = doc.get('title');
                    this.dlongitude = Number(doc.get('longitude'));
                    this.dlatitude = Number(doc.get('latitude'));
                    this.dcontent = doc.get('content');
                    this.dicon = doc.get('type');
                    this.dstreet = doc.get('street');
                    this.doperationMOpen = doc.get('MOpen');
                    this.doperationMClose = doc.get('MClose');
                    this.doperationTOpen = doc.get('TOpen');
                    this.doperationTClose = doc.get('TClose');
                    this.doperationWOpen = doc.get('WOpen');
                    this.doperationWClose = doc.get('WClose');
                    this.doperationThOpen = doc.get('ThOpen');
                    this.doperationThClose = doc.get('ThClose');
                    this.doperationFOpen = doc.get('FOpen');
                    this.doperationFClose = doc.get('FClose');
                    this.doperationSatOpen = doc.get('SatOpen');
                    this.doperationSatClose = doc.get('SatClose');
                    this.doperationSunOpen = doc.get('SunOpen');
                    this.doperationSunClose = doc.get('SunClose');
                    this.addressType = doc.get('addressType');
                    this.hourType = doc.get('hourType');
                    this.dphone = doc.get('phone');
                    this.dspecialNote = doc.get('special');
                    this.url = doc.get('url');
                    this.docId = doc.id;

                    const locationObj = {
                        title: this.dtitle,
                        content: this.dcontent,
                        type: this.dicon,
                        street: this.dstreet,
                        phone: this.dphone,
                        mOpen: this.doperationMOpen,
                        mClose: this.doperationMClose,
                        tOpen: this.doperationMOpen,
                        tClose: this.doperationMClose,
                        wOpen: this.doperationMOpen,
                        wClose: this.doperationMClose,
                        thOpen: this.doperationMOpen,
                        thClose: this.doperationMClose,
                        fOpen: this.doperationMOpen,
                        fClose: this.doperationMClose,
                        satOpen: this.doperationMOpen,
                        satClose: this.doperationMClose,
                        sunOpen: this.doperationMOpen,
                        sunClose: this.doperationMClose,
                        addressType: this.addressType,
                        hourType: this.hourType,
                        specialNote: this.dspecialNote,
                        url: this.url,
                        id: this.docId
                    };

                    if (locationObj.addressType === undefined) {
                        locationObj.addressType = 'physical';
                    }
                    if (locationObj.hourType === undefined) {
                        locationObj.hourType = 'specific';
                    }
                    if (locationObj.url === undefined) {
                        locationObj.url = '';
                    }

                    // console.log(locationObj);

                    this.locationList.push(locationObj);
                });
                const locationList = document.getElementById('locationList') as HTMLElement;
                console.log(locationList);
                this.locationList.forEach(location => {
                    const card = document.createElement('ion-card');
                    card.id = location.id;
                    card.addEventListener('click', this.expandLocationCard);
                    let htmlText = '<ion-card-title class="ion-padding-top ion-padding-horizontal">' + location.title;
                    if (location.url !== '') {
                        htmlText += '<div class="urlLink" id="' + location.url + '"><ion-icon name="link"></ion-icon></div>';
                    }
                    if (location.addressType === 'physical') {
                        htmlText += '</ion-card-title><ion-card-subtitle class="ion-padding">' + location.phone +
                            '<br>' + location.street + '</ion-card-subtitle>';
                    } else {
                        htmlText += '</ion-card-title><ion-card-subtitle class="ion-padding">' + location.phone +
                            '</ion-card-subtitle>';
                    }
                    htmlText += '<ion-card-content class="ion-hide" id="cardContent">' + location.content;
                    if (location.hourType === '24hr') {
                        htmlText += '<div><div class="ion-padding-top"><h2>Open All Day</h2></div></div>';
                    } else {
                        htmlText += '<h2 class="ion-padding-bottom ion-padding-top"><b>Hours of Operation</b></h2></div>' +
                            '<div> Monday: ' + location.mOpen + '-' + location.mClose + '</div>' +
                            '<div> Tuesday: ' + location.tOpen + '-' + location.tClose + '</div>' +
                            '<div> Wednesday: ' + location.wOpen + '-' + location.wClose + '</div>' +
                            '<div> Thursday: ' + location.thOpen + '-' + location.thClose + '</div>' +
                            '<div> Friday: ' + location.fOpen + '-' + location.fClose + '</div>' +
                            '<div> Saturday: ' + location.satOpen + '-' + location.satClose + '</div>' +
                            '<div> Sunday: ' + location.sunOpen + '-' + location.sunClose + '</div>';
                    }
                    htmlText += '</ion-card-content>';
                    card.innerHTML = htmlText;
                    locationList.appendChild(card);
                });
                const links = document.getElementsByClassName('urlLink');
                Array.from(links).forEach(element => {
                    element.addEventListener('click', e => {
                        const browser = this.inAppBrowser.create(element.id);
                        browser.show();
                    });
                });
            });
    }

    expandLocationCard(this: HTMLElement) {
        console.log(this.lastChild);
        console.log(this.id);
        if (this.lastElementChild.classList.contains('ion-hide')) {
            this.lastElementChild.classList.remove('ion-hide');
        } else {
            this.lastElementChild.classList.add('ion-hide');
        }
        const locationList = document.getElementsByTagName('ion-card');
        Array.from(locationList).forEach(element => {
            if (!element.lastElementChild.classList.contains('ion-hide') && element.id !== this.id) {
                element.lastElementChild.classList.add('ion-hide');
            }
        });
    }

}
