import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewChallengePageRoutingModule } from './viewChallenge-routing.module';

import { ViewChallengePage } from './viewChallenge.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ViewChallengePageRoutingModule
    ],
    declarations: [ViewChallengePage]
})
export class ViewChallengePageModule {}
