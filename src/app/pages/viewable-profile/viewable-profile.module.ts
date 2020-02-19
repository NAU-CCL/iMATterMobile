import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewableProfilePageRoutingModule } from './viewable-profile-routing.module';

import { ViewableProfilePage } from './viewable-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewableProfilePageRoutingModule
  ],
  declarations: [ViewableProfilePage]
})
export class ViewableProfilePageModule {}
