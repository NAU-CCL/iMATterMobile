import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.page.html',
  styleUrls: ['./new-review.page.scss'],
})
export class NewReviewPage implements OnInit {

  constructor(private storage: Storage,
    private router: Router,
    private afs: AngularFirestore,
    private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
  }


  ionViewWillEnter()
  {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    console.log(`Resource ID is: ${id}`)
  }

}
