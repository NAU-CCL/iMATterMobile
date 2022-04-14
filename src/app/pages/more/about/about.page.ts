import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  public version: any;
  public model: any;
  public platform: any;
  public osVersion: any;

  constructor(private appVersion: AppVersion, private device: Device) { }

  /*
  * Updating App version. The app version uses a plugin that fetches the version number form the config.xml file. After relasing a new version, update the config.xml with the new version number and it will automaticall sync with this page.
  */
  ngOnInit() {
    this.model = this.device.model;
    this.platform = this.device.platform;
    this.osVersion = this.device.version;
    this.appVersion.getVersionNumber().then(value => {
      this.version = value;
    }).catch(err => {
      alert(err);
    });
  }

}
