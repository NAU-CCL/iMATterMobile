import { CalendarComponent } from 'ionic2-calendar/calendar';
import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import * as moment from 'moment';

import { StorageService, Item } from '../../services/storage.service';

/**
 * This code written with the help of this tutorial:
 * https://devdactic.com/ionic-4-calendar-app/, https://ionicframework.com/docs/api/alert
 *and this stackoverflow:
 *https://stackoverflow.com/questions/56214875/ionic-calendar-event-does-not-load-on-device
 * Used for the general build and functionality of the calendar
 */

@Component({
  selector: 'app-tab3',
  templateUrl: 'calendar.page.html',
  styleUrls: ['calendar.page.scss']
})
export class CalendarPage implements OnInit {
  event = {
    title: '',
    desc: '',
    startTime: '',
    endTime: '',
    allDay: false,
	id: '',
	AMPM: ''
  };
  notifyTime:any;
  notifications: any[] = [];
  days: any[];
  chosenHours: number;
  chosenMinutes: number;
  eventList: any[] = [];

  minDate = new Date().toISOString();

  test = [];
  eventSource = [];
  viewTitle;

  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };

  analytic: Analytics =
{
  page: '',
  userID: '',
  timestamp: '',
  sessionID: ''
}



  private analyticss : string;
  private sessions : Observable<any>;

  length : number;
  private showAddEvent: boolean;



  items: Item[] = [];
  newItem: Item = <Item>{};

  deleteIndex : number;
  notificationIndex : number;
  deleteNotificationIndex : number;
  showEditEvent : boolean;
  
  confirmDeleteEvent: boolean;
  subtractTime: number;
  notificationTime: any;
  testers: number;
 isTwelveHour: number;
 clockType: number;
 
 
  // @ts-ignore
  @ViewChild(CalendarComponent) myCal: CalendarComponent;

  constructor(private localNotifications: LocalNotifications, private alertCtrl: AlertController, @Inject(LOCALE_ID) private locale: string,
              private storage: Storage, private storageService: StorageService,  private afs: AngularFirestore,
     private analyticsService: AnalyticsService, private router: Router) {
		this.notifyTime = moment(new Date()).format();

		this.chosenHours = new Date().getHours();
		this.chosenMinutes = new Date().getMinutes();



		this.days = [
            {title: 'Monday', dayCode: 1, checked: false},
            {title: 'Tuesday', dayCode: 2, checked: false},
            {title: 'Wednesday', dayCode: 3, checked: false},
            {title: 'Thursday', dayCode: 4, checked: false},
            {title: 'Friday', dayCode: 5, checked: false},
            {title: 'Saturday', dayCode: 6, checked: false},
            {title: 'Sunday', dayCode: 0, checked: false}
        ];

	}


  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.showAddEvent = false;
    this.resetEvent();
	this.loadItems();
	this.addView();
  }


  resetEvent() {
    this.event = {
      title: '',
      desc: '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      allDay: false,
	  id: '',
	  AMPM: ''
    };
  }

  addView(){

  //this.analytic.sessionID = this.session.id;
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'calendar';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: Calendar');

          }, err =>{
            console.log('unsucessful added view: calendar');

          });
        });
      });
    }
  });
}


  deleteEvent(){
	  //window.plugins.calendar.deleteEvent(newTitle,eventLocation,notes,startDate,endDate,success,error);
  }

  // Create the right event format and reload source
  addEvent() {
	  this.notificationIndex = Math.floor(Math.random() * 100000000000);
	  if(this.isTwelveHour === 12){
    let eventCopy = {
      title: this.event.title,
      startTime:  new Date(this.event.startTime),
      endTime: new Date(this.event.endTime),
      allDay: this.event.allDay,
      desc: this.event.desc,
	  id: this.notificationIndex,
	  AMPM: this.event.AMPM
    };
	  }
	  else{
		  let eventCopy = {
      title: this.event.title,
      startTime:  new Date(this.event.startTime),
      endTime: new Date(this.event.endTime),
      allDay: this.event.allDay,
      desc: this.event.desc,
	  id: this.notificationIndex,
	  AMPM: null
    };
	  }
	
	console.log("IS TWELVEHOUR: " + this.isTwelveHour);
	console.log(this.notificationIndex);
    if (eventCopy.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    }

	// add notification when creating event
	//if(this.notificationIndex == null){
	//	this.notificationIndex = 0;

	//}



	
	this.storage.get('userCode').then((val) => {
		  if (val) {
			this.afs.firestore.collection('users').where('code', '==', val)
				.get().then(snapshot => {
			  snapshot.forEach(doc => {
				  this.subtractTime = doc.get('notificationTime');
				  console.log("INIT");
				  console.log("MOOD" + doc.get('notificationTime'));
				  console.log("subTIME init" + this.subtractTime);
				  this.testers = eventCopy.startTime.getMinutes() - this.subtractTime;
				  console.log("TESTERS: " + this.testers);
				  eventCopy.startTime.setMinutes( eventCopy.startTime.getMinutes() - this.subtractTime );
				  console.log(eventCopy.startTime);
				  
				  this.localNotifications.schedule({
					   id: this.notificationIndex,
					   text: 'You have an event, check your calendar!',
					   trigger: {at: new Date(eventCopy.startTime)},
					   led: 'FF0000',
					   sound: null
				    });
					
					
			  });
			});
		  }
		});

	
    
	
	

	var currentID = this.notificationIndex;

	this.eventList.push(eventCopy);

    this.eventSource.push(eventCopy);
	this.test.push('1');

	console.log(JSON.stringify(this.eventSource));
    this.myCal.loadEvents();
	console.log("notification index" +this.notificationIndex);

	this.storageService.addItem(eventCopy).then(item => {

		console.log('?');
      this.loadItems();
	});
	this.localNotifications.schedule({
	   id: this.notificationIndex,
	   text: 'You have an event, check your calendar!',
	   trigger: {at: new Date(this.event.startTime)},
	   led: 'FF0000',
	   sound: null
	});
    this.resetEvent();
    this.showAddEvent = false;

  }

  loadItems() {
    this.storageService.getItems().then(items => {
      this.items = items;
      if (items) {
     this.eventSource = items;
      }
      else{
        console.log('No events');
      }
    });

  }

	getAMPM() {
		this.storage.get('userCode').then((val) => {
		  if (val) {
			this.afs.firestore.collection('users').where('code', '==', val)
				.get().then(snapshot => {
			  snapshot.forEach(doc => {
				  this.clockType = doc.get('clockType');
				  console.log("this.clockType");
				  if(this.clockType == 12){
					  console.log("TRUE");
					  return true;
					  
				  }
				  else{
					  console.log("FALSE");
					  return false;
				  }
				   
					
					
			  });
			});
		  
		}
	});
	}

  getStorage(){
  this.storage.get('name').then((val) => {
    return ['name'];
  });
  }



  showEvent(){
	  this.storage.get('event').then( (val) =>{
		  console.log("value is " + val)
	  })
  }

  next() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slideNext();
  }

  back() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slidePrev();
  }

