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
    dlongitude: string;
    dlatitude: string;
    dcontent: string;
    dphone: string;
    dstreet: string;
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
       this.geoMaps(this.userLocation);
       this.getLocations();

     }






     getLocations ()
     {

      firebase.firestore().collection("resourceLocations").get()
      .then(querySnapshot => {

        querySnapshot.docs.forEach(doc => {
        this.dtitle = doc.get("title");
        this.dlongitude = doc.get("longitude");
        this.dlatitude = doc.get("latitude");
        this.dcontent = doc.get("content");
        this.dicon = doc.get("type");
        this.dstreet = doc.get("street");
        this.doperationSunday = doc.get("operationSunday");
        this.doperationSaturday = doc.get("operationSaturday");
        this.dphone = doc.get("phone");
        this.doperationWeekday = doc.get("operationMF");

        this.addMarker(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent, this.dicon);


        console.log(this.dlongitude);
        console.log(this.dicon);


      });
    });
  }



/*
     geoMaps()
     {
       this.geolocation.getCurrentPosition().then((resp) => {
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


     **/


     geoMaps(userLocation)
     {

console.log("here we are in the geomaps" + this.userLocation);







       if(this.userLocation !== '')
       {
         console.log("enteredt user location thingy ");

         this.nativeGeocoder.forwardGeocode(this.userLocation)
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

/*

          let options: NativeGeocoderOptions = {
              useLocale: true,
              maxResults: 5
          };

          this.nativeGeocoder.reverseGeocode(52.5072095, 13.1452818, options)
            .then((result: NativeGeocoderResult[]) => console.log(JSON.stringify(result[0])))
            .catch((error: any) => console.log(error));

          this.nativeGeocoder.forwardGeocode('Berlin', options)
            .then((result: NativeGeocoderResult[]) => console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude))
            .catch((error: any) => console.log(error));

         this.userLocationHolder = Number(this.userLocationHolder);
**/
/*
             this.nativeGeocoder.geocode({ 'address': this.userLocation }, (results, status) => {
               if (status === 'OK') {
                 this.position = {
                   "lat": results[0].geometry.location.lat(),
                   "lng": results[0].geometry.location.lng()
                 }
            //     this.userLat = this.position[0];
              //   this.userLng = this.position[1];
               } else {
                 console.log('Geocode was not successful for the following reason: ' + status);
               }
             });
**/
      }

     else
     {
         this.geolocation.getCurrentPosition().then((resp) => {
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





     addMarker(dtitle, dlongitude, dlatitude, dcontent , dicon)
     {
       console.log('added pin');

       const pos = {
         lat: this.dlatitude,
         lng: this.dlongitude
       };


       if (this.dicon === "hospital")
       {
         this.icon = {
           url: 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/locationIcon%2FhospitalPin.png?alt=media&token=c37b5cb1-efd4-4472-ae79-7f1492930f49', // image url
           scaledSize: new google.maps.Size(80, 80), // scaled size
         };

       }else if (this.dicon === "clinic")
       {
         this.icon = {
           url: 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/locationIcon%2Flocationpin.png?alt=media&token=a04dd171-e687-4504-a9ae-53eb1cb3986f', // image url
           scaledSize: new google.maps.Size(80, 80), // scaled size
         };
       }
       else if (this.dicon === "therapy")
       {
         this.icon = {
           url: 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/locationIcon%2FtherapyPin.png?alt=media&token=96c62651-a76f-463d-a7cd-4f403eb75f68', // image url
           scaledSize: new google.maps.Size(80, 80), // scaled size
         };
       }

         const marker = new google.maps.Marker({
           position: pos,
           map: this.map,
           title: this.dtitle,
           icon: this.icon
         });

         const contentString =
         '<div id="content">'+
         '<div id= "siteNotice" ' +
         '</div>' +
         '<h1 id="firstHeading" class="firstHeading">' + this.dtitle  + '</h1>' +
         '<div id="bodyContent">' +
         '<p>' + this.dcontent + '</p>' +
         '</div>'+
         '<div id= "street">'+ 'Street Address: ' + this.dstreet + '</div>' +

         '<div id = "operation">'+ 'Hours of Operation' + '</div>' +
         '<div id = "weekday">'+ 'Monday - Friday: '+ this.doperationWeekday + '</div>'+
         '<div id = "saturday">'+ 'Saturday: ' +  this.doperationSaturday + '</div>'+
         '<div id = "sunday">'+ 'Sunday: ' + this.doperationSunday + '</div>'+
         '<div id = "blank">'+ '<p>'+  '       ' + '</p>'  + '</div>' +
         '<div id = "phone">'+ 'Phone: ' + this.dphone+ '</div>'+
         '</div>';

         google.maps.event.addListener(marker, 'click', function(){
           var infowindow = new google.maps.InfoWindow({
             content: contentString,
             maxWidth: 300
           });
           infowindow.open(this.map, marker);
         });
     }

  }
