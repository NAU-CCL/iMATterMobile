import { AfterViewInit, Component, OnInit, ViewChild , NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult} from '@ionic-native/native-geocoder/ngx';
import * as firebase from 'firebase/app';


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
    userLocation: string;
    userLocationHolder: string;
    userProfileID: any;
    specialNote: any;

    map: any;
    icon: any;
    pos: any;
    position: any;
    bar: string;
    foo: string;

    dicon: any;

    @ViewChild('mapElement', {static: false}) mapNativeElement;
    constructor(public zone: NgZone,
                private geolocation: Geolocation,
                private nativeGeocoder: NativeGeocoder,
                public afs: AngularFirestore,
                private storage: Storage, ) { }

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
      console.log('inside saveUserLocation' + this.userLocation);


    }

    ngAfterViewInit(): void {

     }

     ionViewDidEnter() {
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
        this.dlongitude = 0  ;
        this.dlatitude = 0 ;
        this.dcontent = '' ;
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
        this.dphone = '';
        this.dspecialNote = '';

        querySnapshot.docs.forEach( async doc => {
        this.dtitle = doc.get('title');
        this.dlongitude = Number (doc.get('longitude'));
        this.dlatitude = Number( doc.get('latitude'));
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
        this.dphone = doc.get('phone');
        this.dspecialNote = doc.get('special');

        this.addMarker(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent, this.dicon,
            this.doperationMOpen, this.doperationMClose, this.doperationTOpen, this.doperationTClose, this.doperationWOpen,
            this.doperationWClose, this.doperationThOpen, this.doperationThClose, this.doperationFOpen, this.doperationFClose,
            this.doperationSatOpen, this.doperationSatClose, this.doperationSunOpen, this.doperationSunClose,
            this.dphone, this.dstreet , this.dspecialNote);


        console.log(this.dlongitude);
        console.log(this.dicon);


      });
    });
  }




     async geoMaps(userLocation) {


       if (this.userLocation !== '') {
         console.log('enteredt user location thingy ');

         await this.nativeGeocoder.forwardGeocode(this.userLocation)
         .then((result: NativeGeocoderResult[]) => {
           console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude);
           this.latitude = parseFloat(result[0].latitude);
           console.log('The coordinates are latitude=' + this.latitude);

           this.longitude = parseFloat( result[0].longitude);

           console.log('The coordinates are latitude=' + this.longitude);
           this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
             center: {lat: this.latitude, lng: this.longitude},
             zoom: 16
           });
       })
         .catch((error: any) => console.log(error));


      } else {
         await this.geolocation.getCurrentPosition().then((resp) => {
            this.latitude = resp.coords.latitude;
            this.longitude = resp.coords.longitude;
            this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
              center: {lat: this.latitude, lng: this.longitude},
              zoom: 16
            });

            console.log('displayed the map');

          }).catch((error) => {
            console.log('Error getting location', error);
          });
     }

  }





     async addMarker(dtitle, dlongitude, dlatitude, dcontent , dicon,
                     doperationMOpen, doperationMClose, doperationTOpen, doperationTClose, doperationWOpen,
                     doperationWClose, doperationThOpen, doperationThClose, doperationFOpen, doperationFClose,
                     doperationSatOpen, doperationSatClose, doperationSunOpen, doperationSunClose,
                     dphone, dstreet , dspecialNote) {
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

       const contentString =
         '<div id="content">' +
         '<div id= "siteNotice" ' +
         '</div>' +
         '<h1 id="firstHeading" class="firstHeading">' + dtitle  + '</h1>' +
         '<div id="bodyContent">' +
         '<p>' + dcontent + '</p>' +
         '</div>' +
         '<div id = "phone">' + 'Phone: ' + dphone + '</div>' +
         '<div id= "street">' + 'Street Address: ' + dstreet + '</div>' +

         '<div id = "operation">' + 'Hours of Operation' + '</div>' +
         '<div id = "monday">' + 'Monday: ' + doperationMOpen + '-' + doperationMClose + '</div>' +
         '<div id = "tuesday">' + 'Tuesday: ' + doperationTOpen + '-' + doperationTClose + '</div>' +
         '<div id = "wednesday">' + 'Wednesday: ' + doperationWOpen + '-' + doperationWClose + '</div>' +
         '<div id = "thursday">' + 'Thursday: ' + doperationThOpen + '-' + doperationThClose + '</div>' +
         '<div id = "friday">' + 'Friday: ' + doperationFOpen + '-' + doperationFClose + '</div>' +
         '<div id = "saturday">' + 'Saturday: ' + doperationSatOpen + '-' + doperationSatClose + '</div>' +
         '<div id = "sunday">' + 'Sunday: ' + doperationSunOpen + '-' + doperationSunClose + '</div>' +
         '<div id = "blank">' + '<p>' +  '       ' + '</p>'  + '</div>' +
         '<div id = "specialNote">' + 'Admin Note: ' + dspecialNote + '</div>' +
         '</div>';

       await google.maps.event.addListener(marker, 'click', function() {
           const infowindow = new google.maps.InfoWindow({
             content: contentString,
             maxWidth: 300
           });
           infowindow.open(this.map, marker);
         });
     }

  }
