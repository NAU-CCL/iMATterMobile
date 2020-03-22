import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowMessagePage } from './show-message.page';

const routes: Routes = [
  {
    path: '',
    component: ShowMessagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowMessagePageRoutingModule {}
