import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewableProfilePage } from './viewable-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ViewableProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewableProfilePageRoutingModule {}
