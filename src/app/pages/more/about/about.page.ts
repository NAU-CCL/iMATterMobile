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

  ngOnInit() {
    this.appVersion.getVersionNumber().then((version) => {
      this.version = version;
      console.log(version);
    });
    this.model = this.device.model;
    this.platform = this.device.platform;
    this.osVersion = this.device.version;
  }

}
