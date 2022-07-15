import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';

import {AngularFirestore} from '@angular/fire/compat/firestore';

import {Observable} from 'rxjs';
import * as moment from 'moment';

import { CalendarStorageService, Item } from '../../services/calendar-storage-service.service';
import { StorageService } from 'src/app/services/storage/storage.service';

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

  minDate = moment().toDate().toISOString();

  test = [];
  eventSource = [];
  viewTitle;

  calendar = {
    mode: 'month',
    currentDate: moment().toDate(),
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
	public showAddEvent: boolean;



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
 isTwelveHour: boolean;
 clockType: number;

 clicked: boolean;
 alertOpen: boolean;
 isNotMonthView: boolean;
 deleteEditedEvent: boolean;
 currentlyEditing: boolean;

 editedEvent: any;



 product:any= {};

  // @ts-ignore
  @ViewChild(CalendarComponent) myCal: CalendarComponent;
private storage: Storage = null; 
  constructor(private localNotifications: LocalNotifications,
	          private alertCtrl: AlertController,
			  @Inject(LOCALE_ID) private locale: string,
              private storageService: StorageService,
			  private calStorageService: CalendarStorageService,
			  private afs: AngularFirestore,
              private analyticsService: AnalyticsService,      
			  private router: Router,
			  private calendarComponent: Calendar) {

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

	this.product.content='123';

	}


  async ngOnInit() {
	this.storage = await this.storageService.getStorage();
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.showAddEvent = false;
    this.resetEvent();
	this.loadItems();
	this.addView();
	this.getAmpm();
  }



  resetEvent() {
    this.event = {
      title: '',
      desc: '',
      startTime: moment().toDate().toISOString(),
      endTime: moment().toDate().toISOString(),
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
          this.analytic.timestamp = new Date();
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

  addEventDay(){
	  console.log("CHANGE");
  }

  // Create the right event format and reload source
  addEvent() {
	  this.currentlyEditing = false;
	  this.notificationIndex = Math.floor(Math.random() * 100000000000);
	  let eventCopy = {
		  title: this.event.title,
		  startTime:  moment(this.event.startTime).toDate(),
		  endTime: moment(this.event.endTime).toDate(),
		  allDay: this.event.allDay,
		  desc: this.event.desc,
		  id: this.notificationIndex,
		  AMPM: null
	  }
	  if(this.clockType == 12){
		  let eventCopy = {
		  title: this.event.title,
		  startTime: moment(this.event.startTime).toDate(),
		  endTime: moment(this.event.endTime).toDate(),
		  allDay: this.event.allDay,
		  desc: this.event.desc,
		  id: this.notificationIndex,
		  AMPM: this.event.AMPM
		};

		if (eventCopy.allDay) {
		  let start = eventCopy.startTime;
		  let end = eventCopy.endTime;


		}

		if(eventCopy.startTime.getHours() === 12){
			eventCopy.startTime.setMinutes(eventCopy.startTime.getMinutes() - 720);

		}

		if(eventCopy.AMPM === 'pm'){

			eventCopy.startTime.setMinutes(eventCopy.startTime.getMinutes() + 720);

		}

		this.storage.get('userCode').then((val) => {
			  if (val) {
				this.afs.firestore.collection('users').where('code', '==', val)
					.get().then(snapshot => {
				  snapshot.forEach(doc => {
					  this.subtractTime = doc.get('notificationTime');

					  if(this.subtractTime == null){
						  this.subtractTime = 0;
					  }

					  this.testers = eventCopy.startTime.getMinutes() - this.subtractTime;

					  eventCopy.startTime.setMinutes( eventCopy.startTime.getMinutes() - this.subtractTime );


					  this.localNotifications.schedule({
						   id: this.notificationIndex,
						   text: 'You have an event, check your calendar!',
						   trigger: {at: moment(eventCopy.startTime).toDate()},
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


		this.myCal.loadEvents();


		this.calStorageService.addItem(eventCopy).then(item => {


		  this.loadItems();
		});
		this.localNotifications.schedule({
		   id: this.notificationIndex,
		   text: 'You have an event, check your calendar!',
		   trigger: {at: moment(this.event.startTime).toDate()},
		   led: 'FF0000',
		   sound: null
		});
		this.resetEvent();
		this.showAddEvent = false;


	  }
	  else{



    if (eventCopy.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = moment(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())).toDate();
      eventCopy.endTime = moment(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1)).toDate();
    }


	this.storage.get('userCode').then((val) => {
		  if (val) {
			this.afs.firestore.collection('users').where('code', '==', val)
				.get().then(snapshot => {
			  snapshot.forEach(doc => {
				  this.subtractTime = doc.get('notificationTime');

				  if(this.subtractTime == null){
						this.subtractTime = 0;
					}

				  this.testers = eventCopy.startTime.getMinutes() - this.subtractTime;

				  eventCopy.startTime.setMinutes( eventCopy.startTime.getMinutes() - this.subtractTime );


				  this.localNotifications.schedule({
					   id: this.notificationIndex,
					   text: 'You have an event, check your calendar!',
					   trigger: {at: moment(eventCopy.startTime).toDate()},
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


    this.myCal.loadEvents();


	this.calStorageService.addItem(eventCopy).then(item => {


      this.loadItems();
	});
	this.localNotifications.schedule({
	   id: this.notificationIndex,
	   text: 'You have an event, check your calendar!',
	   trigger: {at: moment(this.event.startTime).toDate()},
	   led: 'FF0000',
	   sound: null
	});
    this.resetEvent();
    this.showAddEvent = false;
	  }

  }

async displayCalendarInfo(){
  const alert = await this.alertCtrl.create({
      message: 'For privacy reasons, this calendar will not sync with phones calendar',
      buttons: ['OK']
  });
  await alert.present();


}


  loadItems() {
    this.calStorageService.getItems().then(items => {
      this.items = items;
      if (items) {
     this.eventSource = items;
      }
      else{
        console.log('No events');
      }
    });

  }

	getAmpm() {
		this.storage.get('userCode').then((val) => {
		  if (val) {
			this.afs.firestore.collection('users').where('code', '==', val)
				.get().then(snapshot => {
			  snapshot.forEach(doc => {
				  this.clockType = doc.get('clockType');

				  if(this.clockType == 24){
					  this.isTwelveHour = false;

					  return true;

				  }
				  else{
					  this.isTwelveHour = true;

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

	if(mode === 'day' || mode === 'week'){
		this.isNotMonthView = true;
	}
	else{
		this.isNotMonthView = false;
	}
  }

// Focus today
  today() {
    this.calendar.currentDate = moment().toDate();
  }

// Selected date reange and hence title changed
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

	storeEditedEvent(ev){
		this.currentlyEditing = true;
		this.event.title = ev.title;
		this.event.desc = ev.desc;
		const selectedStart = moment(ev.startTime).toDate();
		const selectedEnd = moment(ev.endTime).toDate();
		this.event.startTime = selectedStart.toISOString();
		this.event.endTime = selectedEnd.toISOString();

		  this.editedEvent = ev;
	  }

  editCancelled(){
		this.notificationIndex = Math.floor(Math.random() * 100000000000);
	  let eventCopy = {
		  title: this.editedEvent.title,
		  startTime:  moment(this.editedEvent.startTime).toDate(),
		  endTime: moment(this.editedEvent.endTime).toDate(),
		  allDay: this.editedEvent.allDay,
		  desc: this.editedEvent.desc,
		  id: this.notificationIndex,
		  AMPM: null
	  }
	  if(this.clockType == 12){
		  let eventCopy = {
		  title: this.editedEvent.title,
		  startTime:  moment(this.editedEvent.startTime).toDate(),
		  endTime: moment(this.editedEvent.endTime).toDate(),
		  allDay: this.editedEvent.allDay,
		  desc: this.editedEvent.desc,
		  id: this.notificationIndex,
		  AMPM: this.editedEvent.AMPM
		};
		if (eventCopy.allDay) {
		  let start = eventCopy.startTime;
		  let end = eventCopy.endTime;


		}

		if(eventCopy.startTime.getHours() === 12){

			eventCopy.startTime.setMinutes(eventCopy.startTime.getMinutes() - 720);

		}

		if(eventCopy.AMPM === 'pm'){

			eventCopy.startTime.setMinutes(eventCopy.startTime.getMinutes() + 720);

		}

		this.storage.get('userCode').then((val) => {
			  if (val) {
				this.afs.firestore.collection('users').where('code', '==', val)
					.get().then(snapshot => {
				  snapshot.forEach(doc => {
					  this.subtractTime = doc.get('notificationTime');

					  if(this.subtractTime == null){
						  this.subtractTime = 0;
					  }

					  this.testers = eventCopy.startTime.getMinutes() - this.subtractTime;

					  eventCopy.startTime.setMinutes( eventCopy.startTime.getMinutes() - this.subtractTime );


					  this.localNotifications.schedule({
						   id: this.notificationIndex,
						   text: 'You have an event, check your calendar!',
						   trigger: {at: moment(eventCopy.startTime).toDate()},
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


		this.myCal.loadEvents();


		this.calStorageService.addItem(eventCopy).then(item => {

			//lod
		  this.loadItems();
		});
		this.localNotifications.schedule({
		   id: this.notificationIndex,
		   text: 'You have an event, check your calendar!',
		   trigger: {at: moment(this.event.startTime).toDate()},
		   led: 'FF0000',
		   sound: null
		});
		this.resetEvent();
		this.showAddEvent = false;


	  }
	  else{



    if (eventCopy.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = moment(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())).toDate();
      eventCopy.endTime = moment(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1)).toDate();
    }






	this.storage.get('userCode').then((val) => {
		  if (val) {
			this.afs.firestore.collection('users').where('code', '==', val)
				.get().then(snapshot => {
			  snapshot.forEach(doc => {
				  this.subtractTime = doc.get('notificationTime');
				  if(this.subtractTime == null){
						this.subtractTime = 0;
					}
				  this.testers = eventCopy.startTime.getMinutes() - this.subtractTime;
				  eventCopy.startTime.setMinutes( eventCopy.startTime.getMinutes() - this.subtractTime );

				  this.localNotifications.schedule({
					   id: this.notificationIndex,
					   text: 'You have an event, check your calendar!',
					   trigger: {at: moment(eventCopy.startTime).toDate()},
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
    this.myCal.loadEvents();


	this.calStorageService.addItem(eventCopy).then(item => {

		console.log('?');
      this.loadItems();
	});
	this.localNotifications.schedule({
	   id: this.notificationIndex,
	   text: 'You have an event, check your calendar!',
	   trigger: {at: moment(this.event.startTime).toDate()},
	   led: 'FF0000',
	   sound: null
	});
    this.resetEvent();
    this.showAddEvent = false;
	  }


	}

	deleteOrCancelEvent(){
			this.length = this.eventSource.length;
			for (let i = 0; i < this.length; i++) {
				
				if(this.eventSource[i].id === this.editedEvent.id){

					this.deleteIndex = i;
				}
			}
			var temp = this.deleteIndex;
			this.localNotifications.clear(this.eventSource[this.deleteIndex].id);


			this.eventSource.splice(this.deleteIndex, 1);

			this.storage.set('my-items', this.eventSource);
			this.loadItems();
			this.confirmDeleteEvent = true;
			this.editFinished();
			

	   }

// Calendar event was clicked
  async onEventSelected(event) {
    // Use Angular date pipe for conversion
	this.getAmpm();
	console.log("CLICK " + this.clicked);
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);

	this.alertOpen = true;



	const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: [{
		text: 'Edit',
		role: 'edit',
		cssClass: 'secondary',
		handler: (handle) => {
		this.storeEditedEvent(event);
        if(this.showEditEvent === true){
		this.showEditEvent = false;
		}
		else{
			this.showEditEvent = true;
		}

		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {

			
			if(this.eventSource[i].id === event.id){

				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);

		this.eventSource.splice(this.deleteIndex, 1);

		this.storage.set('my-items', this.eventSource);
		this.loadItems();
		this.alertOpen = false;

      }
    },
	{
		text: 'Delete',
		role: 'Delete',
		cssClass: 'secondary',
		handler: (handle) => {

		this.confirmDelete(event);
		this.reloadItems(event);
		this.reloadItems(event);
		
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
	

	
  }
  async reloadItems(event){
	  this.storage.set('my-items', this.eventSource);
		this.loadItems();
  }



  async confirmDelete(event){
	  this.alertOpen = true;
	const alert = await this.alertCtrl.create({
      header: 'are you sure?',
      buttons: [{
		text: 'Yes',
		role: 'confirm',
		cssClass: 'secondary',
		handler: (handle) => {

		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {
			
			if(this.eventSource[i].id === event.id){

				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);
		

		this.eventSource.splice(this.deleteIndex, 1);

		this.storage.set('my-items', this.eventSource);
		this.loadItems();
		this.confirmDeleteEvent = true;
		this.deleteFinished(event);


	  }
	  },
	  {
		text: 'cancel',
		role: 'cancel',
		cssClass: 'secondary',
		handler: (handle) => {
		this.confirmDeleteEvent = false;
		this.alertOpen = false;

      }

    }]});
    alert.present();

  }

  async editFinished(){

	  const alert = await this.alertCtrl.create({
      header: 'Event has been edited',
      subHeader: '',
      buttons: [{
		text: 'Ok',
		role: 'confirm',
		cssClass: 'secondary',
		handler: (handle) => {
			
		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {
			
			if(this.eventSource[i].id === this.editedEvent.id){
				
				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);


		this.eventSource.splice(this.deleteIndex, 1);

		this.storage.set('my-items', this.eventSource);
		this.loadItems();
		this.confirmDeleteEvent = true;
		
	  }



    }]});
    alert.present();
  }

  


  async deleteFinished(event){
	  const alert = await this.alertCtrl.create({
      header: 'Event has been deleted',
      subHeader: '',
      buttons: [{
		text: 'Ok',
		role: 'confirm',
		cssClass: 'secondary',
		handler: (handle) => {
			
		this.length = this.eventSource.length;
		for (let i = 0; i < this.length; i++) {
			
			if(this.eventSource[i].id === event.id){
				
				this.deleteIndex = i;
			}
		}
		var temp = this.deleteIndex;
		this.localNotifications.clear(this.eventSource[this.deleteIndex].id);
		console.log("eventsource id to delete: " + this.eventSource[this.deleteIndex].id);

		this.eventSource.splice(this.deleteIndex, 1);
		
		this.storage.set('my-items', this.eventSource);
		this.loadItems();
		this.confirmDeleteEvent = true;
		

	  }



    }]});
    alert.present();
	  

  }

// Time slot was clicked
  onTimeSelected(ev) {
	  console.log("DAY");
	  if(this.currentlyEditing === true){
		  console.log("editing");
	  }
	  else{
		const selected = moment(ev.selectedTime).toDate();
		this.event.startTime = selected.toISOString();
		selected.setHours(selected.getHours() + 1);
		this.event.endTime = (selected.toISOString());
	  }



  }
  async addToThisDay(){
	  if(this.clicked === true && this.alertOpen !== true && this.isNotMonthView !== true){
		  
	  const alert = await this.alertCtrl.create({
      header: 'Would you like to add an event to this day?',
      buttons: [{
		text: 'Yes',
		role: 'confirm',
		cssClass: 'secondary',
		handler: (handle) => {
		this.getAmpm();
		this.showAddEvent = true;

	  }
	  },
	  {
		text: 'cancel',
		role: 'cancel',
		cssClass: 'secondary',
		handler: (handle) => {
		this.confirmDeleteEvent = false;

      }

    }]});
    alert.present();
	  }
	  this.alertOpen = false;

  }
  clickedCalendar(){
	  if(this.alertOpen === true){

		  this.clicked = false;

	  }
	  else{

	  this.clicked = true;
	  this.addToThisDay();
	  }
  }

}
