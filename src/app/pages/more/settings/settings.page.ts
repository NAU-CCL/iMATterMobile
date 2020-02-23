import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  private chatNotif: boolean;

  constructor() {
    this.chatNotif = true;
  }

  ngOnInit() {

  }



}
