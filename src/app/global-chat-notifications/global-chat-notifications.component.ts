import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {ChatService} from '../services/chat/chat-service.service'
import { DocumentChangeAction, DocumentReference } from '@angular/fire/firestore';
import {autoChat} from '../pages/chat/chatInterface';
import { Storage } from '@ionic/storage';
import { _topicWithOptions } from 'firebase-functions/lib/providers/pubsub';

@Component({
  selector: 'app-global-chat-notifications',
  templateUrl: './global-chat-notifications.component.html',
  styleUrls: ['./global-chat-notifications.component.scss'],
})
export class GlobalChatNotificationsComponent implements OnInit {

  private autoChatsObs: Observable<DocumentChangeAction<autoChat>[]>;
  public currentAutoChats: autoChat[]= [];
  private autoChatArrayLen: number = 0;
  private autoChatAnimationTime = 6; // autochats disapeer after 6 seconds
  private userCode;
  constructor( private chatService: ChatService,
               private storage: Storage) { }

  ngOnInit() {
    
    
    // Subscribe to the observable which emits new auto chats.
    // and get the current userCode
    this.initializeChatNotifs();
    
  }


  // Take an auto chat document and add it to an array of auto chats to display as notifications.
  /// User code is loaded before this is ever called.
  displayAutoChat( newAutoChat:autoChat )
  {
    if( this.userCode != newAutoChat.userID)
    {
      this.currentAutoChats.push(newAutoChat);
    
      console.log(`Pushing new auto chat ${JSON.stringify(newAutoChat)}`);
  
      setTimeout( ()=>{
            // Remove the first item in the array after about 6 seconds.
            this.currentAutoChats.shift();
          }, 6100 );
    }

  }


  // Delete a chat from the chat array, is subsequently removed from the DOM.
  removeJoinedChatNotif( chatToRemoveEl )
  {
    // Remove the chat from the auto chat array. The chat at the end 
    // of the array is always the one being clicked so we can use pop to remove it.
    this.currentAutoChats.pop();
  }

  calculateTopMargin()
  {
    console.log(`${this.autoChatArrayLen}px`);
    return `${this.autoChatArrayLen}px`;
  }


  async initializeChatNotifs()
  {
    console.log(`Getting user code and waiting`);
    await this.storage.get('userCode').then((userCode) => {
      this.userCode = userCode;
    });
    console.log(`User code got`);

    console.log(`subscribing to auto chats.`);
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
  }
}     


