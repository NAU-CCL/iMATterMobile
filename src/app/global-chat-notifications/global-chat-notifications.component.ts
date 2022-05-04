import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {ChatService} from '../services/chat/chat-service.service'
import { DocumentChangeAction, DocumentReference } from '@angular/fire/firestore';
import {autoChat} from '../pages/chat/chatInterface'

@Component({
  selector: 'app-global-chat-notifications',
  templateUrl: './global-chat-notifications.component.html',
  styleUrls: ['./global-chat-notifications.component.scss'],
})
export class GlobalChatNotificationsComponent implements OnInit {

  private autoChatsObs: Observable<DocumentChangeAction<autoChat>[]>;
  public currentAutoChats: autoChat[]= [];

  constructor( private chatService: ChatService) { }

  ngOnInit() {
    this.autoChatsObs = this.chatService.getAutoChats();
    this.autoChatsObs.subscribe((autoChatDocChangeActionArray)=> {
      autoChatDocChangeActionArray.forEach( (autoChatDocChangeAction) => {
        // Payload is an angular firestore property as is the document change action array type. Payload is a property of document change action.
        // getAutoChats returns an observable that emits a DocumentChangeActionArray, we then call foreach on that array to get individual DocumentChangeActions which contains two properties,
        // payload and type. Payload returns a DocumentChange object which is a type that is original to firestore. ie read google firestore documentation for DocumentChange information as it works the same in angular.
        // For information on DocumentChangeAction and DocumentChangeActionArray read the documentation found in the angular fire git repository. There is a doc folder in that repository with another folder called firestore
        // which contains the documentation you need.
       this.displayAutoChat( autoChatDocChangeAction.payload.doc.data() )
      } );
    } );

    //this.chatService.getAutoChatsTest();
  }


  // Take an auto chat document and add it to an array of auto chats to display as notifications.
  displayAutoChat( newAutoChat:autoChat )
  {
    this.currentAutoChats.push(newAutoChat);
  }


  removeJoinedChatNotif( chatToRemoveEl )
  {

  }

}
