import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';



export interface Quote {
    id?: string;
    quote: string;
}


@Injectable({
    providedIn: 'root'
})


export class QuoteService {

    private quotes: Observable<Quote[]>;
    private quotesCollection: AngularFirestoreCollection<Quote>;

    constructor(private afs: AngularFirestore) {
        this.quotesCollection = this.afs.collection<Quote>('quotes');
        this.quotes = this.quotesCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
            })
        );
    }

    getAllQuotes(): Observable<Quote[]> {
        return this.quotes;
    }

    getQuotes(id: string): Observable<Quote> {
        return this.quotesCollection.doc<Quote>(id).valueChanges().pipe(
            take(1),
            map(quotes => {
                quotes.id = id;
                return quotes;
            })
        );
    }
}
