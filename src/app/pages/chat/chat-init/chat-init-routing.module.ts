import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatInitPage } from './chat-init.page';

const routes: Routes = [
  {
    path: '',
    component: ChatInitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatInitPageRoutingModule {}
