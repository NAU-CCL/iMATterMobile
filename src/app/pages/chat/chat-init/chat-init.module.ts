import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatInitPageRoutingModule } from './chat-init-routing.module';

import { ChatInitPage } from './chat-init.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatInitPageRoutingModule
  ],
  declarations: [ChatInitPage]
})
export class ChatInitPageModule {}
