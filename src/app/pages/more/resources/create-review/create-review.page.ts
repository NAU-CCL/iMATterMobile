
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, Query, DocumentData } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormArray } from '@angular/forms';

import { FormGroup, FormControl } from '@angular/forms';

import { FormBuilder } from '@angular/forms';

import { Validators } from '@angular/forms';
import {Review } from '../review-interfaces/review-interfaces'
import { ReviewQuestions } from '../review-interfaces/review-interfaces';
import { GetReviewSurveyService } from '../../../../services/get-review-survey.service'
import { ActivatedRoute, Router } from "@angular/router";

import { LocationService } from "src/app/services/resource.service"
import { Location } from "src/app/services/resource.service"
import { ResourceTypesService } from 'src/app/services/resource-types.service';
import {Storage} from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-create-review',
  templateUrl: './create-review.page.html',
  styleUrls: ['./create-review.page.scss'],
})

export class CreateReviewPage implements OnInit {

  private userID;
  public reviewsCollection: AngularFirestoreCollection;

  // A query for a single resourceReviewQuestions document form the db. Need to call .get.then() on it to get data, see the loadSurveyReviewQuestionsIntoForm method to see how we use the firestore query object.
  public reviewQuestionsQuery: Query<DocumentData>;
  public reviewQuestionsJSON: ReviewQuestions; 

  // All of these arrays are the same length as each index is related to each other. ie this is a group surveyQuestionsArray[0],surveyQuestionTypes[0], surveyTagsArray[0].
  public surveyQuestionsArray: string[];
  public surveyQuestionTypes: string[];
  public surveyTagsArray: string[];

  public questionsLoaded: boolean = false;


  public resourceObj: Location;
  public resourceName: string = "";

  public currentResourceTypes: string[];
  public allResourceTypes: string[];
  public resourceID: number;


  // Each index repesents 1 of 5 stars on the reivew page. False means the star is not filled.
  public rating_array = [false,false,false,false,false];
  // The users 1-5 star rating of the rescource, contains an int between 1-5.
  public selected_rating: number = 1;
  public hasTouchedStars = false;




   // Any explicitly defined FormControls can be retreived using a get method like the one below. get is an AbstractControl method.
   public newReviewForm: FormGroup = this.fb.group({
    reviewSubject: ['', Validators.required],
    reviewText: ['', Validators.required],

    reviewSurveyAnswers: this.fb.array([
    ])

  });
  private storage: Storage = null;
  constructor(private route: ActivatedRoute,
              private afs: AngularFirestore,
              private fb: FormBuilder,
              private reviewSurveyService: GetReviewSurveyService,
              private resourceService: LocationService,
              private resourceTypesService: ResourceTypesService,
              private storageService: StorageService,
              private router: Router,
              public datepipe: DatePipe) {

    // Get the reviews collection so we can add new reviews to it.
    this.reviewsCollection =  this.afs.collection<Review>('resourceReviews');
    this.storage.get('userCode').then( userID =>{
      this.userID = userID;
    })



  }

  async ngOnInit() {
    this.storage = await this.storageService.getStorage();
    // Get the resource ID from the url see resources-routing.module to see where the id param is specified.
    this.route.params.subscribe(params=>{
      this.resourceID = params['id']; 

      this.resourceService.getLocation( this.resourceID.toString() ).subscribe(resource => {
        this.resourceObj = resource;
        this.resourceName = this.resourceObj.title;

        // Get the survey and its questions and load them into the form
        this.loadSurveyReviewQuestionsIntoForm();

        console.log(` THIS RESOURCE: ${JSON.stringify(this.resourceObj) }`);
      });
      
      
    })
  }





  get reviewSurveyAnswers() {
    return this.newReviewForm.get('reviewSurveyAnswers') as FormArray;
  }

  // Get a formcontrol element from our FormGroup newReviewForm so we can display the value as the user types for testing.
  get reviewText()
  {
    return this.newReviewForm.get('reviewText') as FormControl;
  }

  get reviewSubject()
  {
    return this.newReviewForm.get('reviewSubject') as FormControl;
  }

  // Get a formcontrol element from our FormGroup newReviewForm so we can display the value as the user types for testing or get the value the user entered for that form element!.
  get reviewRating()
  {
    return this.newReviewForm.get('reviewRating') as FormControl;
  }

  //ReviewQuestions { review_questions_id: number, is_current: boolean, review_questions: string[], review_question_types: string[], question_tags: string[] }
  loadSurveyReviewQuestionsIntoForm()
  {
    this.reviewQuestionsQuery = this.reviewSurveyService.getReviewQuestionsForResources();

    this.reviewQuestionsQuery.get().then( querySnap => {
      querySnap.forEach( docSnap =>{

        this.reviewQuestionsJSON = docSnap.data() as ReviewQuestions;

        this.surveyQuestionsArray = this.reviewQuestionsJSON['review_questions'];

        this.surveyQuestionTypes = this.reviewQuestionsJSON['review_question_types'];

        this.surveyTagsArray = this.reviewQuestionsJSON['question_tags'];

        //console.log(`SURVEYS ${ JSON.stringify( this.reviewQuestionsJSON ) } `);

        this.currentResourceTypes =  this.resourceObj['type'] as string[];

        //console.log(`Current Resource Types ${this.currentResourceTypes}`);

        // Filter the questions array, types array, and tags array to only questions that apply to this resource are shown!
        // For example, Some questions are only for couseling resources or something similar.
        // Get the types associated with the current resource.
        this.filterSurveyQuestionArrays(this.surveyQuestionsArray, this.surveyQuestionTypes, this.surveyTagsArray );

        // Add an alias aka anonymous form control to the form array. Each alias represents an input for each question asked of the user.
        this.generateSurveyQuestionInputs(this.surveyQuestionsArray);
  
        this.questionsLoaded = true;


      })
    })
    
  }

  addAlias() {
    this.reviewSurveyAnswers.push(this.fb.control(''));
  }




  deleteReview( reviewID: number ) {
  
  }

  // Deletes all reviews from the review collection.
  deleteAllReviews(){
    this.afs.firestore.collection("resourceReviews").get().then( (querySnapshot ) => {
      querySnapshot.forEach( (aReview) => {
          aReview.ref.delete();
      })
    })
  }

  // Return false to prevent form submission.
  submitNewReview()
  {
    console.log(` THIS FORM IS ${JSON.stringify( this.newReviewForm.value ) }`);
    
     let currentDate = new Date();

     for( let index = 0; index < this.reviewSurveyAnswers.value.length; index++)
     {
       console.log(`Survety answers value array ${JSON.stringify(this.reviewSurveyAnswers.value)} INDEX ${JSON.stringify(this.reviewSurveyAnswers.value[index])}`);
       // If the question was not answered, default to na for the answer to this question.
       if( this.reviewSurveyAnswers.value[index] === undefined )
       {
        this.reviewSurveyAnswers.value[index] = 'na';
        console.log(`Converting null to na`);
       }
     }

     console.log(` THIS FORM IS AFTER ${JSON.stringify( this.newReviewForm.value ) }`);

     let reviewObj = { resourceID: this.resourceID,
                       reviewDate: currentDate,
                       userID: this.userID, 
                       reviewSubject: this.reviewSubject.value, 
                       reviewText: this.reviewText.value, 
                       reviewRating: this.selected_rating, 
                       survey_questions: this.surveyQuestionsArray, 
                       survey_answers:  this.reviewSurveyAnswers.value, 
                       survey_tags: this.surveyTagsArray }
     
     this.reviewsCollection.add( reviewObj );

     this.router.navigate([`/tabs/more/resources/${this.resourceID}/`]);
  }

