import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestAccessPageRoutingModule } from './request-access-routing.module';

import { RequestAccessPage } from './request-access.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestAccessPageRoutingModule
  ],
  declarations: [RequestAccessPage]
})
export class RequestAccessPageModule {}
