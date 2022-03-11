
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
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

@Component({
  selector: 'app-create-review',
  templateUrl: './create-review.page.html',
  styleUrls: ['./create-review.page.scss'],
})

export class CreateReviewPage implements OnInit {

  private userID;
  public reviewsCollection: AngularFirestoreCollection;

  // A query for a single resourceReviewQuestions document form the db. Need to call .get.then() on it to get data, see the loadSurveyReviewQuestionsIntoForm method to see how we use the firestore query object.
  public reviewQuestionsQuery: Query;
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
  public rating_array = [true,false,false,false,false]
  // The users 1-5 star rating of the rescource, contains an int between 1-5.
  public selected_rating: number = 1;




   // Any explicitly defined FormControls can be retreived using a get method like the one below. get is an AbstractControl method.
   public newReviewForm: FormGroup = this.fb.group({
    reviewSubject: ['', Validators.required],
    reviewText: ['', Validators.required],

    reviewSurveyAnswers: this.fb.array([
    ])

  });

  constructor(private route: ActivatedRoute,
              private afs: AngularFirestore,
              private fb: FormBuilder,
              private reviewSurveyService: GetReviewSurveyService,
              private resourceService: LocationService,
              private resourceTypesService: ResourceTypesService,
              private storage: Storage,
              private router: Router,
              public datepipe: DatePipe) {

    // Get the reviews collection so we can add new reviews to it.
    this.reviewsCollection =  this.afs.collection<Review>('resourceReviews');
    this.storage.get('userCode').then( userID =>{
      this.userID = userID;
    })



  }

  ngOnInit() {

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


  loadSurveyReviewQuestionsIntoForm()
  {
    this.reviewQuestionsQuery = this.reviewSurveyService.getReviewQuestionsForResources();

    this.reviewQuestionsQuery.get().then( querySnap => {
      querySnap.forEach( docSnap =>{

        this.reviewQuestionsJSON = docSnap.data() as ReviewQuestions;

        this.surveyQuestionsArray = this.reviewQuestionsJSON['review_questions'];

        this.surveyQuestionTypes = this.reviewQuestionsJSON['review_question_types'];

        this.surveyTagsArray = this.reviewQuestionsJSON['question_tags'];

        console.log(`SURVEYS ${ JSON.stringify( this.reviewQuestionsJSON ) } `);

        // Filter the questions array, types array, and tags array to only questions that apply to this resource are shown!
        // For example, Some questions are only for couseling resources or something similar.
        this.getAllResourceTypes( this.surveyQuestionsArray, this.surveyQuestionTypes, this.surveyTagsArray);


      })
    })
    
  }

  addAlias() {
    this.reviewSurveyAnswers.push(this.fb.control('', Validators.required));
  }




  deleteReview( reviewID: number ) {
    //let new_rev: Review = {name: "hi"}

    // Pass the collection an interface and it will be saved to the database in the specified collection.
    //this.reviewsCollection.add( review );
  }

  // Deletes all reviews from the review collection.
  deleteAllReviews(){
    this.afs.firestore.collection("resourceReviews").get().then( (querySnapshot ) => {
      querySnapshot.forEach( (aReview) => {
          aReview.ref.delete();
      })
    })
  }

  submitNewReview()
  {
    console.log(` THIS FORM IS ${JSON.stringify( this.newReviewForm.value ) }`);
    
     let currentDate = new Date();

     // The date is saved as a string!!!
     let stringDate = this.datepipe.transform(currentDate, 'yyyy-MM-dd');

     let reviewObj = { resourceID: this.resourceID, reviewDate: stringDate, userID: this.userID, reviewSubject: this.reviewSubject.value, reviewText: this.reviewText.value, reviewRating: this.selected_rating, survey_answers:  this.reviewSurveyAnswers.value, survey_tags: this.surveyTagsArray }
     
     this.reviewsCollection.add( reviewObj );

     this.router.navigate([`/tabs/more/resources/${this.resourceID}/`]);
     
  }

  getAllResourceTypes(surveyQuestionsArray: string[], surveyQuestionTypes: string[], surveyTagsArray: string[] )
  {
    //this.allResourceTypes 

    let resourceTypesQuery: Query = this.resourceTypesService.getResourceTypes();

    resourceTypesQuery.get().then( querySnap =>{
      querySnap.forEach( docSnap => {
        this.allResourceTypes = docSnap.data()['types'] as string[];

        console.log(`ALL RESOURCE TYPES ARRAY: ${this.allResourceTypes }`);

        this.currentResourceTypes =  this.resourceObj['type'] as string[];

        console.log(`Current Resource Types ${this.currentResourceTypes}`)

        //this.filterSurveyQuestionArrays(surveyQuestionsArray, surveyQuestionTypes, surveyTagsArray )

        this.generateSurveyQuestionInputs(this.surveyQuestionsArray);
  
        this.questionsLoaded = true;
      })
    })


  }

    filterSurveyQuestionArrays(surveyQuestionsArray: string[], surveyQuestionTypes: string[], surveyTagsArray: string[] )
    {

       for( let index =0 ; index < surveyQuestionTypes.length; index++ )
       {
          if( surveyQuestionTypes[index] != 'all')
          {
            // If the current survey question types is not included inside the current resource types array, remove the question, and the associated tag and type.
            // In other words, if this question does not apply to this survey, remove it.
           if( !this.currentResourceTypes.includes(surveyQuestionTypes[index] ) )
           {
            
           }
          }
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
