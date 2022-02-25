import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Component, OnInit } from '@angular/core';
import { LocationService, Location } from 'src/app/services/resource.service';


@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.page.html',
  styleUrls: ['./new-review.page.scss'],
})
export class NewReviewPage implements OnInit {

  resource: Location = {
    id: '',
    title: '',
    content: '',
    addressType: '',
    latitude: 0,
    longitude: 0,
    distance: 0,
    street: '',
    phone: '',
    phone24Hour: null,
    MOpen: '',
    MClose: '',
    TOpen: '',
    TClose: '',
    WOpen: '',
    WClose: '',
    ThOpen: '',
    ThClose: '',
    FOpen: '',
    FClose: '',
    SatOpen: '',
    SatClose: '',
    SunOpen: '',
    SunClose: '',
    special: '',
    type: '',
    hourType: '',
    url: '',
    cityState: '',
  }

  constructor(private storage: Storage,
    private router: Router,
    private afs: AngularFirestore,
    private activatedRoute: ActivatedRoute,
    private locationService: LocationService) { }

  ngOnInit() {
  }


  ionViewWillEnter()
  {
    const resource_id = this.activatedRoute.snapshot.paramMap.get('id');

    this.locationService.getLocation(resource_id).subscribe( (resource) => { this.resource = resource });

    console.log(this.resource);
  }
  
}
