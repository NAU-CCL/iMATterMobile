import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

declare var google;

@Component({
  selector: 'app-resources',
  templateUrl: './resources.page.html',
  styleUrls: ['./resources.page.scss'],
})

export class ResourcesPage implements OnInit, AfterViewInit {
    @ViewChild('mapElement') mapNativeElement;
    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
      const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
        center: {lat: 39.833332, lng: -98.583336},
        zoom: 8
      });
    }

  }
