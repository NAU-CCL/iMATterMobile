import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';

import {GlobalChatNotificationsComponent} from '../global-chat-notifications/global-chat-notifications.component'


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    TabsPageRoutingModule
  ],
  declarations: [TabsPage, GlobalChatNotificationsComponent]
})
export class TabsPageModule {}
