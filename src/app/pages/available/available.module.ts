import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AvailablePageRoutingModule } from './available-routing.module';

import { AvailablePage } from './available.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AvailablePageRoutingModule
  ],
  declarations: [AvailablePage]
})
export class AvailablePageModule {}
