import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
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

  constructor(private storage: Storage) { }

  // CREATE
  addItem(item: Item): Promise<any> {
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
  getItems(): Promise<Item[]> {
    return this.storage.get(ITEMS_KEY);
  }

  deleteItem(event): Promise<any> {
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
