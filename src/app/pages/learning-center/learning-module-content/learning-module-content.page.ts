import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningModuleService, LearningModule, Question } from '../../../services/learningModule/learning-module.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FormGroup, FormControl } from '@angular/forms'
import { userInfo } from 'os';

@Component({
  selector: 'app-learning-module-content',
  templateUrl: './learning-module-content.page.html',
  styleUrls: ['./learning-module-content.page.scss'],
})

/**
 * Youtube video stuff written with help from this article: 
 * https://medium.com/@gouravkajal/integrate-youtube-iframe-player-api-in-angular-98ab9661aff6
 */

export class LearningModuleContentPage implements OnInit {

  learningModule: LearningModule = 
  {
    moduleTitle: '',
    moduleDescription: '',
    moduleContent: '',
    moduleVideoID: '',
    modulePPTurl: '',
    moduleVisibilityTime: [''],
    moduleQuiz: [],
    modulePointsWorth: 0,
    moduleNext: ''
  }

  quizQuestions: Question =
  {
    questionText: '',
    choice1: '',
    choice2: '',
    choice3: '',
    choice4: '',
    correctAnswer: '',
    pointsWorth: 0,
    userSelection: ''
  }

  //Powerpoint Variables
  sanitizedPPTurl: SafeResourceUrl;  

  //Quiz Variables
  totalNumberQuizQuestions = 0;
  numberQuestionsCorrect;
  numberTimesQuizTaken;
  quizSubmissionLimit = 3; //if changed, change this hardcoded number in presentPreventSubmit()
  didSubmit; //boolean to enable/disable quiz submit button
  quizForm; //used for quiz form in order to be able to clear selections
  quizSelections;
  correctQuestions; //list of questions user got correct

  //YouTube Video variables
  public YT: any;
  public video: any;
  public player: any;
  videoHasEnded: boolean;
  
  constructor(
    private activatedRoute: ActivatedRoute, 
    private learningModuleService: LearningModuleService,
    public domSanitizer: DomSanitizer,
    public toastController: ToastController,
    private storage: Storage) 
    { 
      this.quizForm = new FormGroup({
        "quizSelections": new FormControl()});
    }

  ngOnInit() 
  {}
  
  ionViewWillEnter()
  {
    let id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id)
    {
      this.learningModuleService.getLearningModule(id).subscribe(learningModule => {
        this.learningModule = learningModule;

        //If there is a YouTube video
        if (learningModule.moduleVideoID != '')
        {
          //initialize the YouTube video player
          this.youtubeIframeInit();
        }
        
        //If there is a PPT URL
        if (learningModule.modulePPTurl != '')
        {
          //need to sanitize the url for the powerpoint, otherwise there will be security complaint and it won't show
          this.sanitizedPPTurl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.learningModule.modulePPTurl);
        }
        
        //count number of questions in this module
        this.countQuestions();

      });
      //this line is important!! attaches the ID to the learning module so the content for that LM shows up
      this.learningModule.id = id;

