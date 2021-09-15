import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore'
import { map, take } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

// declares Survey object interface, making sure every Survey object has these fields
export interface Survey {
    id?: string;
    type: string;
    description: string;
    title: string;
    link: string;
    points: number;
    importance: string;
    characteristics: any;
}


@Injectable({
    providedIn: 'root'
})

export class SurveyService {
    private surveys: Observable<Survey[]>;
    private surveyCollection: AngularFirestoreCollection<Survey>;

    constructor(private angularfs: AngularFirestore) {
        // gets the collection of surveys
        this.surveyCollection = this.angularfs.collection<Survey>('surveys-v2');

        //  looks for changes and updates, also grabs the data
        this.surveys = this.surveyCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
            })
        );
    }

    // gets all of the surveys in the survey collection
    getSurveys() {
        return this.surveys;
    }

    // gets an individual survey with id provided
    getSurvey(id: string) {
        return this.surveyCollection.doc<Survey>(id).valueChanges().pipe(
            take(1),
            map(survey => {
                survey.id = id;
                return survey;
            })
        );
    }

    // adds the survey to the database
    addSurvey(survey: Survey): Promise<DocumentReference> {
        return this.surveyCollection.add(survey);
    }

    // updates the survey in the database
    updateSurvey(survey: Survey): Promise<void> {
        return this.surveyCollection.doc(survey.id).update({
            title: survey.title,
            link: survey.link,
            type: survey.type,
            description: survey.description,
            points: Number(survey.points),
            importance: survey.importance,
            characteristics: survey.characteristics
        });
    }

    // deletes the survey with the id provided
    deleteSurvey(id: string): Promise<void> {
        return this.surveyCollection.doc(id).delete();
    }

    // updates user's answeredSurveys list
    updateAnsweredSurveys(userID: string, answered: any[], available: any[]) {
        this.angularfs.firestore.collection('users')
            .doc(userID).update({ answeredSurveys: answered });
        this.angularfs.firestore.collection('users')
            .doc(userID).update({ availableSurveys: available });
    }
}