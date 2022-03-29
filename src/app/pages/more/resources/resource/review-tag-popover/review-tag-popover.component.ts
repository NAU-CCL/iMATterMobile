import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-review-tag-popover',
  templateUrl: './review-tag-popover.component.html',
  styleUrls: ['./review-tag-popover.component.scss'],
})
// This component is used as a popup on individual resource pages in order to display information about a specific review tag.
export class ReviewTagPopoverComponent implements OnInit {

  constructor(public navParams: NavParams) { }

  ngOnInit() {

    console.log(`ID CLICKED WAS ${this.navParams.get('id')}`); // For some reason when you pass params to a popover you need to use navParams to access the data. Could only find a stack overflow post explaining why. Official docs had nothing
    //let tag1 : HTMLElement = document.querySelector('#')
  }


}
