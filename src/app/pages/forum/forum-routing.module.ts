import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForumPage } from './forum.page';

const routes: Routes = [
  {
    path: '',
    component: ForumPage
  },
  {
    path: 'infoDesk-deatails',
    loadChildren: () => import('./forum-deatails/forum-deatails.module').then( m => m.ForumDeatailsPageModule)
  },
  { path: 'forum-thread/:id', loadChildren: () => import('./forum-thread/forum-thread.module').then( m=>m.ForumThreadPageModule ) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForumPageRoutingModule {}
