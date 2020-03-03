import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecoveryCodePage } from './recovery-code.page';

const routes: Routes = [
  {
    path: '',
    component: RecoveryCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecoveryCodePageRoutingModule {}
