import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForumThreadPageRoutingModule } from './forum-thread-routing.module';

import { ForumThreadPage } from './forum-thread.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForumThreadPageRoutingModule
  ],
  declarations: [ForumThreadPage]
})
export class ForumThreadPageModule {}
