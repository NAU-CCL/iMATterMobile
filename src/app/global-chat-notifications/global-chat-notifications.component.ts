import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {ChatService} from '../services/chat/chat-service.service'
import { DocumentChangeAction, DocumentReference } from '@angular/fire/firestore';
import {autoChat} from '../pages/chat/chatInterface';
import { Storage } from '@ionic/storage';
import { _topicWithOptions } from 'firebase-functions/lib/providers/pubsub';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError} from '@angular/router';

@Component({
  selector: 'app-global-chat-notifications',
  templateUrl: './global-chat-notifications.component.html',
  styleUrls: ['./global-chat-notifications.component.scss'],
})
export class GlobalChatNotificationsComponent implements OnInit {

  private autoChatsObs: Observable<DocumentChangeAction<autoChat>[]>;
  public currentAutoChats: autoChat[]= [];
  private autoChatArrayLen: number = 0;
  private userCode;
  public autoChatLifeSpan: number; // How long to show an auto chat before it auto disappears.
  private maxOnScreenAutoChats: number; // Max number of auto chats to show to the user.
  public currentRoute;
  public userIsInChat: boolean;
  private chatURL = "/tabs/chat";

  constructor( private chatService: ChatService,
               private storage: Storage,
               private router: Router) { }

  ngOnInit() {
    
    
    // Subscribe to the observable which emits new auto chats.
    // and get the current userCode
    this.initializeChatNotifs();
    // Function that subscribes to router events so we know what page the user is looking at at all times.
    this.watchForRouterEvents();
    
    
  }

  watchForRouterEvents()
  {
    this.router.events.subscribe((event: Event) => {

      if (event instanceof NavigationEnd) {
          // Hide progress spinner or progress bar
          this.currentRoute = event.url;    
          // /tabs/chat is what we want.      
          console.log(`The current url is ${event}`);

          if( this.currentRoute === this.chatURL)
          {
            console.log(`User is in chat room now.`);
            this.userIsInChat = true;
          }
          else
          {
            this.userIsInChat = false;
          }
      }
    });
  }


  // Take an auto chat document and add it to an array of auto chats to display as notifications.
  /// User code is loaded before this is ever called.
  displayAutoChat( newAutoChat:autoChat )
  {
    if( this.userCode != newAutoChat.userID && this.currentAutoChats.length <= this.maxOnScreenAutoChats)
    {
      this.currentAutoChats.push(newAutoChat);
    
      console.log(`Pushing new auto chat ${JSON.stringify(newAutoChat)}`);
  
          
      setTimeout( ()=>{
            // Remove the first item in the array after whatever number of seconds are set in the admin website.
            // Auto chats animate themselves on screen but we dont want to waste time rendering them if theyre invisible so we
            // need to deleete them when the leave screen animation has completed.
            this.currentAutoChats.shift();
          },  (this.autoChatLifeSpan * 1000) + 200 );
        
    }

  }


  // Delete a chat from the chat array, is subsequently removed from the DOM.
  removeJoinedChatNotif( autoChatElement: HTMLDivElement)
  {
    // Change the animation attributes of the element to animate it leaving the screen when the user closes it.
    autoChatElement.style.animationName = 'close-message';
    autoChatElement.style.animationTimingFunction = 'ease-out';
    autoChatElement.style.animationFillMode = 'forwards';
    autoChatElement.style.animationDuration = '.25s';

    setTimeout( ()=>{
      // Remove the chat from the auto chat array. The chat at the end 
      // of the array is always the one being clicked so we can use pop to remove it.
      this.currentAutoChats.pop();
    },  550);
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

    let chatSettingsDoc = await this.chatService.getAutoChatSettings();


    console.log(`Getting auto chat settings and waiting`);

   
    await chatSettingsDoc.get().then( (docSnap) =>{
      let chatSettingsObject = docSnap.data();
      console.log(`SETTINGS OBJECT ${JSON.stringify(chatSettingsObject)}`);
      // How long to show an auto chat before it auto disappears. Convert to milliseconds by multiplying by 1000
      // Add extra 200 milliseconds to ensure that animation finished running before chat is removed.
      this.autoChatLifeSpan = chatSettingsObject.autoChatLifeSpanInSeconds; 
      this.maxOnScreenAutoChats = chatSettingsObject.maxAutoChatsOnScreen;
    })
    
    

    console.log(`Finished getting auto chat settings. Time out${this.autoChatLifeSpan} max onsc ${this.maxOnScreenAutoChats}`);
    
    console.log(`User code got`);

    console.log(`subscribing to auto chats.`);

    // Get an observable of auto chats from the chat service.
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

  navigateUserToChat( autoChatElement: HTMLDivElement )
  {
    // If the user is not already in the chat room, navigate them to it.
    if(this.currentRoute != this.chatURL)
    {
      this.removeJoinedChatNotif(autoChatElement);

      this.router.navigateByUrl(this.chatURL);
    }
    else
    {
      this.removeJoinedChatNotif(autoChatElement);
    }
  }
}     


