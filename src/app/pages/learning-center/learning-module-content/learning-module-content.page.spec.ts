import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearningModuleContentPage } from './learning-module-content.page';

describe('LearningModuleContentPage', () => {
  let component: LearningModuleContentPage;
  let fixture: ComponentFixture<LearningModuleContentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningModuleContentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LearningModuleContentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*it('should do something', () => {
    expect(component.learningModule).toContain('moduleTitle');
  });*/
});
