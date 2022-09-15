import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';


@Component({
  selector: 'app-request-access',
  templateUrl: './request-access.page.html',
  styleUrls: ['./request-access.page.scss'],
})
export class RequestAccessPage implements OnInit {

  constructor(
    private browser: InAppBrowser
  ) { }

  ngOnInit() {}

  openRequestPage():void{

    const options: InAppBrowserOptions = {
      hideurlbar: 'yes',
      toolbarcolor: '#ffffff',
  };

  let url = 'https://imatter-nau.web.app/request-access'

    const page = this.browser.create( url, `_blank`, options );
  }

}
