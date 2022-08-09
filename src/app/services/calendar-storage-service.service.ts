import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Storage } from '@ionic/storage-angular';


export interface Item {
  // title: string,
  startTime: Date,
  endTime: Date,

  // reminder: Date,


}

const ITEMS_KEY = 'my-items';

@Injectable({
  providedIn: 'root'
})
export class CalendarStorageService {

  public storage: Storage = null;

  constructor(private storageService: StorageService) { }


  getStorage()
  {
    return this.storageService.getStorage()
  }
  // CREATE
  async addItem(item: Item): Promise<any> {
    this.storage = await this.getStorage();

    return this.storage.get(ITEMS_KEY).then((items: Item[]) => {
      if (items) {
        items.push(item);
        return this.storage.set(ITEMS_KEY, items);
      } else {
        return this.storage.set(ITEMS_KEY, [item]);
      }
    });
  }

  // READ
  async getItems(): Promise<Item[]> {
    this.storage = await this.getStorage();
    return this.storage.get(ITEMS_KEY);
  }

  async deleteItem(event): Promise<any> {
    this.storage = await this.getStorage();
    this.storage.remove(event);
    return null;
  }
    //return this.storage.get(ITEMS_KEY).then((items: Item[]) => {
    //  if (items) {
        //items.removeItem(item);
		//this.storage.remove([item]);
     //   return null;
     // } else {
      //  return null;
    //});
  //}

}
