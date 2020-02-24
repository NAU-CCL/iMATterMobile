import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HandleUserPagesPageRoutingModule } from './handle-user-pages-routing.module';

import { HandleUserPagesPage } from './handle-user-pages.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HandleUserPagesPageRoutingModule
  ],
  declarations: [HandleUserPagesPage]
})
export class HandleUserPagesPageModule {}
