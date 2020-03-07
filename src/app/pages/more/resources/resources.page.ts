import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
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
    doperationSunday: string;
    doperationWeekday: string;
    doperationSaturday: string;

    map: any;
    icon: any;
    pos: any;

    dicon: any;

    @ViewChild('mapElement', {static: false}) mapNativeElement;
    constructor(private geolocation: Geolocation) { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
      this.geoMaps();
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
         '<div id = "phone">'+ 'Phone :' + this.dphone+ '</div>'+
         '<div id = "operation">'+ 'Hours of Operation' + '</div>' +
         '<div id = "weekday">'+ 'Monday - Friday:'+ this.doperationWeekday + '</div>'+
         '<div id = "weekend">'+ 'Saturday:' +  this.doperationSaturday + '</div>'+
         '<div id = "weekend">'+ 'Sunday:' + this.doperationSunday + '</div>'+
         +
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
