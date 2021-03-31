import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewChallengePage } from './viewChallenge.page';

const routes: Routes = [
    {
        path: '',
        component: ViewChallengePage
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ViewChallengePageRoutingModule {}
