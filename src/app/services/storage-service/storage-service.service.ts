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
    this.init();
   }

   async init()
   {
    const storage = await this.storage.create();
    this.storage_ = storage;
    this.storageBehaviorSub.next(this.storage_);
   }

   public getStorage(): Observable<Storage> 
   {
    return firstValueFrom(this.storageBehaviorSub.asObservable().pipe( filter( emittedVal => !!emittedVal ) ));
   }
}
