import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowMessagePageRoutingModule } from './show-message-routing.module';

import { ShowMessagePage } from './show-message.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowMessagePageRoutingModule
  ],
  declarations: [ShowMessagePage]
})
export class ShowMessagePageModule {}
