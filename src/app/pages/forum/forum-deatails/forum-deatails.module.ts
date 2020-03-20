import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForumDeatailsPageRoutingModule } from './forum-deatails-routing.module';

import { ForumDeatailsPage } from './forum-deatails.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ForumDeatailsPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [ForumDeatailsPage]
})
export class ForumDeatailsPageModule {}
