import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestAccessPage } from './request-access.page';

const routes: Routes = [
  {
    path: '',
    component: RequestAccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestAccessPageRoutingModule {}
