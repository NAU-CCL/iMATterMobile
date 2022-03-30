import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-review-tag-popover',
  templateUrl: './review-tag-popover.component.html',
  styleUrls: ['./review-tag-popover.component.scss'],
})
// This component is used as a popup on individual resource pages in order to display information about a specific review tag.
export class ReviewTagPopoverComponent implements OnInit {

  // Answers to current tag/question
  public tagInfo;
  // Name of the current tag.
  public tagName;

  // A short sentence describing the tag/question results.
  public tagSummary;

  constructor(public navParams: NavParams) { }

  ngOnInit()
  {
    
    this.tagInfo = this.navParams.get('tagObject');

    this.tagName = this.navParams.get('tagName');

    console.log(`Tag Object in popup ${JSON.stringify(this.tagInfo)}`); // For some reason when you pass params to a popover you need to use navParams to access the data. Could only find a stack overflow post explaining why. Official docs had nothing

    this.generateReviewSummary()
  }


  // Generate a string that says if all people answered yes, no, or if the answers are mixed.
  generateReviewSummary()
  {
    let yes = this.tagInfo.yes;
    let no = this.tagInfo.no;
    let na = this.tagInfo.na;
    

      if( yes != 0 && no == 0)
      {
        this.tagSummary = `Overall, this question received positive feedback. All respondents answered either "Yes" or "Don't Know" to this quesiton.`;
      }
      else if( yes == 0 && no != 0 )
      {
        this.tagSummary = `Overall, this question received negative feedback. All respondents answered either "No" or "Don't Know" to this quesiton.`;
      }
      else
      {
        this.tagSummary = `Overall, this question received mixed feedback. Respondents answered a mix of "Yes", "No", or "Don't Know" to this question.`;
      }

  }


}
