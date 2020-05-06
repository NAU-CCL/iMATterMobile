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
    doperationSunday: string;
    doperationWeekday: string;
    doperationSaturday: string;
    userLocation: string;
    userLocationHolder: string;
    userProfileID: any;
    specialNote: any;

    map: any;
    icon: any;
    pos: any;
    position: any;
    bar:string;
    foo:string;

    dicon: any;

    @ViewChild('mapElement', {static: false}) mapNativeElement;
    constructor(public zone: NgZone,
                private geolocation: Geolocation,
                private nativeGeocoder: NativeGeocoder,
                public afs: AngularFirestore,
                private storage: Storage,) { }

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
                    console.log("hheeeeeeeeeeeeeeee");


                  });
                });
              }
            });

    }


    saveUserLocation(userLocationHolder)
    {
      this.userLocation = this.userLocationHolder;
      console.log("inside saveUserLocation" + this.userLocation);


    }

    ngAfterViewInit(): void {

     }

     ionViewDidEnter()
     {
       this.initializeLocations();
     }

     async initializeLocations ()
     {
       await this.geoMaps(this.userLocation);
      await this.getLocations();
     }

     async getLocations ()
     {

      await firebase.firestore().collection("resourceLocations").get()
      .then(querySnapshot => {
        this.dtitle = '';
        this.dlongitude = 0  ;
        this.dlatitude = 0 ;
        this.dcontent = '' ;
        this.dicon = '';
        this.dstreet = '';
        this.doperationWeekday = '';
        this.doperationSaturday = '';
        this.dphone = '';
        this.doperationSunday = '';
        this.dspecialNote = '';

        querySnapshot.docs.forEach( async doc => {
        this.dtitle = doc.get("title");
        this.dlongitude = Number (doc.get("longitude"));
        this.dlatitude = Number( doc.get("latitude"));
        this.dcontent = doc.get("content");
        this.dicon = doc.get("type");
        this.dstreet = doc.get("street");
        this.doperationSunday = doc.get("operationSunday");
        this.doperationSaturday = doc.get("operationSaturday");
        this.dphone = doc.get("phone");
        this.doperationWeekday = doc.get("operationMF");
        this.dspecialNote = doc.get("special");

        this.addMarker(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent, this.dicon,
                        this.doperationWeekday, this.doperationSaturday, this.doperationSunday,
                      this.dphone, this.dstreet , this.dspecialNote);


        console.log(this.dlongitude);
        console.log(this.dicon);


      });
    });
  }




     async geoMaps(userLocation)
     {


       if(this.userLocation !== '')
       {
         console.log("enteredt user location thingy ");

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


      }

     else
     {
         await this.geolocation.getCurrentPosition().then((resp) => {
            this.latitude = resp.coords.latitude;
            this.longitude = resp.coords.longitude;
            this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
              center: {lat: this.latitude, lng: this.longitude},
              zoom: 16
            });

            console.log("displayed the map");

          }).catch((error) => {
            console.log('Error getting location', error);
          });
     }

  }





     async addMarker(dtitle, dlongitude, dlatitude, dcontent , dicon,
       doperationWeekday, doperationSaturday, doperationSunday, dphone, dstreet , dspecialNote )
     {
       console.log('added pin');

       const pos = {
         lat: this.dlatitude,
         lng: this.dlongitude
       };


       if (this.dicon === "hospital")
       {
         this.icon = {
           url: 'https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/locationIcon%2FhospitalPin.png?alt=media&token=f1c91506-8a91-4021-9e89-2549b257f373', // image url
           scaledSize: new google.maps.Size(80, 80), // scaled size
         };

       }else if (this.dicon === "clinic")
       {
         this.icon = {
           url: 'https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/locationIcon%2Flocationpin.png?alt=media&token=d3777314-2607-4d4d-991f-638feed705d2', // image url
           scaledSize: new google.maps.Size(80, 80), // scaled size
         };
       }
       else if (this.dicon === "therapy")
       {
         this.icon = {
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
         '<div id="content">'+
         '<div id= "siteNotice" ' +
         '</div>' +
         '<h1 id="firstHeading" class="firstHeading">' + dtitle  + '</h1>' +
         '<div id="bodyContent">' +
         '<p>' + dcontent + '</p>' +
         '</div>'+
         '<div id = "phone">'+ 'Phone: ' + dphone+ '</div>'+
         '<div id= "street">'+ 'Street Address: ' + dstreet + '</div>' +

         '<div id = "operation">'+ 'Hours of Operation' + '</div>' +
         '<div id = "weekday">'+ 'Monday - Friday: '+ doperationWeekday + '</div>'+
         '<div id = "saturday">'+ 'Saturday: ' +  doperationSaturday + '</div>'+
         '<div id = "sunday">'+ 'Sunday: ' + doperationSunday + '</div>'+
         '<div id = "blank">'+ '<p>'+  '       ' + '</p>'  + '</div>' +
         '<div id = "specialNote">'+ 'Admin Note: ' + dspecialNote+ '</div>'+
         '</div>';

         await google.maps.event.addListener(marker, 'click', function(){
           var infowindow = new google.maps.InfoWindow({
             content: contentString,
             maxWidth: 300
           });
           infowindow.open(this.map, marker);
         });
     }

  }
