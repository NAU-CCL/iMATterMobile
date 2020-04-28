import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarSettingsPage } from './calendar-settings.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarSettingsPageRoutingModule {}
