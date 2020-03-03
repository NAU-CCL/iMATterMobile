import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatPage } from './chat.page';

const routes: Routes = [
    {
        path: '',
        component: ChatPage
    },
  {
    path: 'chat-init',
    loadChildren: () => import('./chat-init/chat-init.module').then( m => m.ChatInitPageModule)
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ChatPagePageRoutingModule {}
