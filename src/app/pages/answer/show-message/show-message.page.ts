import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-show-message',
  templateUrl: './show-message.page.html',
  styleUrls: ['./show-message.page.scss'],
})
export class ShowMessagePage implements OnInit {

  data = "";

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  async closeModal() {
    await this.modalController.dismiss(this.data);
  }

}