// Change between month/week/day
  changeMode(mode) {
    this.calendar.mode = mode;
  }

// Focus today
  today() {
    this.calendar.currentDate = new Date();
  }

// Selected date reange and hence title changed
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

// Calendar event was clicked
  async onEventSelected(event) {
    // Use Angular date pipe for conversion
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);
	
	
  
  
	
	const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: [{
		text: 'Edit',
		role: 'edit',
		cssClass: 'secondary',
		handler: (blah) => {
        if(this.showEditEvent === true){
		this.showEditEvent = false;
		}
		else{
			this.showEditEvent = true;
		}
		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {
			console.log("eventSource " + this.eventSource[i].id);
			console.log("eventCopy" + JSON.stringify(this.eventSource[i]));
			console.log("event.id: " + event.id);
			//if (JSON.stringify(eventCopy) === JSON.stringify(this.eventSource[i]) ){
			//	this.deleteIndex = i;
			//}
			if(this.eventSource[i].id === event.id){
				console.log("ONE");
				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);
		console.log("eventsource id to delete: " + this.eventSource[this.deleteIndex].id);

		this.eventSource.splice(this.deleteIndex, 1);
		console.log("notification index");
		console.log("delete Index: " + this.deleteIndex);
		this.storage.set('my-items', this.eventSource);
		this.loadItems();	
      }
    }, 
	{
		text: 'Delete',
		role: 'Delete',
		cssClass: 'secondary',
		handler: (blah) => {
        
		this.confirmDelete(event);
		if(this.confirmDeleteEvent === true){
		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {
			console.log("eventSource " + this.eventSource[i].id);
			console.log("eventCopy" + JSON.stringify(this.eventSource[i]));
			console.log("event.id: " + event.id);
			//if (JSON.stringify(eventCopy) === JSON.stringify(this.eventSource[i]) ){
			//	this.deleteIndex = i;
			//}
			if(this.eventSource[i].id === event.id){
				console.log("ONE");
				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);
		console.log("eventsource id to delete: " + this.eventSource[this.deleteIndex].id);

		this.eventSource.splice(this.deleteIndex, 1);
		console.log("notification index");
		console.log("delete Index: " + this.deleteIndex);
		this.storage.set('my-items', this.eventSource);
		this.loadItems();	
		}
		}
	},
	{
      text: 'Okay',
      handler: () => {
        console.log('Confirm Okay')
      }
    }
  ]
    });
    alert.present();
	
	
	/*
	let eventCopy = {
      title: event.title,
      startTime:  event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      desc: event.desc,
	  id: event.id
    };
	if(this.showEditEvent === true){
		this.showEditEvent = false;
	}
	else{
		this.showEditEvent = true;
	}

	this.length = this.eventSource.length;
	for (let i = 0; i < this.length; i++) {
		console.log("eventSource " + this.eventSource[i].id);
		console.log("eventCopy" + JSON.stringify(this.eventSource[i]));
		console.log("event.id: " + event.id);
		//if (JSON.stringify(eventCopy) === JSON.stringify(this.eventSource[i]) ){
		//	this.deleteIndex = i;
		//}
		if(this.eventSource[i].id === event.id){
			console.log("ONE");
			this.deleteIndex = i;
		}
	}
	var temp = this.deleteIndex;
	this.localNotifications.clear(this.eventSource[this.deleteIndex].id);
	console.log("eventsource id to delete: " + this.eventSource[this.deleteIndex].id);

	this.eventSource.splice(this.deleteIndex, 1);
	console.log("notification index");
	console.log("delete Index: " + this.deleteIndex);
	this.storage.set('my-items', this.eventSource);

	this.loadItems();*/	
  }
  
  async confirmDelete(event){
	const alert = await this.alertCtrl.create({
      header: 'are you sure?',
      subHeader: 'are you sure?',
      buttons: [{
		text: 'Yes',
		role: 'confirm',
		cssClass: 'secondary',
		handler: (blah) => {
		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {
			console.log("eventSource " + this.eventSource[i].id);
			console.log("eventCopy" + JSON.stringify(this.eventSource[i]));
			console.log("event.id: " + event.id);
			//if (JSON.stringify(eventCopy) === JSON.stringify(this.eventSource[i]) ){
			//	this.deleteIndex = i;
			//}
			if(this.eventSource[i].id === event.id){
				console.log("ONE");
				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);
		console.log("eventsource id to delete: " + this.eventSource[this.deleteIndex].id);

		this.eventSource.splice(this.deleteIndex, 1);
		console.log("notification index");
		console.log("delete Index: " + this.deleteIndex);
		this.storage.set('my-items', this.eventSource);
		this.loadItems();	
		this.confirmDeleteEvent = true;
	  }
	  },
	  {
		text: 'cancel',
		role: 'cancel',
		cssClass: 'secondary',
		handler: (blah) => {
		this.confirmDeleteEvent = false;
      }
	  
    }]});
    alert.present();  
  }

// Time slot was clicked
  onTimeSelected(ev) {
    const selected = new Date(ev.selectedTime);
    this.event.startTime = selected.toISOString();
    selected.setHours(selected.getHours() + 1);
    this.event.endTime = (selected.toISOString());
  }
}
