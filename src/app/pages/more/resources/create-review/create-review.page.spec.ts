import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateReviewPage } from './create-review.page';

describe('CreateReviewPage', () => {
  let component: CreateReviewPage;
  let fixture: ComponentFixture<CreateReviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateReviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
