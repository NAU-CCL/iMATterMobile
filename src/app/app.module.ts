import { NgModule } from '@angular/core';
import { Cordova, IonicNativePlugin, Plugin } from '@ionic-native/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, FirestoreSettingsToken, AngularFirestore } from '@angular/fire/firestore';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

import { HttpClientModule } from '@angular/common/http';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ShowMessagePageModule } from './pages/answer/show-message/show-message.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BnNgIdleService } from 'bn-ng-idle';
import {Device} from '@ionic-native/device/ngx';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
      IonicModule.forRoot(),
      RouterModule.forRoot([]),
	  HttpClientModule,
      IonicStorageModule.forRoot({
		  name: 'exdb'
	  }),
      AppRoutingModule,
      AngularFirestoreModule,
      AngularFireModule.initializeApp(environment)],
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
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FirestoreSettingsToken, useValue: {} },
    InAppBrowser,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
