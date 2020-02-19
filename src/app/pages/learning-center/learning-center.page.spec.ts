import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearningCenterPage } from './learning-center.page';

describe('LearningCenterPage', () => {
  let component: LearningCenterPage;
  let fixture: ComponentFixture<LearningCenterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningCenterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LearningCenterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
