import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarSettingsPageRoutingModule } from './calendar-settings-routing.module';

//import { CalendarSettingsPage } from './calendar-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarSettingsPageRoutingModule
  ],
  //declarations: [CalendarSettingsPage]
})
export class CalendarSettingsPageModule {}
