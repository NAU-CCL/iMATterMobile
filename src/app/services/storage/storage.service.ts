import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storage_ : Storage | null = null;
  constructor(private storage: Storage) {
   }

   async getStorage(): Promise<Storage>
   {
    if( this.storage_ )
    {
      return this.storage_;
    }
    else
    {
      const storage = await this.storage.create();
      this.storage_ = storage;
      return this.storage_;
    }
   }
}
