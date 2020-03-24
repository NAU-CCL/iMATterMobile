import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForumThreadPageRoutingModule } from './forum-thread-routing.module';

import { ForumThreadPage } from './forum-thread.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ForumThreadPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [ForumThreadPage]
})
export class ForumThreadPageModule {}
