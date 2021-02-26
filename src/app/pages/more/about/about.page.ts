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
  public android: any;

  constructor(private appVersion: AppVersion, private device: Device) { }

  ngOnInit() {
    this.appVersion.getVersionNumber().then((version) => {
      this.version = version;
      console.log(version);
    });
    this.android = this.device.uuid;
  }

}
