import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForumDeatailsPage } from './forum-deatails.page';

const routes: Routes = [
  {
    path: '',
    component: ForumDeatailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForumDeatailsPageRoutingModule {}
