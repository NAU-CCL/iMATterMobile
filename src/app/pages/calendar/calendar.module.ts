import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarPage } from './calendar.page';

import { NgCalendarModule  } from 'ionic2-calendar';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: CalendarPage }]),
    NgCalendarModule
  ],
  declarations: [CalendarPage]
})
export class CalendarPageModule {}
