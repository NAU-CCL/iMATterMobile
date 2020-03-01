import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';


declare var google;

@Component({
  selector: 'app-resources',
  templateUrl: './resources.page.html',
  styleUrls: ['./resources.page.scss'],
})

export class ResourcesPage implements OnInit, AfterViewInit {
    latitude: any;
    longitude: any;
    @ViewChild('mapElement', {static: false}) mapNativeElement;
    constructor(private geolocation: Geolocation) { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
      this.geolocation.getCurrentPosition().then((resp) => {
         this.latitude = resp.coords.latitude;
         this.longitude = resp.coords.longitude;
         const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
           center: {lat: 35.185261, lng: -111.662041},
           zoom: 16
         });
         /*location object*/
         const pos = {
           lat: this.latitude,
           lng: this.longitude
         };
         map.setCenter(pos);
         const icon = {
           url: 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/locationIcon%2Flocationpin.png?alt=media&token=a04dd171-e687-4504-a9ae-53eb1cb3986f', // image url
           scaledSize: new google.maps.Size(80, 80), // scaled size
         };
         const marker = new google.maps.Marker({
           position: pos,
           map: map,
           title: 'Clinc',
           icon: icon
         });
         const contentString = '<div id="content">' +
             '<div id="siteNotice">' +
             '</div>' +
             '<h1 id="firstHeading" class="firstHeading">I AM HERE .................</h1>' +
             '<div id="bodyContent">' +
             '<img src="assets/icon/user.png" width="200">' +
             '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
             'sandstone rock formation in the southern part of the ' +
             'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) ' +
             'south west of the nearest large town, Alice Springs; 450&#160;km ' +
             '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major ' +
             'features of the Uluru - Kata Tjuta National Park. Uluru is ' +
             'sacred to the Pitjantjatjara and Yankunytjatjara, the ' +
             'Aboriginal people of the area. It has many springs, waterholes, ' +
             'rock caves and ancient paintings. Uluru is listed as a World ' +
             'Heritage Site.</p>' +
             '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
             'https://en.wikipedia.org/w/index.php?title=Uluru</a> ' +
             '(last visited June 22, 2009).</p>' +
             '</div>' +
             '</div>';
         const infowindow = new google.maps.InfoWindow({
           content: contentString,
           maxWidth: 400
         });
         marker.addListener('click', function() {
           infowindow.open(map, marker);
         });
       }).catch((error) => {
         console.log('Error getting location', error);
       });
     }

  }