  getAllResourceTypes(surveyQuestionsArray: string[], surveyQuestionTypes: string[], surveyTagsArray: string[] )
  {

    // This query retrieves an array of all available resource types in our db.
    let resourceTypesQuery: Query = this.resourceTypesService.getResourceTypes();

    resourceTypesQuery.get().then( querySnap =>{
      querySnap.forEach( docSnap => {

        // Get all resource types available to be used by resources. Probably can be removed.
        this.allResourceTypes = docSnap.data()['types'] as string[];

        console.log(`ALL RESOURCE TYPES ARRAY: ${this.allResourceTypes }`);

        
      })
    })


  }

    // A resources types field can be: an array, where each index is a single type, or a string that is a references a single type.
    filterSurveyQuestionArrays(surveyQuestionsArray: string[], surveyQuestionTypes: string[], surveyTagsArray: string[] )
    {
      
       let removeArrayIndexes = [];
        // Iterate through each type string for each question. For example, currentQuestionTypeArray will likely look like this ['Housing','Food', 'MAT Provider']
       for( let index = 0; index < surveyQuestionTypes.length; index++ )
       {
         let currentQuestionTypeArray = surveyQuestionTypes[index].split(',');

         let removeQuestion = true; // keeps track of whether we should remove the question. Remove the question until proven otherwise.

         console.log(`Current Question Type array ${currentQuestionTypeArray}`);

        // Iterate through the current question types so we can compare them to the resource types.
        for( let currQuesTypeIndex = 0; currQuesTypeIndex < currentQuestionTypeArray.length; currQuesTypeIndex++)
        { 
          let currentType = currentQuestionTypeArray[currQuesTypeIndex];

          console.log(`All types for current question = ${JSON.stringify(currentQuestionTypeArray)}. Current Question Type ${currentType}. `)

          if( this.currentResourceTypes.includes( currentType ) || currentType === "All" ) // Detirmine if the current question type is inlcluded in the array of types for this resource.
          {
            removeQuestion = false;
          }

        }

        // If the question type was not included in the current resource types array, remove it.
        if( removeQuestion )
        { 
          
          removeArrayIndexes.push(index);
          
        }
          
       }

       // Remove the elements starting with the greatest index. This is to avoid shrinking the array and making our indexes out of bounds.
       for( let deleteIndex = removeArrayIndexes.length - 1; deleteIndex > -1; deleteIndex--)
       {
        console.log(`Element indexes to remove ${JSON.stringify(removeArrayIndexes)}`);
         console.log(`Removing question ${surveyQuestionsArray[removeArrayIndexes[deleteIndex]]} with types ${surveyQuestionTypes[removeArrayIndexes[deleteIndex]]} and tags ${surveyTagsArray[removeArrayIndexes[deleteIndex]]}`);

         // Remove the element at index in these three arrays since they all correspond to each other.
         surveyQuestionsArray.splice( removeArrayIndexes[deleteIndex], 1);
         surveyQuestionTypes.splice( removeArrayIndexes[deleteIndex], 1);
         surveyTagsArray.splice( removeArrayIndexes[deleteIndex], 1);

         console.log(`Questions Array after removing: ${JSON.stringify(surveyQuestionsArray)} with types ${JSON.stringify(surveyQuestionTypes)} and tags ${JSON.stringify(surveyTagsArray)}`);
       }
    }



    // Iterates through each survey question retrived from the database and creates a new Form Control for each which are used in our form builder. See angular reactive forms for more information.
    // Specifically we are using a formbuilder plus a form array. Form arrays allow for elements to be added to a form dynamically.
    generateSurveyQuestionInputs( questions: string[])
    {
  
      for( let index = 0; index < questions.length; index++)
      {
        this.addAlias();
      }
    }

    updateRatingStars( starIndex: number )
    {
  
      this.rating_array = [false,false,false,false,false]
  
      for( let index = 0; index < this.rating_array.length ; index++ )
      {
        if( index <= starIndex )
        {
          this.rating_array[index] = true;
        }
      }
  
      this.selected_rating = starIndex + 1;
  
    }
}
