import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LearningCenterPageRoutingModule } from './learning-center-routing.module';

import { LearningCenterPage } from './learning-center.page';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, FirestoreSettingsToken, AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LearningCenterPageRoutingModule,
    AngularFireModule.initializeApp(environment),
    AngularFirestoreModule
  ],
  providers: [
    AngularFirestore,
    { provide: FirestoreSettingsToken, useValue: {} }
  ],
  declarations: [LearningCenterPage]
})
export class LearningCenterPageModule {}
