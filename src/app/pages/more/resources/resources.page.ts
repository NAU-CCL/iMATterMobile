import { AfterViewInit, Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import * as firebase from 'firebase/app';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { compilerSetStylingMode } from '@angular/compiler/src/render3/view/styling_state';
import { forEach } from '@angular-devkit/schematics';
import { LocationService, Location } from 'src/app/services/resource.service';
import { Observable } from 'rxjs';
import * as internal from 'assert';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { time } from 'console';
import { escapeLeadingUnderscores } from 'typescript';
import { AnalyticsService } from 'src/app/services/analyticsService.service';



declare var google;

@Component({
    selector: 'app-resources',
    templateUrl: './resources.page.html',
    styleUrls: ['./resources.page.scss'],
})

export class ResourcesPage implements OnInit, AfterViewInit {
    public locations: Observable<Location[]>;
    public locationList: Location[] = [];
    public filteredList: Location[] = [];
    public locationTypes = [];
    public mapLoaded: boolean = false;

    latitude: any;
    longitude: any;
    userLocation: string;
    userLocationHolder: string;
    userProfileID: any;
    docId: any;

    map: any;
    icon: any;
    pos: any;
    position: any;
    bar: string;
    foo: string;

    dicon: any;

    public currentLat;
    public currentLong;
    public iosPlatform: boolean;

    @ViewChild('mapElement', { static: false }) mapNativeElement;

    constructor(public zone: NgZone,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
        public afs: AngularFirestore,
        private storage: Storage,
        private inAppBrowser: InAppBrowser,
        public locationService: LocationService,
        private analyticsService: AnalyticsService) {
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
                        this.saveUserLocation(this.userLocationHolder).then(res => { this.initializeLocations();} );
                    });
                });
            }

        });

        this.storage.get('platform').then( (val) => {
            this.iosPlatform = val === 'ios';
        } );

    }


    async saveUserLocation(userLocationHolder) {
        this.userLocation = this.userLocationHolder;
        await this.geolocation.getCurrentPosition().then((resp) => {
            console.log('RESP: ' + resp);
            this.currentLat = resp.coords.latitude;
            this.currentLong = resp.coords.longitude;
        }).catch((error) => {
            console.log('Error getting location', error);
        });
        console.log('inside saveUserLocation' + this.currentLat + ', ' + this.currentLong);
    }

    // Get resource locations from db and save them into a local array of objects.
    async getLocations() {
        this.locations = this.locationService.getLocations();
        this.locations.forEach((locationList => {
            locationList.forEach((location => {
                var streetArray = location.street.split(" "); // Stree is actually location address. Split by space to seperate address components.
                streetArray = streetArray.slice(Math.max(streetArray.length - 3, 1)); 
                streetArray.pop()
                location.cityState = streetArray.join(" ");

                console.log(`User lat ${this.latitude} long ${this.longitude}`);

                console.log(`Location lat ${location.latitude} long ${location.longitude}`);
                location.distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(this.latitude, this.longitude), // USer coordinates
                    new google.maps.LatLng(location.latitude, location.longitude) // Resource Coordinates
                )

                // Handle type arrays
                if (typeof location.type === 'object') {
                    location.type.forEach((type => {
                        if (!this.locationTypes.includes(type)) {
                            this.locationTypes.push(type)
                        }
                    }));
                }
                // handle types as strings 
                else { 
                    if (!this.locationTypes.includes(location.type)) {
                        this.locationTypes.push(location.type)
                    }
                }
            }));
            locationList.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
            this.locationList = locationList;
            this.filteredList = this.locationList;
        }));
    }


    ngAfterViewInit(): void {

    }

    /*
    ionViewDidEnter() {
        this.ngOnInit();
        this.initializeLocations();
    }
    */

    async initializeLocations() {
        await this.geoMaps(this.userLocation); // Set the user location variables and load the map.

        await this.getLocations(); // Fill the locations array. Requires the map to be loaded first.

        this.locations.forEach((array) => {
            array.forEach((location) => {
                this.addMarker(location);
            });
        });

    }

    async geoMaps(userLocation) {
        await this.geolocation.getCurrentPosition().then((resp) => {
            this.latitude = resp.coords.latitude;
            this.longitude = resp.coords.longitude;
            console.log(this.latitude);
            console.log(this.longitude);
            this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
                center: { lat: this.latitude, lng: this.longitude },
                zoom: 16
            });

            console.log('displayed the map');

            this.mapLoaded = true; 

        }).catch((error) => {
            console.log('ERROR LOADING MAP ', error);
        });
    }


    async addMarker(location) {
        const pos = {
            lat: location.latitude,
            lng: location.longitude
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
            title: location.title,
            icon: this.icon
        });

        const contentString = '<div id="content">' +
            '<div id= "siteNotice">' +
            '</div>' +
            '<h1 id="firstHeading" class="firstHeading">' + location.title + '</h1></div>';
        await google.maps.event.addListener(marker, 'click', function () {
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 300
            });
            infowindow.open(this.map, marker);
        });
    }

    expandLocationCard(this: HTMLElement) {
        console.log(this.childNodes);
        const children: Element[] = Array.from(this.children);
        console.log(this.lastChild);
        console.log(this.id);

        children.forEach(child => {
            if (children.indexOf(child) !== 0) {

                if (child.classList.contains('ion-hide')) {
                    child.classList.remove('ion-hide');
                } else {
                    child.classList.add('ion-hide');
                }
            }
        });

        const locationList = document.getElementsByTagName('ion-card');
        Array.from(locationList).forEach(element => {
            const otherChildren: Element[] = Array.from(element.children);
            otherChildren.forEach(child => {
                if (otherChildren.indexOf(child) !== 0) {
                    if (!child.classList.contains('ion-hide') && element.id !== this.id) {
                        child.classList.add('ion-hide');
                    }
                }
            });
        });
    }

    moveToLocation(locLat, locLong) {
        this.map.setCenter({ lat: locLat, lng: locLong });
    }

    filter() {
        const filter = (document.getElementById("filterValue") as HTMLInputElement)
        if (filter.value == 'all') {
            this.filteredList = this.locationList;
        } else {
            this.filteredList = this.locationList.filter(e => e.type == filter.value || e.type.includes(filter.value));
        }
    }

    filterResources( event )
    {
        console.log('called filter queues in resource page. ');

        const searchInput = event.target.value;

        /*
        let filterDropDown = document.getElementsByClassName('filter-option-all') as HTMLCollectionOf<HTMLOptionElement>;
        filterDropDown[0].selected = true;
        */
       
        // Dont run search if user cleared their search query.
        if (searchInput) {
            // Iterate through array of questions using the filter function which removes an element when we return false.
            // Allow users to search based on resource NAME or CITY/STATE
            this.filteredList = this.locationList.filter(currentLoc => {
                    // indexOf returns the index where the given string starts. For example "eggs are good".indexOf("good") would return 9 since index 9 is where "good" starts in the string.
                    return (currentLoc.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1 ||
                    currentLoc.cityState.toLowerCase().indexOf(searchInput.toLowerCase()) > -1);
                });
        }
        // If user deletes their search query, show all results again.
        else
        {
            this.filteredList = this.locationList;
        }
    }

    logIndividualResourceClicks()
    {
  
  
      this.analyticsService.updateClicks('numOfClickIndividualResource');
  
    }


}
