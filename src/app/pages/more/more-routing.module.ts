import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MorePage } from './more.page';

const routes: Routes = [
  {
    path: '',
    component: MorePage
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'report',
    loadChildren: () => import('./report/report.module').then( m => m.ReportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MorePageRoutingModule {}
