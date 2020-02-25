import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HandleUserPagesPage } from './handle-user-pages.page';

const routes: Routes = [
  {
    path: '',
    component: HandleUserPagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HandleUserPagesPageRoutingModule {}
