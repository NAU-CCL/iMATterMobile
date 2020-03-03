import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-chat-init',
  templateUrl: './chat-init.page.html',
  styleUrls: ['./chat-init.page.scss'],
})
export class ChatInitPage {

  constructor( private router: Router, private storage: Storage) {

    this.storage.get('cohort').then((val) => {
      if (val) {
        this.router.navigate(['/tabs/chat/', val]);
      }
    });
  }
}
