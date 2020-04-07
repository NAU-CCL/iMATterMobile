import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {ChatService} from '../../../services/chat/chat-service.service';

@Component({
  selector: 'app-chat-init',
  templateUrl: './chat-init.page.html',
  styleUrls: ['./chat-init.page.scss'],
})
export class ChatInitPage {

  constructor( private router: Router, private storage: Storage, private chatService: ChatService) {

    this.storage.get('cohort').then((val) => {
      if (val) {
        this.router.navigate(['/tabs/chat/', val]);
        this.chatService.iterateChats(val, 'ngOnInit');
      }
    });
  }
}
