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
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourcesPageRoutingModule {}
