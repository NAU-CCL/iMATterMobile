import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

import { ResourcesPage } from './resources.page';

const routes: Routes = [
  {
    path: '',
    component: ResourcesPage
  },
  {
    path: 'suggestions',
    loadChildren: () => import('./suggestions/suggestions.module').then( m => m.SuggestionsPageModule)
  },
  {
    path: ':id',
    // Load the resource component, NOT the resources componenent.
    loadChildren: () => import('./resource/resource.module').then(m => m.ResourcePageModule)
  },
  {
    path: ':id/new-review',
    loadChildren: () => import('./create-review/create-review.module').then( m => m.CreateReviewPageModule)
  },
  {
    path: 'display-reviews',
    loadChildren: () => import('./display-reviews/display-reviews.module').then( m => m.DisplayReviewsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourcesPageRoutingModule {}
