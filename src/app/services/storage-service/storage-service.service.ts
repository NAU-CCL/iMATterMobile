import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageServiceService {

  public storageBehaviorSub: BehaviorSubject<Storage | null> = new BehaviorSubject<Storage | null>(null);

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

   /*
   public getStorage()
   {

    this.storageBehaviorSub.asObservable().pipe( filter( emittedVal => !!emittedVal ) ).subscribe( ( storage) => {
      return storage;
    });
   }
   */
}
