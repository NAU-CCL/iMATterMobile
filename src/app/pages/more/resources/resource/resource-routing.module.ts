import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResourcePage } from './resource.page';

const routes: Routes = [
  {
    path: '',
    component: ResourcePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourcePageRoutingModule {

}