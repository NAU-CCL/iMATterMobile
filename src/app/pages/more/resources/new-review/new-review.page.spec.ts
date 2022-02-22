import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewReviewPage } from './new-review.page';

describe('NewReviewPage', () => {
  let component: NewReviewPage;
  let fixture: ComponentFixture<NewReviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewReviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
