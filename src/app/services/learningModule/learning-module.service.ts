import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * This code written with the help of this tutorial:
 * https://devdactic.com/ionic-4-firebase-angularfire-2/
 * Used for storing and accessing learning module info in the database
 */
export interface LearningModule 
{
  id?:string, //this is ID of the new document added to the database, very important!
  moduleTitle: string,
  moduleDescription: string,
  moduleVideoID?: string, //YouTube video ID, optional
  modulePPTurl?: string, //powerpoint URL, optional
  moduleContent: string,
  moduleVisibilityTime: string,
  moduleExpiration: number,
  moduleActive: boolean,
  moduleQuiz: Question[],
  modulePointsWorth: number,
  moduleNext?: string, //ID of next learning module to go to, optional
  userVisibility: string[]
}

export interface Question
{
  questionText: string,
  choice1: string,
  choice2: string,
  choice3: string,
  choice4: string,
  correctAnswer: string,
  pointsWorth: number,
  userSelection: string
}

@Injectable({
  providedIn: 'root'
})
export class LearningModuleService {

  private learningModules: Observable<LearningModule[]>;
  private learningModuleCollection: AngularFirestoreCollection<LearningModule>;

  constructor(private afs: AngularFirestore) 
  {  }

  getLMCollection()
  {
    this.learningModuleCollection = this.afs.collection<LearningModule>('learningModules');
    this.learningModules = this.learningModuleCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getAllLearningModules(): Observable<LearningModule[]>
  {
    this.getLMCollection();
    return this.learningModules;
  }

  getLearningModule(id:string): Observable<LearningModule>
  {
    return this.learningModuleCollection.doc<LearningModule>(id).valueChanges().pipe(
      take(1),
      map(learningModule => {
        learningModule.id = id;
        return learningModule
      })
    );
  }

}

