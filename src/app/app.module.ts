import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

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

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
      IonicModule.forRoot(),
	  HttpClientModule,
      IonicStorageModule.forRoot({
		  name: 'exdb'
	  }),
      AppRoutingModule,
      AngularFirestoreModule,
      AngularFireModule.initializeApp(environment.firebase)],
  providers: [
    StatusBar,
    SplashScreen,
	LocalNotifications,
    AngularFirestore,
    FirebaseX,
    Geolocation,
    NativeGeocoder,
    ShowMessagePageModule,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FirestoreSettingsToken, useValue: {} },
    InAppBrowser

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