      //IMPORTANT! initializes variables for learning module (retrieves from storage when applicable)
      this.initializeStorage();
    }
  }

  /**
   * Initializes local storage for the specific learning module
   * If first time in module, initializes variables to what they should be
   * If not first time, retrieves the saved values from storage
   */
  initializeStorage()
  {
    //VideoHasEnded
    this.storage.get(this.learningModule.id + "videoHasEnded").then(value => {
      if (value != null) //not first time in module
      {
        this.videoHasEnded = value;
        console.log('videohasended: '+ this.videoHasEnded);
      }
      else //first time in module
      {
        this.videoHasEnded = false;
      }
      
      }).catch(e => {
      
      console.log('error retrieving videoHasEnded: '+ e);
      
      });

    //NumberTimesQuizTaken
    this.storage.get(this.learningModule.id + "numberTimesQuizTaken").then(value => {
      if (value != null) //not first time in module
      {
        this.numberTimesQuizTaken = value;
        console.log('numbertimesquiztaken: '+ this.numberTimesQuizTaken);      
      }
      else //first time in module
      {
        this.numberTimesQuizTaken = 0;
      }
      
      }).catch(e => {
      
      console.log('error retrieving numberTimesQuizTaken: '+ e);
      
      });

    //NumberQuestionsCorrect
    this.storage.get(this.learningModule.id + "numberQuestionsCorrect").then(value => {
      if (value != null) //not first time in module
      {
        this.numberQuestionsCorrect = value;
        console.log('numberquestionscorrect: '+ this.numberQuestionsCorrect);
      }
      else //first time in module
      {
        this.numberQuestionsCorrect = 0;
      }
      
      }).catch(e => {
      
      console.log('error retrieving numberTimesQuizTaken: '+ e);
      
      });

    //DidSubmit - whether they've submitted quiz
    this.storage.get(this.learningModule.id + "didSubmit").then(value => {
      if (value != null) //not first time in module
      {
        this.didSubmit = value;
        console.log('didSubmit: '+ this.didSubmit);
      }
      else //first time in module
      {
        this.didSubmit = false;
      }
      
      }).catch(e => {
      
      console.log('error retrieving didSubmit: '+ e);
      
      });

    //CorrectQuestions (quiz)
    this.storage.get(this.learningModule.id + "correctQuestions").then(value => {
      if (value != null) //not first time in module
      {
        this.correctQuestions = value;
        console.log('correctQuestions: '+ this.correctQuestions);
      }
      else //first time in module
      {
        this.correctQuestions = [''];
      }
      
      }).catch(e => {
      
      console.log('error retrieving correctQuestions: '+ e);
      
      });
  }

  /**
   * Specific function for using YouTube API to track whether video has ended
   * Refer to tutorial linked above
   */
  youtubeIframeInit()
  { 
    if (window['YT'])
    {
      this.startVideo();
      return;
    }

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window['onYouTubeIframeAPIReady'] = () => this.startVideo();
  }

  startVideo()
  {
    this.player = new window['YT'].Player('player'+ this.learningModule.id, //IMPORTANT: give every player a unique id 
    {
      videoId: this.learningModule.moduleVideoID,
      playerVars: 
      {
        controls: 1, //allow user control of video
        fs: 1, //fullscreen allowed
        playsinline: 1,
        modestbranding: 1,
        rel: 0, //related videos only from same youtube channel - can't completely disable all related videos
        disablekb: 1, //disable keyboard controls so can't use keys to skip forward
        autoplay: 0
      },
      events:
      {
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onReady': this.onPlayerReady.bind(this),
      }
    });
  }

  onPlayerReady(event)
  {
    event.target.playVideo();
  }

  onPlayerStateChange(event)
  {
    //code 0 means video has ended
    if (event.data == 0)
    {
      this.videoHasEnded = true;
      this.storage.set(this.learningModule.id + "videoHasEnded", this.videoHasEnded);
    }
  }


  //Get the total number of quiz questions
  countQuestions()
  {
    this.learningModule.moduleQuiz.forEach(element => {
        this.totalNumberQuizQuestions += 1;
    });
  }


  /**
   * Updates the user's answer selection in the correct Question every time the selection changes
   */
  quizRadioChange(questionName, event)
  {
    this.learningModule.moduleQuiz.forEach(element => {
      if (element.questionText === questionName)
      {
        element.userSelection = event.detail.value;
      }
      
    });
  }

  /**
   * If the user hasn't exceeded quiz submission limit, handles checking their selections
   * against the correct answers and counting the number of questions that are correct.
   */
  quizSubmit()
  {
    this.didSubmit = true;
    this.storage.set(this.learningModule.id + "didSubmit", this.didSubmit);

    //Check quiz limit has not been reached
    if (this.numberTimesQuizTaken < this.quizSubmissionLimit)
    {
      //reset this number for each submit AND reset list of correct questions
      if (this.numberQuestionsCorrect > 0)
      {
        this.correctQuestions = [''];
        this.numberQuestionsCorrect = 0;
      }
      //Check if user's selections are correct
      //Increment number of questions correct
      this.learningModule.moduleQuiz.forEach(element => {
        if (element.correctAnswer === element.userSelection)
        {
          //Add this question to the list of ones they got correct
          this.correctQuestions.push(element.questionText);

          this.numberQuestionsCorrect += 1;
          this.storage.set(this.learningModule.id + "numberQuestionsCorrect", this.numberQuestionsCorrect);
        }

      });

      //Store the list of questions they got correct
      this.storage.set(this.learningModule.id + "correctQuestions", this.correctQuestions);

      this.numberTimesQuizTaken += 1;
      this.storage.set(this.learningModule.id + "numberTimesQuizTaken", this.numberTimesQuizTaken);
    }
    else
    {
      //If the quiz taking limit is exceeded
      this.presentPreventSubmit();
    }
  }

  /**
   * If user clicks on button to retake the quiz, radio selections and didSubmit will be reset
   */
  retakeQuiz()
  {
    this.quizForm.controls.quizSelections.reset();
    this.didSubmit = false;
    this.storage.set(this.learningModule.id + "didSubmit", this.didSubmit);

  }

  /**
   * Present a toast telling the user their limit is reached
   */
  async presentPreventSubmit()
  {
    const toast = await this.toastController.create({
      header: 'Quiz Limit Reached',
      message: "You've reached the limit of 3 quiz submissions.",
      position: 'bottom',
      buttons: [
        {
          text: 'Okay',
          role: 'cancel',
        }
      ]
    });
    toast.present();
  }


  clearStorage()
  {
    this.storage.clear();
  }

}
