import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Component, OnInit } from '@angular/core';
import { LocationService, Location } from 'src/app/services/resource.service';
import { FormControl } from '@angular/forms';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';



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

  // Each index repesents 1 of 5 stars on the reivew page. False means the star is not filled.
  public rating_array = [false,false,false,false,false]
  // The users 1-5 star rating of the rescource, contains an int between 1-5.
  public selected_rating: number;


  constructor(private storage: Storage,
    private router: Router,
    private afs: AngularFirestore,
    private activatedRoute: ActivatedRoute,
    private locationService: LocationService,
    private reactMod : ReactiveFormsModule,
    private formsMod: FormsModule) { }

    
  ngOnInit() {
  }

  name = new FormControl('');

  ionViewWillEnter()
  {
    const resource_id = this.activatedRoute.snapshot.paramMap.get('id');

    this.locationService.getLocation(resource_id).subscribe( (resource) => { this.resource = resource });

    console.log(this.resource);
  }

  // Takes an index that represents which star the user clicked to rate the resource.
  // Index starts at 0 which represents star 1 and index 4 reps star 5.
  updateRatingStars( starIndex: number )
  {

    this.rating_array = [false,false,false,false,false]

    for( let index = 0; index < this.rating_array.length ; index++ )
    {
      if( index <= starIndex )
      {
        this.rating_array[index] = true;
      }
    }

    this.selected_rating = starIndex + 1;

  }
  
}
