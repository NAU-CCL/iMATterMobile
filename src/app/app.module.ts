import {NgModule} from '@angular/core';
import {Cordova, IonicNativePlugin, Plugin} from '@ionic-native/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy, RouterModule} from '@angular/router';
import {DatePipe} from '@angular/common';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';

import {AppVersion} from '@ionic-native/app-version/ngx';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {AngularFirestore} from '@angular/fire/compat/firestore';

import { AngularFireModule } from '@angular/fire/compat';

import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
// Opens phone app with number entered.
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
// Allows us to open apple or google maps from the app when user clicks an address.
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import {FirebaseX} from '@ionic-native/firebase-x/ngx';

import {HttpClientModule} from '@angular/common/http';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {NativeGeocoder, NativeGeocoderOptions} from '@ionic-native/native-geocoder/ngx';
import {ShowMessagePageModule} from './pages/answer/show-message/show-message.module';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BnNgIdleService} from 'bn-ng-idle';
import {Device} from '@ionic-native/device/ngx';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { FCM } from '@awesome-cordova-plugins/fcm/ngx';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule,
        IonicModule.forRoot(),
        RouterModule.forRoot([]),
        HttpClientModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebase),
        ReactiveFormsModule,
        FormsModule,
        BrowserAnimationsModule,
        IonicStorageModule.forRoot({
                name: 'exdb',
        }),

    ],
    providers: [
        StatusBar,
        SplashScreen,
        Device,
        LocalNotifications,
        AngularFirestore,
        FirebaseX,
        Geolocation,
        NativeGeocoder,
        ShowMessagePageModule,
        FormsModule,
        ReactiveFormsModule,
        BnNgIdleService,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        //{provide: FirestoreSettingsToken, useValue: {}},
        InAppBrowser,
        DatePipe,
        AppVersion,
        CallNumber,
        LaunchNavigator
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
