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

    @ViewChild('mapElement', {static: false}) mapNativeElement;
    constructor(private geolocation: Geolocation) { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
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
        this.geoMaps(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent);
        console.log(this.dlongitude);

      });
    });
  }




     geoMaps(dtitle , dlongitude, dlatitude, dcontent)
     {
       this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = resp.coords.latitude;
          this.longitude = resp.coords.longitude;
          const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
            center: {lat: this.latitude, lng: this.longitude},
            zoom: 16
          });
          this.createNewMarker(this.dtitle, this.dlongitude, this.dlatitude, this.dcontent,this.map);
/*
          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });
          **/
        }).catch((error) => {
          console.log('Error getting location', error);
        });
     }

     createNewMarker(dtitle, dlongitude, dlatitude, dcontent,map)
     {
       /*location object*/
       const pos = {
         lat: this.dlatitude,
         lng: this.dlongitude
       };
    //   map.setCenter(pos);
       const icon = {
         url: 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/locationIcon%2Flocationpin.png?alt=media&token=a04dd171-e687-4504-a9ae-53eb1cb3986f', // image url
         scaledSize: new google.maps.Size(80, 80), // scaled size
       };
       const marker = new google.maps.Marker({
         position: pos,
         map: map,
         title: this.dtitle,
         icon: icon
       });
       const contentString = dcontent;
       const infowindow = new google.maps.InfoWindow({
         content: contentString,
         maxWidth: 400
       });

     }

  }
