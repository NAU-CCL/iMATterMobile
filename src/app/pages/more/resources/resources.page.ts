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
    map: any;
    icon: any;
    pos: any;

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
        this.addMarker(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent);
        console.log(this.dlongitude);

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

        }).catch((error) => {
          console.log('Error getting location', error);
        });
     }

     addMarker(dtitle, dlongitude, dlatitude, dcontent)
     {
       const pos = {
         lat: this.dlatitude,
         lng: this.dlongitude
       };

       const icon = {
         url: 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/locationIcon%2Flocationpin.png?alt=media&token=a04dd171-e687-4504-a9ae-53eb1cb3986f', // image url
         scaledSize: new google.maps.Size(80, 80), // scaled size
       };

         const marker = new google.maps.Marker({
           position: pos,
           map: this.map,
           title: this.dtitle,
           icon: icon
         });

         const contentString = '<div id="content">'+
         '<div id= "siteNotice" ' +
         '</div>' +
         '<h1 id="firstHeading" class="firstHeading">' + this.dtitle  + '</h1>' +
         '<div id="bodyContent">' +
         '<p>' + this.dcontent + '</p>' +
         '</div>'+
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
