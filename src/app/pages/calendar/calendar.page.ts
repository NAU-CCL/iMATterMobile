import { CalendarComponent } from 'ionic2-calendar/calendar';
import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import * as moment from 'moment';

import { StorageService, Item } from '../../services/storage.service';

/**
 * This code written with the help of this tutorial:
 * https://devdactic.com/ionic-4-calendar-app/
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
    allDay: false
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

  length : number;
  private showAddEvent: boolean;
  

  items: Item[] = [];
  newItem: Item = <Item>{};
  
  deleteIndex : number;
  
  
  // @ts-ignore
  @ViewChild(CalendarComponent) myCal: CalendarComponent;

  constructor(private localNotifications: LocalNotifications, private alertCtrl: AlertController, @Inject(LOCALE_ID) private locale: string,
              private storage: Storage, private storageService: StorageService, private router: Router) {
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
  }

  
  resetEvent() {
    this.event = {
      title: '',
      desc: '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      allDay: false
    };
  }
  deleteEvent(){
	  //window.plugins.calendar.deleteEvent(newTitle,eventLocation,notes,startDate,endDate,success,error);
  }

  // Create the right event format and reload source
  addEvent() {
    let eventCopy = {
      title: this.event.title,
      startTime:  new Date(this.event.startTime),
      endTime: new Date(this.event.endTime),
      allDay: this.event.allDay,
      desc: this.event.desc
	  
    };

    if (eventCopy.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;

      eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    }

	// add notification when creating event
	this.localNotifications.schedule({
	   text: 'You have an event, check your calendar!',
	   trigger: {at: new Date(this.event.startTime)},
	   led: 'FF0000',
	   sound: null
	});
	
	
	this.eventList.push(eventCopy);
	
    this.eventSource.push(eventCopy);
	this.test.push('1');
	//this.test = localStorage.setItem('event', JSON.stringify(this.eventSource));
	console.log(JSON.stringify(this.eventSource));
    this.myCal.loadEvents();
	
	
	this.storageService.addItem(eventCopy).then(item => {
      //eventCopy = <Item>{};
      //this.showToast('Event Added!');
		console.log('?');
      this.loadItems();
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
  
  getStorage(){
  this.storage.get('name').then((val) => {
    return ['name'];
  });
  }
  
  cancelNotification(){
	  /*LocalNotifications.getPending().then( res => {
      var index = res.notifications.map(x => {
        return x["id"];
      }).indexOf("10000000");
      res.notifications.splice(index, 1);
      LocalNotifications.cancel(res);
    }, err => {
      console.log(err);
    })*/
  }

//showEvents(){
	//this.storage.get(this.key).then(value => {
    //this.user = JSON.parse(value);
//});
//}

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
    
	let eventCopy = {
      title: event.title,
      startTime:  event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      desc: event.desc
	  
    };
	
	console.log(this.eventSource.length);
	console.log(this.eventList.length);
	length = this.eventSource.length;
	for (let i = 0; i < 3; i++) {
		if (eventSource[i] == eventCopy){
			deleteIndex = i;
		}
	}
	
	this.eventSource.splice(deleteIndex, 1);
	storage.set('key',data);
	
	//this.storageService.deleteItem(event);
	
    //const alert = await this.alertCtrl.create({
     // header: event.title,
     // subHeader: event.desc,
     // message: 'From: ' + start + '<br><br>To: ' + end,
      //buttons: ['OK']
    //});
   // alert.present();
	
  }

// Time slot was clicked
  onTimeSelected(ev) {
    const selected = new Date(ev.selectedTime);
    this.event.startTime = selected.toISOString();
    selected.setHours(selected.getHours() + 1);
    this.event.endTime = (selected.toISOString());
  }
}